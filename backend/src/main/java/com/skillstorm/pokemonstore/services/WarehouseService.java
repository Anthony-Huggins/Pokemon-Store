package com.skillstorm.pokemonstore.services;

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
     */
    public void deleteWarehouse(Integer id) {
        warehouseRepo.deleteById(id);
    }
}