package com.skillstorm.pokemonstore.repositories;

import com.skillstorm.pokemonstore.models.CardSet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for managing {@link CardSet} entities.
 * <p>
 * This interface provides standard CRUD operations for Pokémon card expansion sets
 * (e.g., "Scarlet & Violet Base", "Sword & Shield").
 * </p>
 * <p>
 * It extends {@link JpaRepository}, inheriting methods for saving, deleting, and finding
 * sets by their unique String ID (e.g., "sv1").
 * </p>
 */
@Repository
public interface CardSetRepository extends JpaRepository<CardSet, String> {
}