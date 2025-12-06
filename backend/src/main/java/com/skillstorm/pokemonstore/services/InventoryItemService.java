package com.skillstorm.pokemonstore.services;

import com.skillstorm.pokemonstore.exceptions.ResourceNotFoundException;
import com.skillstorm.pokemonstore.models.InventoryItem;
import com.skillstorm.pokemonstore.models.StorageLocation;
import com.skillstorm.pokemonstore.repositories.InventoryItemRepository;
import com.skillstorm.pokemonstore.repositories.StorageLocationRepository;
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

    public InventoryItemService(InventoryItemRepository inventoryRepo, StorageLocationRepository storageRepo) {
        this.inventoryRepo = inventoryRepo;
        this.storageRepo = storageRepo;
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
        
        // 2. Calculate current load in this specific container
        List<InventoryItem> itemsInBox = inventoryRepo.findByStorageLocationId(locationId);
        
        int currentCount = itemsInBox.stream()
                .mapToInt(InventoryItem::getQuantity)
                .sum();

        // 3. Check if adding this new quantity exceeds the limit
        if (currentCount + newItem.getQuantity() > location.getMaxCapacity()) {
            throw new IllegalStateException("Capacity Exceeded! Container '" + location.getName() + 
                                            "' has " + currentCount + "/" + location.getMaxCapacity() + 
                                            " items. Cannot add " + newItem.getQuantity() + " more.");
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
        // (Optional Future Enhancement: Re-check capacity here if quantity increases)
        return inventoryRepo.save(item);
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
}