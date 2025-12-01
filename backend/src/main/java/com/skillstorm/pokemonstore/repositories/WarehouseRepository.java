package com.skillstorm.pokemonstore.repositories;

import com.skillstorm.pokemonstore.models.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for managing {@link Warehouse} entities.
 * Handles basic CRUD operations for store locations.
 */
@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, Integer> {
    // Standard JPA methods (save, findById, findAll, delete) are inherited automatically.
}
