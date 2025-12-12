package com.skillstorm.pokemonstore.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.skillstorm.pokemonstore.models.CardDefinition;
import com.skillstorm.pokemonstore.repositories.CardDefinitionRepository;
import com.skillstorm.pokemonstore.repositories.InventoryItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.function.Consumer;

/**
 * Service for fetching live market prices from TCGdex and updating the Card Library.
 */
@Service
public class PriceSyncService {

    private final InventoryItemRepository inventoryRepo;
    private final CardDefinitionRepository cardRepo;
    private final RestClient restClient;

    public PriceSyncService(InventoryItemRepository inventoryRepo, CardDefinitionRepository cardRepo) {
        this.inventoryRepo = inventoryRepo;
        this.cardRepo = cardRepo;
        this.restClient = RestClient.builder().baseUrl("https://api.tcgdex.net/v2/en").build();
    }

    /**
     * Syncs prices for cards currently in stock.
     * @param progressCallback
     */
    public void syncInventoryPrices(Consumer<Integer> progressCallback) {
        List<String> ids = inventoryRepo.findIdsOfCardsInStock();
        System.out.println("Syncing prices for " + ids.size() + " unique cards in stock...");
        updatePricesForIds(ids ,progressCallback);
    }

    /**
     * Syncs prices for the entire card library.
     * @param progressCallback
     */
    public void syncLibraryPrices(Consumer<Integer> progressCallback) {
        List<String> ids = cardRepo.findAll().stream().map(CardDefinition::getId).toList();
        System.out.println("Syncing prices for entire library (" + ids.size() + " cards)...");
        updatePricesForIds(ids, progressCallback);
    }

    /**
     * Updates prices for a list of card IDs, reporting progress via the callback.
     * @param ids
     * @param progressCallback
     */
    private void updatePricesForIds(List<String> ids, Consumer<Integer> progressCallback) {
        int numCardmarket = 0, numTcgplayer = 0;
        int total = ids.size();
        int count = 0;
        int processed = 0;
        double lastReportedProgress = 0;

        for (String id : ids) {
            processed++;
            
            // Calculate Percentage (0.0 to 100.0)
            double percent = ((double) processed / total) * 100;
            
            // Report progress every percent
            if (percent - lastReportedProgress > 1.0 || processed == total) {
                progressCallback.accept((int)percent);
                lastReportedProgress = percent;
            }
            try {
                // 1. Fetch raw JSON
                JsonNode root = restClient.get()
                        .uri("/cards/" + id)
                        .retrieve()
                        .body(JsonNode.class);

                if (root == null || !root.has("pricing")) {
                    continue;
                }
                root = root.get("pricing");
                //System.out.println(root.toPrettyString());

                //find pricing field (and make sure princing field has cardmarket player field)
                // use cardmarket because it has more cards with prices then tcgplayer from API
                if (root == null || !root.has("cardmarket")) {
                    continue;
                }
                JsonNode cardmarketNode = root.get("cardmarket");
                Double marketPrice = null;
                
                // assume card is normal if comes in both variants. some cards are only holo or only normal
                if (cardmarketNode.has("avg30") && 
                !cardmarketNode.get("avg30").isNull() &&
                cardmarketNode.get("avg30").asDouble() > 0) 
                {
                    marketPrice = cardmarketNode.get("avg30").asDouble();
                    //convert euro to dollar
                    savePrice(id, BigDecimal.valueOf(marketPrice * 1.16));
                    count++;
                // if no data from past 30 days fallback to avg
                } else if (cardmarketNode.has("avg") && 
                !cardmarketNode.get("avg").isNull() && 
                cardmarketNode.get("avg").asDouble() > 0) 
                {
                    marketPrice = cardmarketNode.get("avg").asDouble();
                    savePrice(id, BigDecimal.valueOf(marketPrice * 1.16));
                    count++;
                }
                
                
                
                //if (count % 50 == 0) Thread.sleep(200);

            } catch (Exception e) {
                            
                System.err.println("Error syncing price for Card ID '" + id + "': " + e.getMessage());
            }
        }
        System.out.println("TCGplayer prices found for " + numTcgplayer + " cards.");
        System.out.println("Cardmarket prices found for " + numCardmarket + " cards.");

        System.out.println("Price Sync Complete. Updated " + count + " out of "+ ids.size() + "records.");
    }

    /**
     * Updates the market price directly on the CardDefinition entity.
     * @param cardId The card ID.
     * @param priceValue The new market price.
     */
    @Transactional
    protected void savePrice(String cardId, BigDecimal priceValue) {
        // Fetch the card
        CardDefinition card = cardRepo.findById(cardId).orElse(null);
        
        if (card != null) {
            // Update fields directly
            card.setMarketPrice(priceValue);
            card.setLastPriceUpdate(Instant.now());
            
            // Save the definition
            cardRepo.save(card);
        }
    }
}