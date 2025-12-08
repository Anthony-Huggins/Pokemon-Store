package com.skillstorm.pokemonstore.repositories;

import com.skillstorm.pokemonstore.models.InventoryItem;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
     * Efficiently counts the total number of items stored in a specific location.
     * <p>
     * This method generates a {@code SELECT COUNT(*)} SQL query, which is significantly
     * more performant than fetching a list of items and calling {@code .size()}, especially
     * for large containers.
     * </p>
     *
     * @param storageLocationId The ID of the storage container (Binder, Box, etc.).
     * @return The total count of rows in the inventory table for this location.
     */
    long countByStorageLocationId(Integer storageLocationId);
    
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

    /**
     * Searches the inventory based on various criteria.
     *
     * @param name         Partial or full name of the card.
     * @param rarity       Rarity level (e.g., "Common", "Rare").
     * @param locationId   ID of the storage location (binder/case).
     * @param warehouseId  ID of the warehouse.
     * @param sort         Sorting criteria (e.g., "name,asc").
     * @return List of matching inventory items.
     */
    @Query("SELECT DISTINCT i FROM InventoryItem i " +
           "JOIN i.cardDefinition c " +
           "JOIN i.storageLocation s " +
           "WHERE (:name IS NULL OR LOWER(CAST(c.name AS string)) LIKE LOWER(CONCAT('%', CAST(:name AS string), '%'))) " +
           "AND (:rarity IS NULL OR c.rarity = :rarity) " +
           "AND (:locationId IS NULL OR s.id = :locationId) " +
           "AND (:warehouseId IS NULL OR s.warehouse.id = :warehouseId)")
    List<InventoryItem> searchInventory(
            @Param("name") String name,
            @Param("rarity") String rarity,
            @Param("locationId") Integer locationId,
            @Param("warehouseId") Integer warehouseId,
            Sort sort // <--- Add this as the last parameter
    );
}