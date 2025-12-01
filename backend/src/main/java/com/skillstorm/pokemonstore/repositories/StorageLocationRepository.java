package com.skillstorm.pokemonstore.repositories;

import com.skillstorm.pokemonstore.models.StorageLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for managing {@link StorageLocation} entities.
 * Represents containers like Binders, Display Cases, etc.
 */
@Repository
public interface StorageLocationRepository extends JpaRepository<StorageLocation, Integer> {

    /**
     * Finds all storage locations associated with a specific warehouse.
     *
     * @param warehouseId The ID of the warehouse.
     * @return A list of storage locations in that warehouse.
     */
    List<StorageLocation> findByWarehouseId(Integer warehouseId);
}
