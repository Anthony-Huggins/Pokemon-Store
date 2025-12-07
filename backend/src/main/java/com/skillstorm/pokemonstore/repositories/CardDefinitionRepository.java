package com.skillstorm.pokemonstore.repositories;

import com.skillstorm.pokemonstore.models.CardDefinition;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for managing {@link CardDefinition} entities.
 * <p>
 * This interface provides standard CRUD operations for the static card library data
 * (the "blueprint" definitions of cards).
 * </p>
 * <p>
 * It extends {@link JpaRepository}, inheriting methods for saving, deleting, and finding
 * card definitions by their unique String ID (e.g., "sv1-001").
 * </p>
 */
@Repository
public interface CardDefinitionRepository extends JpaRepository<CardDefinition, String> {

    /**
     * Finds all cards that actually have an image URL.
     * This filters out placeholder entries or cards with missing art.
     *
     * @param pageable Pagination info.
     * @return A Page of cards with images.
     */
    Page<CardDefinition> findByImageUrlIsNotNull(Pageable pageable);
}