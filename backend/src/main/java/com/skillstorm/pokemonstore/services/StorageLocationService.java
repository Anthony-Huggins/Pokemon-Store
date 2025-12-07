package com.skillstorm.pokemonstore.services;

import com.skillstorm.pokemonstore.exceptions.ResourceNotFoundException;
import com.skillstorm.pokemonstore.models.StorageLocation;
import com.skillstorm.pokemonstore.models.Warehouse;
import com.skillstorm.pokemonstore.repositories.StorageLocationRepository;
import com.skillstorm.pokemonstore.repositories.WarehouseRepository;

import java.util.List;

import org.springframework.stereotype.Service;

/**
 * Service class for managing {@link StorageLocation} entities.
 * Handles logic for containers like Binders and Display Cases.
 */
@Service
public class StorageLocationService {

    private final StorageLocationRepository storageRepo;
    private final WarehouseRepository warehouseRepository;

    public StorageLocationService(StorageLocationRepository storageRepo, WarehouseRepository warehouseRepository) {
        this.storageRepo = storageRepo;
        this.warehouseRepository = warehouseRepository;
    }

    /**
     * Creates a new storage location.
     * @param location The storage location to save.
     * @return The saved location.
     */
    public StorageLocation createStorageLocation(StorageLocation location) {
        // 1. Fetch the full Warehouse
        Integer warehouseId = location.getWarehouse().getId();
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse ID " + warehouseId + " not found."));
        
        // 2. Hydrate the object
        location.setWarehouse(warehouse);

        // 3. Save
        return storageRepo.save(location);
    }

    /**
     * Deletes a storage location by ID.
     * @param id The location ID.
     * @throws ResourceNotFoundException if the location does not exist.
     */
    public void deleteStorageLocation(Integer id) {
        if (!storageRepo.existsById(id)) {
            throw new ResourceNotFoundException("Storage Location with ID " + id + " not found.");
        }
        storageRepo.deleteById(id);
    }

    /**
     * Retrieves ALL storage locations across all warehouses.
     * @return List of all locations.
     */
    public List<StorageLocation> getAllStorageLocations() {
        return storageRepo.findAll();
    }

    /**
     * Updates a storage location.
     * Supports renaming, changing capacity, or moving to a new warehouse.
     * @param location The location with updated fields.
     * @return The updated entity.
     */
    public StorageLocation updateStorageLocation(StorageLocation location) {
        StorageLocation existing = storageRepo.findById(location.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Location ID " + location.getId() + " not found."));

        // Update basic fields
        if (location.getName() != null) existing.setName(location.getName());
        if (location.getType() != null) existing.setType(location.getType());
        if (location.getMaxCapacity() != null) existing.setMaxCapacity(location.getMaxCapacity());

        // Handle Moving to a different Warehouse
        if (location.getWarehouse() != null) {
            Integer newWarehouseId = location.getWarehouse().getId();
            Warehouse newWarehouse = warehouseRepository.findById(newWarehouseId)
                    .orElseThrow(() -> new ResourceNotFoundException("Warehouse ID " + newWarehouseId + " not found."));
            
            existing.setWarehouse(newWarehouse);
        }

        return storageRepo.save(existing);
    }
}