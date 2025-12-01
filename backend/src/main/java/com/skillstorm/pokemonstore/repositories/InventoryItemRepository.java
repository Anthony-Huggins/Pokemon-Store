package com.skillstorm.pokemonstore.repositories;

import com.skillstorm.pokemonstore.models.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for managing {@link InventoryItem} entities.
 * Handles the actual physical stock of cards.
 */
@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {

    /**
     * Finds all items stored in a specific container (e.g., all cards in "Binder A").
     *
     * @param storageLocationId The ID of the storage location.
     * @return A list of inventory items.
     */
    List<InventoryItem> findByStorageLocationId(Integer storageLocationId);

    /**
     * Retrieves a distinct list of Card Definition IDs for all items currently in stock.
     * <p>
     * This is used by the Price Update Service to ensure we only query the API
     * for cards we actually own, saving bandwidth and processing time.
     * </p>
     *
     * @return A list of unique TCGdex IDs (e.g., "swsh1-001").
     */
    @Query("SELECT DISTINCT i.cardDefinition.id FROM InventoryItem i")
    List<String> findIdsOfCardsInStock();
}