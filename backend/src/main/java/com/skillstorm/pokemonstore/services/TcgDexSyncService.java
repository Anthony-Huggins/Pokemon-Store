package com.skillstorm.pokemonstore.services;

import com.skillstorm.pokemonstore.models.CardDefinition;
import com.skillstorm.pokemonstore.models.CardSet;
import com.skillstorm.pokemonstore.repositories.CardDefinitionRepository;
import com.skillstorm.pokemonstore.repositories.CardSetRepository;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.io.InputStream;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;

/**
 * Service responsible for synchronizing the local database with the external TCGdex API.
 * <p>
 * This service fetches static card data (Sets, Card Definitions, Images, Stats) and persists
 * them into the local PostgreSQL database. It handles the mapping from API JSON responses
 * to local Entity models.
 * </p>
 */
@Service
public class TcgDexSyncService {

    private final CardDefinitionRepository cardRepository;
    private final CardSetRepository setRepository;
    private final RestClient restClient;

    /**
     * Constructs the sync service and initializes the RestClient.
     *
     * @param cardRepo Repository for saving individual card definitions.
     * @param setRepo  Repository for saving set information.
     */
    public TcgDexSyncService(CardDefinitionRepository cardRepo, CardSetRepository setRepo) {
        this.cardRepository = cardRepo;
        this.setRepository = setRepo;
        // Initialize RestClient with Base URL for TCGdex V2 API
        this.restClient = RestClient.builder()
                .baseUrl("https://api.tcgdex.net/v2/en")
                .build();
    }

    // --- DTO Records for JSON Mapping ---
    // These internal records map directly to the structure of the JSON returned by the TCGdex API.

    /**
     * DTO representing the "cardCount" object nested within set responses.
     * Example JSON: { "total": 200, "official": 198 }
     *
     * @param total    The absolute total number of cards including secret rares.
     * @param official The official number of cards in the set.
     */
    record CardCountDto(Integer total, Integer official) {}

    /**
     * DTO representing a single item in the "Get All Sets" list response.
     * Used to iterate through all available sets during a full sync.
     *
     * @param id        The unique set ID (e.g., "sv1").
     * @param name      The set name (e.g., "Scarlet & Violet").
     * @param logo      The URL path to the logo (needs extension appended).
     * @param cardCount The nested card count object.
     */
    record SetSummaryDto(String id, String name, String logo, CardCountDto cardCount) {}

    /**
     * DTO representing the detailed response for a single set.
     * Contains metadata about the set and a brief list of cards contained within it.
     *
     * @param id        The unique set ID.
     * @param name      The set name.
     * @param logo      The logo path.
     * @param cardCount The nested card count object.
     * @param cards     A list of {@link CardBriefDto} representing the cards in this set.
     */
    record SetDetailDto(String id, String name, String logo, CardCountDto cardCount, List<CardBriefDto> cards) {}

    /**
     * DTO representing the brief card summary found inside a Set response.
     * Note: This lacks detailed stats like HP, Rarity, and Category.
     *
     * @param id      The unique card ID (e.g., "sv1-001").
     * @param localId The local number (e.g., "001").
     * @param name    The card name.
     * @param image   The image path.
     */
    record CardBriefDto(String id, String localId, String name, String image) {}

    /**
     * DTO representing the full detailed response from the "/cards/{id}" endpoint.
     * This is required to populate the database with deep stats like HP and Types.
     *
     * @param id       The unique card ID.
     * @param localId  The local number.
     * @param name     The card name.
     * @param image    The image path.
     * @param category The category (Pokemon, Trainer, etc.).
     * @param rarity   The rarity (Common, Rare, etc.).
     * @param hp       The hit points.
     * @param types    A list of elemental types.
     */
    record FullCardDto(
        String id,
        String localId,
        String name,
        String image,
        String category,
        String rarity,
        Integer hp,
        List<String> types
    ) {}

    /**
     * Syncs only the sets that are missing from the local database.
     * <p>
     * This method is designed to be run periodically to ensure the database is up-to-date
     * with new sets released by the TCGdex API. It fetches a list of all available sets and
     * then filters out those already present in the database, syncing only the new ones.
     * </p>
     *
     * @param progressCallback A callback function to report progress percentage (0-100).
     */
    public void syncMissingSets(Consumer<Integer> progressCallback) {
        System.out.println("--- Starting Missing Sets Sync ---");

        // 1. Fetch Master List from API
        List<SetSummaryDto> allSets = restClient.get()
                .uri("/sets")
                .retrieve()
                .body(new ParameterizedTypeReference<List<SetSummaryDto>>() {});

        if (allSets == null || allSets.isEmpty()) return;

        // 2. Filter: Keep only sets we DO NOT have in the DB
        // This is much faster than re-syncing everything
        List<SetSummaryDto> missingSets = new ArrayList<>();
        for (SetSummaryDto summary : allSets) {
            if (!setRepository.existsById(summary.id())) {
                missingSets.add(summary);
            }
        }

        System.out.println("Found " + missingSets.size() + " new sets to download.");
        
        if (missingSets.isEmpty()) {
            progressCallback.accept(100); // Done immediately
            return;
        }

        // 3. Sync the missing ones
        int count = 0;
        int lastReportedProgress = -1;

        for (SetSummaryDto summary : missingSets) {
            count++;

            // Calculate Progress based on the MISSING list, not the total list
            int percent = (int) (((double) count / missingSets.size()) * 100);

            if (percent > lastReportedProgress) {
                progressCallback.accept(percent);
                lastReportedProgress = percent;
            }

            try {
                // Reuse your existing logic!
                syncSingleSet(summary.id());
                System.out.println("Synced NEW set: " + summary.name());
                
                // Sleep to be polite
                Thread.sleep(500); 

            } catch (Exception e) {
                System.err.println("Failed to sync set: " + summary.name());
            }
        }
        System.out.println("--- Missing Sets Sync Complete ---");
    }
    

    /**
     * Syncs a single set and all its associated cards by Set ID.
     * <p>
     * This method performs the following steps:
     * <ol>
     * <li>Fetches the Set details to get the list of card IDs.</li>
     * <li>Creates and saves the {@link CardSet} entity.</li>
     * <li>Iterates through the list of card IDs and fetches FULL details for each card individually.</li>
     * <li>Maps the API response to {@link CardDefinition} entities.</li>
     * <li>Batch saves all cards to the database.</li>
     * </ol>
     * </p>
     *
     * @param setId The unique ID of the set to sync (e.g., "sv1").
     */
    @Transactional
    public void syncSingleSet(String setId) {
        // 1. Fetch Set Details (which includes the card brief list)
        // Endpoint example: /sets/sv1
        SetDetailDto setDto = restClient.get()
                .uri("/sets/" + setId)
                .retrieve()
                .body(SetDetailDto.class);

        if (setDto == null) return;

        // 2. Create and Save the CardSet Entity
        // Note: The API returns total cards nested in an object, handled by .cardCount().total()
        CardSet cardSet = new CardSet(
                setDto.id(),
                setDto.name(),
                "Unknown Series", // API v2 structure varies for series, using placeholder for now
                setDto.cardCount().total(),
                setDto.logo() + ".png" // TCGdex usually requires appending extension for the logo URL
        );
        
        // Save set to DB (save will update if exists because ID is primary key)
        setRepository.save(cardSet);

        // 3. Process Cards
        // If the set has no cards, we are done.
        if (setDto.cards() == null || setDto.cards().isEmpty()) return;

        List<CardDefinition> cardEntities = new ArrayList<>();

        // Loop through the brief list and fetch FULL details for each card individually
        // This is necessary because the Set endpoint does not provide HP, Rarity, or Types.
        for (CardBriefDto briefCard : setDto.cards()) {
            try {
                // FETCH FULL DETAILS individually
                FullCardDto fullCard = restClient.get()
                        .uri("/cards/" + briefCard.id())
                        .retrieve()
                        .body(FullCardDto.class);

                if (fullCard != null) {
                    // Append extension to image path if present
                    String remoteUrl = (fullCard.image() != null) ? fullCard.image() + "/low.png" : null;
                    // Default to saving remote image if download fails
                    String finalStoredUrl = remoteUrl;
                    
                    if (remoteUrl != null) {
                        // Attempt to download and save the image locally
                        String fileName = fullCard.id() + ".png";
                        fileName = downloadImage(remoteUrl, fileName);

                        // If successful, save the local path ("sv1-001.png") to DB
                        if (fileName != null) {
                            // if save seccessful, set path to local file to be saved in DB
                            finalStoredUrl = fileName; 
                        }
                    }
                    // Handle potential null list for types
                    List<String> cardTypes = (fullCard.types() != null) ? fullCard.types() : new ArrayList<>();

                    cardEntities.add(new CardDefinition(
                            fullCard.id(),
                            cardSet,
                            fullCard.localId(),
                            fullCard.name(),
                            finalStoredUrl,
                            fullCard.category(),
                            fullCard.rarity(), // Now populated from full details
                            fullCard.hp(),     // Now populated from full details
                            cardTypes          // Now populated from full details
                    ));
                }
            } catch (Exception e) {
                // Log the specific card error but continue processing the rest of the set
                System.err.println("Error fetching card details for: " + briefCard.name());
            }
        }

        // 4. Batch save all cards for this set
        cardRepository.saveAll(cardEntities);
    }

    /**
     * Downloads an image from a URL and saves it locally.
     * @param imageUrl The remote URL (TCGdex).
     * @param filename The local filename to save as (e.g., "sv1-001.png").
     * @return The relative path to the saved image (e.g., "/images/sv1-001.png").
     */
    public String downloadImage(String imageUrl, String filename) {
        if (imageUrl == null || imageUrl.isEmpty()) return null;

        final Path rootLocation = Paths.get("card_images");

        try {   
            
            Path destination = rootLocation.resolve(filename);
            
            // Skip if already exists (Optimization)
            if (Files.exists(destination)) {
                return "/images/" + filename;
            }

            try (InputStream in = new URI(imageUrl).toURL().openStream()) {
                Files.copy(in, destination, StandardCopyOption.REPLACE_EXISTING);
            }

            return "/images/" + filename;

        } catch (Exception e) {
            System.err.println("Failed to download image: " + imageUrl + " - " + e.getMessage());
            return null; // Return null so we keep the old URL as fallback
        }
    }
}

