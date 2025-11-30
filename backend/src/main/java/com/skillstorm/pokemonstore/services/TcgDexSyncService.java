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
import java.util.stream.Collectors;

@Service
public class TcgDexSyncService {

    private final CardDefinitionRepository cardRepository;
    private final CardSetRepository setRepository;
    private final RestClient restClient;

    public TcgDexSyncService(CardDefinitionRepository cardRepo, CardSetRepository setRepo) {
        this.cardRepository = cardRepo;
        this.setRepository = setRepo;
        // Initialize RestClient with Base URL
        this.restClient = RestClient.builder()
                .baseUrl("https://api.tcgdex.net/v2/en")
                .build();
    }

    // --- DTO Records for JSON Mapping ---
    // (Java Records are perfect for this as they don't require boilerplate)
    
    // Represents the "cardCount" object in the set summary
    record CardCountDto(Integer total, Integer official) {}

    // Represents a single item in the "Get All Sets" list
    record SetSummaryDto(String id, String name, String logo, CardCountDto cardCount) {}

    // Represents the response from "Get Set Details"
    record SetDetailDto(String id, String name, String logo, CardCountDto cardCount, List<CardBriefDto> cards) {}

    // Represents a card inside the set response without full details
    record CardBriefDto(String id, String localId, String name, String image) {}

    // Represents a card inside the set response
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
     * Master method to sync ALL sets and their cards.
     * WARNING: This can take several minutes to run.
     */
    public void syncAllSets() {
        System.out.println("--- Starting Full Database Sync ---");

        // 1. Fetch the master list of sets
        List<SetSummaryDto> allSets = restClient.get()
                .uri("/sets")
                .retrieve()
                .body(new ParameterizedTypeReference<List<SetSummaryDto>>() {});

        if (allSets == null) return;

        System.out.println("Found " + allSets.size() + " sets to sync.");

        // 2. Loop through each set
        int count = 0;
        for (SetSummaryDto summary : allSets) {
            try {
                // Sync this specific set
                syncSingleSet(summary.id());
                
                count++;
                System.out.println("Synced set " + count + "/" + allSets.size() + ": " + summary.name());

            } catch (Exception e) {
                // Log error but continue to next set so one failure doesn't stop the process
                System.err.println("Failed to sync set: " + summary.name() + " - " + e.getMessage());
            }
        }
        System.out.println("--- Full Sync Complete ---");
    }

    /**
     * Syncs a single set and its cards by ID.
     */
    @Transactional
    public void syncSingleSet(String setId) {
        // 1. Fetch Set Details (which includes the card list)
        // Endpoint example: /sets/sv1
        SetDetailDto setDto = restClient.get()
                .uri("/sets/" + setId)
                .retrieve()
                .body(SetDetailDto.class);

        if (setDto == null) return;

        // 2. Create and Save the CardSet Entity
        // Note: We use the constructor we created manually in CardSet.java
        CardSet cardSet = new CardSet(
                setDto.id(),
                setDto.name(),
                "Unknown Series", // API v2 often nests this differently, using placeholder for now
                setDto.cardCount().total(),
                setDto.logo() + ".png" // TCGdex usually needs extension appended for the image
        );
        
        // Save set to DB (will update if exists because ID is primary key)
        setRepository.save(cardSet);

        // 3. Process Cards
        // 3. Loop through the brief list and fetch FULL details for each card
        if (setDto.cards() == null || setDto.cards().isEmpty()) return;

        List<CardDefinition> cardEntities = new ArrayList<>();

        for (CardBriefDto briefCard : setDto.cards()) {
            try {
                // FETCH FULL DETAILS individually
                FullCardDto fullCard = restClient.get()
                        .uri("/cards/" + briefCard.id())
                        .retrieve()
                        .body(FullCardDto.class);

                if (fullCard != null) {
                    String fullImageUrl = (fullCard.image() != null) ? fullCard.image() + "/high.png" : null;
                    List<String> cardTypes = (fullCard.types() != null) ? fullCard.types() : new ArrayList<>();

                    cardEntities.add(new CardDefinition(
                            fullCard.id(),
                            cardSet,
                            fullCard.localId(),
                            fullCard.name(),
                            fullImageUrl,
                            fullCard.category(),
                            fullCard.rarity(), // Now this will populate!
                            fullCard.hp(),     // Now this will populate!
                            cardTypes          // Now this will populate!
                    ));
                }
            } catch (Exception e) {
                System.err.println("Error fetching card details for: " + briefCard.name());
            }
        }

        // 4. Save all cards for this set
        cardRepository.saveAll(cardEntities);
    }
}