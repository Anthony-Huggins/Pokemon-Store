package com.skillstorm.pokemonstore.controllers;

import com.skillstorm.pokemonstore.models.StorageLocation;
import com.skillstorm.pokemonstore.services.StorageLocationService;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for managing Storage Locations (Binders, Display Cases).
 * <p>
 * Endpoints for creating and removing the containers where cards are stored.
 * Base Path: /api/v1/locations
 * </p>
 */
@RestController
@RequestMapping("/api/v1/locations")
@CrossOrigin(origins = "http://localhost:5173")
public class StorageLocationController {

    private final StorageLocationService storageLocationService;

    /**
     * Constructor injection for the StorageLocationService.
     * @param storageLocationService The service handling storage container logic.
     */
    public StorageLocationController(StorageLocationService storageLocationService) {
        this.storageLocationService = storageLocationService;
    }

    /**
     * Creates a new storage location inside a specific warehouse.
     * The Warehouse ID must be present in the request body object.
     *
     * @param location The storage location entity.
     * @return The created entity with HTTP 201 Created.
     */
    @PostMapping
    public ResponseEntity<StorageLocation> createLocation(@RequestBody StorageLocation location) {
        StorageLocation created = storageLocationService.createStorageLocation(location);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    /**
     * Deletes a storage location by ID.
     * CAUTION: This will delete all inventory items stored in this location.
     *
     * @param id The ID of the location to delete.
     * @return HTTP 204 No Content.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLocation(@PathVariable Integer id) {
        storageLocationService.deleteStorageLocation(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Retrieves ALL storage locations (flat list).
     * Useful for admin tables or dropdowns.
     * @return List of all locations.
     */
    @GetMapping
    public ResponseEntity<List<StorageLocation>> getAllLocations() {
        return ResponseEntity.ok(storageLocationService.getAllStorageLocations());
    }

    /**
     * Updates a storage location (Rename, Resize, or Move).
     * @param location The location data to update.
     * @return The updated entity.
     */
    @PutMapping
    public ResponseEntity<StorageLocation> updateLocation(@RequestBody StorageLocation location) {
        return ResponseEntity.ok(storageLocationService.updateStorageLocation(location));
    }
}