package com.skillstorm.pokemonstore.services;

import com.skillstorm.pokemonstore.models.StorageLocation;
import com.skillstorm.pokemonstore.repositories.StorageLocationRepository;
import org.springframework.stereotype.Service;

/**
 * Service class for managing {@link StorageLocation} entities.
 * Handles logic for containers like Binders and Display Cases.
 */
@Service
public class StorageLocationService {

    private final StorageLocationRepository storageRepo;

    public StorageLocationService(StorageLocationRepository storageRepo) {
        this.storageRepo = storageRepo;
    }

    /**
     * Creates a new storage location.
     * @param location The storage location to save.
     * @return The saved location.
     */
    public StorageLocation createStorageLocation(StorageLocation location) {
        return storageRepo.save(location);
    }

    /**
     * Deletes a storage location by ID.
     * @param id The location ID.
     */
    public void deleteStorageLocation(Integer id) {
        storageRepo.deleteById(id);
    }
}