package com.skillstorm.pokemonstore.services;

import com.skillstorm.pokemonstore.exceptions.ResourceNotFoundException;
import com.skillstorm.pokemonstore.models.CardDefinition;
import com.skillstorm.pokemonstore.models.InventoryItem;
import com.skillstorm.pokemonstore.models.StorageLocation;
import com.skillstorm.pokemonstore.repositories.CardDefinitionRepository;
import com.skillstorm.pokemonstore.repositories.InventoryItemRepository;
import com.skillstorm.pokemonstore.repositories.StorageLocationRepository;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service class for managing {@link InventoryItem} entities.
 * Handles the core business logic for the physical stock, including capacity checks.
 */
@Service
public class InventoryItemService {

    private final InventoryItemRepository inventoryRepo;
    private final StorageLocationRepository storageRepo;
    private final CardDefinitionRepository cardRepo;

    public InventoryItemService(InventoryItemRepository inventoryRepo, StorageLocationRepository storageRepo, CardDefinitionRepository cardRepo) {
        this.inventoryRepo = inventoryRepo;
        this.storageRepo = storageRepo;
        this.cardRepo = cardRepo;
    }

    /**
     * Adds a new item to the inventory, enforcing capacity constraints.
     *
     * @param newItem The inventory item to be added.
     * @return The saved InventoryItem.
     * @throws IllegalArgumentException if the storage location does not exist.
     * @throws IllegalStateException    if the storage location is full.
     */
    @Transactional
    public InventoryItem addItem(InventoryItem newItem) {
        // 1. Fetch the storage location to check limits
        Integer locationId = newItem.getStorageLocation().getId();
        StorageLocation location = storageRepo.findById(locationId)
                .orElseThrow(() -> new ResourceNotFoundException("Storage Location ID " + locationId + " not found."));
        
        newItem.setStorageLocation(location);

        // 2. Fetch the FULL Card Definition
        String cardId = newItem.getCardDefinition().getId();
        CardDefinition card = cardRepo.findById(cardId)
                 .orElseThrow(() -> new ResourceNotFoundException("Card Definition ID '" + cardId + "' not found."));
        
        // *** FIX 2: Attach the full card object to the item ***
        newItem.setCardDefinition(card);

        // 3. Check Capacity
        int currentCount = location.getCurrentCount();

        // Logic: If current count (e.g., 50) is already equal to or greater than max (50), we can't add 1 more.
        if (currentCount >= location.getMaxCapacity()) {
            throw new IllegalStateException("Capacity Exceeded! Container '" + location.getName() + 
                                            "' is full (" + currentCount + "/" + location.getMaxCapacity() + 
                                            "). Cannot add more cards.");
        }

        // 4. Save the item
        return inventoryRepo.save(newItem);
    }

    /**
     * Updates an existing inventory item.
     * @param item The item with updated values.
     * @return The updated item.
     */
    public InventoryItem updateItem(InventoryItem item) {
        // 1. Fetch the existing item from DB to ensure it exists
        InventoryItem existingItem = inventoryRepo.findById(item.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Item ID " + item.getId() + " not found."));

        // 2. Handle Storage Location Change (Moving the card)
        if (item.getStorageLocation() != null) {
            Integer newLocId = item.getStorageLocation().getId();
            Integer currentLocId = existingItem.getStorageLocation().getId();

            // ONLY perform checks and updates if we are actually moving to a NEW location
            if (!newLocId.equals(currentLocId)) {
                StorageLocation newLoc = storageRepo.findById(newLocId)
                        .orElseThrow(() -> new ResourceNotFoundException("Location ID " + newLocId + " not found."));

                // Capacity Check: Only needed because we are adding a NEW item to this specific box
                if (newLoc.getCurrentCount() >= newLoc.getMaxCapacity()) {
                    throw new IllegalStateException("Capacity Exceeded! Container '" + newLoc.getName() + 
                                                    "' is full (" + newLoc.getCurrentCount() + "/" + newLoc.getMaxCapacity() + 
                                                    "). Cannot move card here.");
                }
                
                existingItem.setStorageLocation(newLoc);
            }
        }

        // 3. Handle details that shouldn't change (like the Card Definition)
        // We usually don't allow changing the Card Definition (a Charizard doesn't become a Pikachu)
        // So we ensure it stays linked to the original.
        item.setCardDefinition(existingItem.getCardDefinition());

        // 4. Update other fields (Quantity, Price, etc.)
        if (item.getSetPrice() != null) existingItem.setSetPrice(item.getSetPrice());
        if (item.getCondition() != null) existingItem.setCondition(item.getCondition());
        if (item.getMatchMarketPrice() != null) existingItem.setMatchMarketPrice(item.getMatchMarketPrice());
        if (item.getMarkupPercentage() != null) existingItem.setMarkupPercentage(item.getMarkupPercentage());

        return inventoryRepo.save(existingItem);
    }

    /**
     * Deletes an item from inventory.
     * @param id The inventory item ID.
     */
    public void deleteItem(Long id) {
        if (!inventoryRepo.existsById(id)) {
            throw new ResourceNotFoundException("Inventory Item with ID " + id + " not found.");
        }
        inventoryRepo.deleteById(id);
    }

    /**
     * Retrieves all items in a specific storage location.
     * @param locationId The ID of the storage location.
     * @return List of items.
     */
    public List<InventoryItem> getItemsInLocation(Integer locationId) {
        return inventoryRepo.findByStorageLocationId(locationId);
    }

    /**
     * Searches the inventory based on various criteria.
     *
     * @param name         Partial or full name of the card.
     * @param locationId   ID of the storage location (binder/case).
     * @param warehouseId  ID of the warehouse.
     * @param sort         Sorting criteria (e.g., "name,asc").
     * @return List of matching inventory items.
     */
    public List<InventoryItem> searchInventory(String name, Integer locationId, Integer warehouseId, Sort sort) {
        return inventoryRepo.searchInventory(name, locationId, warehouseId, sort);
    }
}