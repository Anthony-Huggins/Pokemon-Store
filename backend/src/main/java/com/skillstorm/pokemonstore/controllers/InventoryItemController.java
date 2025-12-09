package com.skillstorm.pokemonstore.controllers;

import com.skillstorm.pokemonstore.models.InventoryItem;
import com.skillstorm.pokemonstore.services.InventoryItemService;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for managing physical Inventory Items (Cards).
 * <p>
 * Endpoints for adding cards to binders, updating quantities/prices, and viewing stock.
 * Base Path: /api/v1/inventory
 * </p>
 */
@RestController
@RequestMapping("/api/v1/inventory")
@CrossOrigin(origins = "http://localhost:5173")
public class InventoryItemController {

    private final InventoryItemService inventoryItemService;

    /**
     * Constructor injection for the InventoryItemService.
     * @param inventoryItemService The service handling inventory operations.
     */
    public InventoryItemController(InventoryItemService inventoryItemService) {
        this.inventoryItemService = inventoryItemService;
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
    @GetMapping
    public ResponseEntity<List<InventoryItem>> searchInventory(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer locationId,
            @RequestParam(required = false) Integer warehouseId,
            Sort sort // <--- Spring automatically parses "?sort=field,dir" into this object
    ) {
        return ResponseEntity.ok(inventoryItemService.searchInventory(name, locationId, warehouseId, sort));
    }

    /**
     * Retrieves all cards stored in a specific container (e.g., "Binder A").
     *
     * @param id The ID of the storage location.
     * @return List of inventory items in that location.
     */
    @GetMapping("/location/{id}")
    public ResponseEntity<List<InventoryItem>> getItemsByLocation(@PathVariable Integer id) {
        return ResponseEntity.ok(inventoryItemService.getItemsInLocation(id));
    }

    /**
     * Adds a new card to inventory.
     * <p>
     * If ResourceNotFoundException or IllegalStateException occurs, 
     * the ExceptionHandlerAspect will catch it and return 404 or 400 automatically.
     * </p>
     *
     * @param item The inventory item to add.
     * @return The created item (201).
     */
    @PostMapping
    public ResponseEntity<InventoryItem> addItem(@RequestBody InventoryItem item) {
        // CLEAN CODE: Just call the service and return success.
        InventoryItem created = inventoryItemService.addItem(item);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    /**
     * Updates an existing inventory item.
     * Used for changing quantity, condition, price, or moving to a new location.
     *
     * @param item The item with updated properties.
     * @return The updated item.
     */
    @PutMapping
    public ResponseEntity<InventoryItem> updateItem(@RequestBody InventoryItem item) {
        return ResponseEntity.ok(inventoryItemService.updateItem(item));
    }

    /**
     * Deletes a specific inventory item stack.
     *
     * @param id The ID of the inventory item.
     * @return HTTP 204 No Content.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        inventoryItemService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }
}