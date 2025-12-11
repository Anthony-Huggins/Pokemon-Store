package com.skillstorm.pokemonstore.controllers;

import com.skillstorm.pokemonstore.models.CardDefinition;
import com.skillstorm.pokemonstore.services.ScanService;
import com.skillstorm.pokemonstore.services.CardLibraryService; 
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for handling image scanning and card identification operations.
 * <p>
 * This controller serves as the entry point for the "Card Scanner" feature. It accepts
 * Base64-encoded images from the frontend, delegates OCR processing to the {@link ScanService},
 * and then queries the database via the {@link CardLibraryService} to find matching Pokémon cards.
 * </p>
 */
@RestController
@RequestMapping("api/v1/scan")
@CrossOrigin(origins = "http://localhost:5173") // Allow React to call this
public class ScanController {



    private final ScanService ocrService;
    private final CardLibraryService libraryService; // You'll need this later to search DB

    /**
     * Constructs a new ScanController with the required services.
     *
     * @param ocrService     The service responsible for performing OCR (Optical Character Recognition) on images.
     * @param libraryService The service responsible for searching the internal card database.
     */
    public ScanController(ScanService ocrService, CardLibraryService libraryService) {
        this.ocrService = ocrService;
        this.libraryService = libraryService;
    }


    /**
     * Identifies a Pokémon card from a provided image.
     * <p>
     * This endpoint performs the following steps:
     * <ol>
     * <li>Accepts a JSON payload containing a Base64 encoded image string.</li>
     * <li>Sends the image to the {@link ScanService} (Google Cloud Vision) to extract raw text.</li>
     * <li>Passes the extracted text to {@link CardLibraryService} to identify potential card matches in the database.</li>
     * <li>Returns a list of matching {@link CardDefinition} objects.</li>
     * </ol>
     * </p>
     *
     * @param payload A Map containing the key "image" with the Base64 string value.
     * @return A {@link ResponseEntity} containing a List of {@link CardDefinition} matches if successful,
     * or an error message if the scan or processing fails.
     */
    @PostMapping("/identify")
    public ResponseEntity<?> identifyCard(@RequestBody Map<String, String> payload) {
        try {
            String base64Image = payload.get("image");
            if (base64Image == null) return ResponseEntity.badRequest().body("No image provided");

            System.out.println("Processing Scan... (" + base64Image.length() + " chars)");

            // 1. Get Text from Google
            String detectedText = ocrService.detectText(base64Image);
            
            // 2. Find Matches using our new Service
            List<CardDefinition> matches = libraryService.findMatchesFromScan(detectedText);
            
            System.out.println("Found " + matches.size() + " matches in DB.");

            return ResponseEntity.ok(matches);


        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }
}