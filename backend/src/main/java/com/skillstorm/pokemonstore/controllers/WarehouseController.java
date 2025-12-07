package com.skillstorm.pokemonstore.controllers;

import com.skillstorm.pokemonstore.models.Warehouse;
import com.skillstorm.pokemonstore.services.WarehouseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for managing Warehouses.
 * <p>
 * Endpoints for creating, retrieving, and deleting physical store locations.
 * Base Path: /api/v1/warehouses
 * </p>
 */
@RestController
@RequestMapping("/api/v1/warehouses")
@CrossOrigin(origins = "*")
public class WarehouseController {

    private final WarehouseService warehouseService;

    /**
     * Constructor injection for the WarehouseService.
     * @param warehouseService The service handling warehouse logic.
     */
    public WarehouseController(WarehouseService warehouseService) {
        this.warehouseService = warehouseService;
    }

    /**
     * Retrieves all warehouses.
     * Includes the nested list of storage locations (binders/cases) for each warehouse.
     *
     * @return List of Warehouse entities.
     */
    @GetMapping
    public ResponseEntity<List<Warehouse>> getAllWarehouses() {
        return ResponseEntity.ok(warehouseService.getAllWarehouses());
    }

    /**
     * Creates a new warehouse.
     *
     * @param warehouse The warehouse entity to create.
     * @return The created entity with HTTP 201 Created.
     */
    @PostMapping
    public ResponseEntity<Warehouse> createWarehouse(@RequestBody Warehouse warehouse) {
        Warehouse created = warehouseService.createWarehouse(warehouse);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    /**
     * Deletes a warehouse by its ID.
     * CAUTION: This cascades and deletes all storage locations and items inside!
     *
     * @param id The ID of the warehouse to delete.
     * @return HTTP 204 No Content.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWarehouse(@PathVariable Integer id) {
        warehouseService.deleteWarehouse(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Updates an existing warehouse.
     * @param warehouse The warehouse with updated properties.
     * @return The updated entity.
     */
    @PutMapping
    public ResponseEntity<Warehouse> updateWarehouse(@RequestBody Warehouse warehouse) {
        return ResponseEntity.ok(warehouseService.updateWarehouse(warehouse));
    }
}