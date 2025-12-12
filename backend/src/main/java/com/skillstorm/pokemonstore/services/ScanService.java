package com.skillstorm.pokemonstore.services;

import com.google.cloud.vision.v1.*;
import com.google.protobuf.ByteString;
import com.skillstorm.pokemonstore.models.CardDefinition;
import com.skillstorm.pokemonstore.repositories.CardDefinitionRepository;

import nu.pattern.OpenCV;

import org.opencv.core.DMatch;
import org.opencv.core.Mat;
import org.opencv.core.MatOfByte;
import org.opencv.core.MatOfDMatch;
import org.opencv.core.MatOfKeyPoint;
import org.opencv.features2d.BFMatcher;
import org.opencv.features2d.ORB;
import org.opencv.imgcodecs.Imgcodecs;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Paths;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import javax.annotation.PostConstruct;

/**
 * Service responsible for identifying Pokémon cards from user-uploaded images.
 * <p>
 * This service employs a multi-stage identification pipeline:
 * <ol>
 * <li><strong>OCR (Optical Character Recognition):</strong> Uses Google Cloud Vision API to extract raw text from the image.</li>
 * <li><strong>Database Filtering:</strong> Parses the extracted text (Name, HP) to query the database for a list of potential candidates.</li>
 * <li><strong>Visual Re-Ranking (OpenCV):</strong> Uses ORB Feature Matching to compare the uploaded image against the official digital images of the candidates to find the exact match.</li>
 * </ol>
 * </p>
 */
@Service
public class ScanService {

    private final CardDefinitionRepository cardRepo;

    public ScanService(CardDefinitionRepository cardRepo) {
        this.cardRepo = cardRepo;
    }

    /**
     * Initializes the native OpenCV library.
     * <p>
     * This method is called automatically after dependency injection to ensure
     * that native binaries are loaded before any image processing occurs.
     * </p>
     */
    @PostConstruct
    public void init() {
        OpenCV.loadLocally();
    }

    /**
     * Orchestrates the full identification process for a single card image.
     *
     * @param base64Image The raw Base64 encoded string of the uploaded image.
     * @return A list of {@link CardDefinition} objects. If a clear visual match is found,
     * the list contains only that single winner. Otherwise, it returns the top text-based candidates.
     * @throws IOException If there are errors decoding the image or reading files from disk.
     */
    public List<CardDefinition> identifyBestMatch(String base64Image) throws IOException {
        
        System.out.println("Processing Scan... (" + base64Image.length() + " chars)");

        // 1. Get Text from Google Vision
        String detectedText = detectText(base64Image);
        
        // 2. Find Matches from Library Service
        List<CardDefinition> candidates = findMatchesFromTextScan(detectedText);
        
        System.out.println("Found " + candidates.size() + " matches in DB.");

        // Optimization: If 0 or 1 match, no need to run expensive visual comparison
        if (candidates.size() <= 1) {
            return candidates;
        }

        // 3. Prepare for Visual Re-Ranking
        // Clean the Base64 string if it has a header
        String cleanBase64 = base64Image.contains(",") ? base64Image.split(",")[1] : base64Image;
        byte[] userBytes = Base64.getDecoder().decode(cleanBase64);

        // 4. Map Candidate IDs to their local File Paths
        String projectRoot = System.getProperty("user.dir");
        Map<String, Path> candidateFiles = new HashMap<>();

        for (CardDefinition card : candidates) {
            // Construct filename (Assuming ID matches filename per your logic)
            String filename = card.getId() + ".png"; 

            Path filePath = Paths.get(projectRoot, "backend/card_images", filename);
            if (filePath.toFile().exists()) {
                candidateFiles.put(card.getId(), filePath);
            }
        }

        System.out.println("Prepared " + candidateFiles.size() + " candidate images for visual matching.");

        // 5. Run the visual comparison if we have valid files
        if (!candidateFiles.isEmpty()) {
            String bestMatchId = findBestMatch(userBytes, candidateFiles);
            
            if (bestMatchId != null) {
                System.out.println("Visual Match Winner: " + bestMatchId);
                
                // Filter the list to return ONLY the winner
                return candidates.stream()
                    .filter(c -> c.getId().equals(bestMatchId))
                    .collect(Collectors.toList());
            }
        }

        // If visual matching failed or returned null, return the original candidates
        return candidates;
    }


    /**
     * Sends a Base64 image to Google Cloud Vision and returns the raw extracted text.
     * <p>
     * This method manually loads the {@code google-credentials.json} file to avoid
     * issues with relative paths in the {@code GOOGLE_APPLICATION_CREDENTIALS} environment variable.
     * </p>
     *
     * @param base64Image The Base64 string of the image to analyze.
     * @return The full text annotation found in the image, or null if an error occurs.
     * @throws RuntimeException If Google Vision Client initialization fails.
     */
    public String detectText(String base64Image) {
        try (ImageAnnotatorClient vision = ImageAnnotatorClient.create()) {
            
            // 1. Decode Base64 string to bytes
            byte[] data = Base64.getDecoder().decode(base64Image);
            ByteString imgBytes = ByteString.copyFrom(data);

            // 2. Build the Image object
            Image img = Image.newBuilder().setContent(imgBytes).build();

            // 3. Define the Request (We want TEXT_DETECTION)
            Feature feat = Feature.newBuilder().setType(Feature.Type.TEXT_DETECTION).build();
            AnnotateImageRequest request = AnnotateImageRequest.newBuilder()
                    .addFeatures(feat)
                    .setImage(img)
                    .build();
            
            List<AnnotateImageRequest> requests = new ArrayList<>();
            requests.add(request);

            // 4. Call the API
            BatchAnnotateImagesResponse response = vision.batchAnnotateImages(requests);
            List<AnnotateImageResponse> responses = response.getResponsesList();

            // 5. Parse Response
            StringBuilder fullText = new StringBuilder();
            
            for (AnnotateImageResponse res : responses) {
                if (res.hasError()) {
                    System.err.printf("Error: %s\n", res.getError().getMessage());
                    return null;
                }

                // The first annotation is usually the "full text" block
                if (!res.getTextAnnotationsList().isEmpty()) {
                    fullText.append(res.getTextAnnotationsList().get(0).getDescription());
                }
            }

            return fullText.toString();

        } catch (IOException e) {
            throw new RuntimeException("Failed to initialize Google Vision Client", e);
        }
    }

    /**
     * Parses the raw OCR text to identify potential card matches in the database.
     * <p>
     * Logic:
     * 1. Extracts HP (Health Points) from the first 5 lines of text using Regex.
     * 2. Iterates through the first 5 lines, treating each as a potential Card Name.
     * 3. Queries the repository for matches using Name and HP.
     * </p>
     *
     * @param scanText The raw text string returned by the OCR service.
     * @return A list of matching {@link CardDefinition} objects, or an empty list if none found.
     */
    public List<CardDefinition> findMatchesFromTextScan(String scanText) {
        if (scanText == null || scanText.isEmpty()) return new ArrayList<>();

        System.out.println("Analyzing OCR Text...");
        List<CardDefinition> matches = new ArrayList<>();

        // split the text into by newlines
        String[] lines = scanText.split("\n");

        Integer detectedHp = null;
        Pattern hpPattern = Pattern.compile("\\b\\d{2,3}\\b");
        // 1. EXTRACT HP using Regex (Looks for 2-3 digits in first 5 lines )
        for (int i = 0; i < 5; i++) {
            Matcher hpMatcher = hpPattern.matcher(lines[i]);
            if (hpMatcher.find()) {
                detectedHp = Integer.parseInt(hpMatcher.group(0));
                System.out.println("Detected HP: " + detectedHp);
                break;
            }
        }

        // search for name with extracted HP for first 5 lines.
        for (int i = 0; i < 5; i++) {
            System.out.println("Searching for card with name: " + lines[i].trim());

            if (lines[i].trim().equalsIgnoreCase("basic")){
                continue;
            }

            matches = cardRepo.searchCards(
                lines[i].trim(),
                null,
                null,
                null,
                detectedHp,
                PageRequest.of(0, 100)
            ).getContent();

            // if a match is found, return it
            if (!matches.isEmpty()) {
                return matches;
            }
            
        }
        return matches;
    }

    /**
     * Performs a visual comparison between the user's uploaded image and a set of candidate images.
     * <p>
     * Uses OpenCV's ORB (Oriented FAST and Rotated BRIEF) algorithm to detect features
     * and a BruteForce Hamming matcher to compare them.
     * </p>
     *
     * @param userImageBytes The byte array of the uploaded image.
     * @param candidateFiles A map of Candidate IDs to their local file paths.
     * @return The ID of the best matching card if a clear winner is found; otherwise null.
     */
    public String findBestMatch(byte[] userImageBytes, Map<String, Path> candidateFiles) {
        
        // 1. Decode User Image
        MatOfByte mob = new MatOfByte(userImageBytes);
        Mat userImage = Imgcodecs.imdecode(mob, Imgcodecs.IMREAD_GRAYSCALE);
        
        if (userImage.empty()) {
            return null;
        }

        // 2. Detect Features in User Image
        // We increase the nfeatures (default is 500) to find more points
        ORB orb = ORB.create(2000); 
        MatOfKeyPoint userKeypoints = new MatOfKeyPoint();
        Mat userDescriptors = new Mat();
        orb.detectAndCompute(userImage, new Mat(), userKeypoints, userDescriptors);


        if (userDescriptors.empty()) {
            return null; 
        }

        String bestMatchId = null;
        int maxGoodMatches = -1;

        // 3. Initialize Matcher
        BFMatcher matcher = BFMatcher.create(BFMatcher.BRUTEFORCE_HAMMING, true);

        // 4. Loop Candidates
        for (Map.Entry<String, Path> entry : candidateFiles.entrySet()) {
            String id = entry.getKey();
            Path path = entry.getValue();

            // Load candidate
            Mat cardImage = Imgcodecs.imread(path.toString(), Imgcodecs.IMREAD_GRAYSCALE);
            if (cardImage.empty()) {
                continue;
            }

            // Detect features in candidate
            MatOfKeyPoint cardKeypoints = new MatOfKeyPoint();
            Mat cardDescriptors = new Mat();
            orb.detectAndCompute(cardImage, new Mat(), cardKeypoints, cardDescriptors);


            if (cardDescriptors.empty()) continue;

            // Match
            MatOfDMatch matches = new MatOfDMatch();
            matcher.match(userDescriptors, cardDescriptors, matches);

            // Count "Good" matches
            int goodMatches = 0;
            for (DMatch m : matches.toList()) {
                if (m.distance < 250) { 
                    goodMatches++;
                }
            }

            System.out.println("Checking candidate " + path.getFileName() + " -> " + goodMatches + " matches");

            if (goodMatches > maxGoodMatches) {
                maxGoodMatches = goodMatches;
                bestMatchId = id;
            }
        }
        
        return bestMatchId;
    }
}