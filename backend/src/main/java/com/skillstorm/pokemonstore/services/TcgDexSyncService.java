package com.skillstorm.pokemonstore.services;

import com.skillstorm.pokemonstore.models.CardDefinition;
import com.skillstorm.pokemonstore.models.CardSet;
import com.skillstorm.pokemonstore.repositories.CardDefinitionRepository;
import com.skillstorm.pokemonstore.repositories.CardSetRepository;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

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
     * Master method to sync ALL sets and their cards from the API.
     * <p>
     * <b>WARNING:</b> This process involves hundreds of API calls and can take several minutes to complete.
     * It iterates through every set available on TCGdex and triggers a sync for each one.
     * </p>
     */
    public void syncAllSets(Consumer<Integer> progressCallback) {
        System.out.println("--- Starting Full Database Sync ---");

        // 1. Fetch the master list of all sets
        List<SetSummaryDto> allSets = restClient.get()
                .uri("/sets")
                .retrieve()
                .body(new ParameterizedTypeReference<List<SetSummaryDto>>() {});

        if (allSets == null) return;

        System.out.println("Found " + allSets.size() + " sets to sync.");

        // 2. Loop through each set and sync its contents
        int count = 0;
        double lastReportedProgress = 0;
        for (SetSummaryDto summary : allSets) {
            count++;

            double percent = ((double) count / allSets.size()) * 100;

            // Report progress every percent
            if (percent - lastReportedProgress > 1 || count == allSets.size()) {
                progressCallback.accept((int)percent);
                lastReportedProgress = percent;
            }

            try {
                // Sync this specific set
                syncSingleSet(summary.id());
                
                System.out.println("Synced set " + count + "/" + allSets.size() + ": " + summary.name());

            } catch (Exception e) {
                // Log error but continue to next set so one failure doesn't stop the entire process
                System.err.println("Failed to sync set: " + summary.name() + " - " + e.getMessage());
            }
        }
        System.out.println("--- Full Sync Complete ---");
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
                    String fullImageUrl = (fullCard.image() != null) ? fullCard.image() + "/high.png" : null;
                    
                    // Handle potential null list for types
                    List<String> cardTypes = (fullCard.types() != null) ? fullCard.types() : new ArrayList<>();

                    cardEntities.add(new CardDefinition(
                            fullCard.id(),
                            cardSet,
                            fullCard.localId(),
                            fullCard.name(),
                            fullImageUrl,
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
}