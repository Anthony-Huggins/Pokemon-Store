package com.skillstorm.pokemonstore.services;

import com.skillstorm.pokemonstore.exceptions.ResourceNotFoundException;
import com.skillstorm.pokemonstore.models.Warehouse;
import com.skillstorm.pokemonstore.repositories.WarehouseRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service class for managing {@link Warehouse} entities.
 * Handles business logic for creating and retrieving physical store locations.
 */
@Service
public class WarehouseService {

    private final WarehouseRepository warehouseRepo;

    public WarehouseService(WarehouseRepository warehouseRepo) {
        this.warehouseRepo = warehouseRepo;
    }

    /**
     * Retrieves all warehouses from the database.
     * @return List of all warehouses.
     */
    public List<Warehouse> getAllWarehouses() {
        return warehouseRepo.findAll();
    }

    /**
     * Creates a new warehouse.
     * @param warehouse The warehouse entity to save.
     * @return The saved warehouse.
     */
    public Warehouse createWarehouse(Warehouse warehouse) {
        return warehouseRepo.save(warehouse);
    }

    /**
     * Deletes a warehouse by its ID.
     * @param id The warehouse ID.
     * @throws ResourceNotFoundException if the warehouse does not exist.
     */
    public void deleteWarehouse(Integer id) {
        if (!warehouseRepo.existsById(id)) {
            throw new ResourceNotFoundException("Warehouse with ID " + id + " not found.");
        }
        warehouseRepo.deleteById(id);
    }

    /**
     * Updates an existing warehouse details.
     * @param warehouse The warehouse object with updated fields.
     * @return The updated entity.
     */
    public Warehouse updateWarehouse(Warehouse warehouse) {
        // 1. Fetch existing
        Warehouse existing = warehouseRepo.findById(warehouse.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse ID " + warehouse.getId() + " not found."));

        // 2. Update fields if provided
        if (warehouse.getName() != null) {
            existing.setName(warehouse.getName());
        }
        if (warehouse.getLocation() != null) {
            existing.setLocation(warehouse.getLocation());
        }

        // 3. Save
        return warehouseRepo.save(existing);
    }
}