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
import java.util.Map;
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


                //find pricing field (and make sure princing field has tcgplayer player field)
                if (root == null || !root.has("tcgplayer")) {
                    System.out.println(id + "!!!!!!!!!!!!!");
                    continue;
                }
                
                JsonNode tcgPlayerNode = root.get("tcgplayer");
                Double marketPrice = null;
                
                // loop through tcgplayer object and get the normal price (the nomal price is the first object in tcgplayer)
                for (Map.Entry<String, JsonNode> entry : tcgPlayerNode.properties()) {
                    
                    String key = entry.getKey();
                    JsonNode value = entry.getValue();

                    // Skip metadata fields
                    if (key.equals("url") || key.equals("updatedAt") || key.equals("updated") || key.equals("unit")) {
                        continue;
                    }

                    // get marketPrice out of normal price object
                    if (value.isObject()) {
                        if (value.has("marketPrice") && !value.get("marketPrice").isNull()) {
                            marketPrice = value.get("marketPrice").asDouble();
                            break; // Stop at the first valid price we find! (only get normal price)
                        }
                    }
                

                    if (marketPrice != null) {
                        savePrice(id, BigDecimal.valueOf(marketPrice));
                        count++;
                    }
                }
                
                //if (count % 50 == 0) Thread.sleep(200);

            } catch (Exception e) {
                            

            }
        }
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