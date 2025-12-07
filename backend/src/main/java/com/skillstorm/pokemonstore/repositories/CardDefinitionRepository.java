package com.skillstorm.pokemonstore.repositories;

import com.skillstorm.pokemonstore.models.CardDefinition;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    /**
     * Searches for cards matching specific criteria.
     * Joins with 'types' and 'set' tables to allow deep filtering.
     * 'DISTINCT' is required because joining a list (types) can produce duplicate rows.
     * 
     * @param pageable Pagination info.
     * @return A Page of cards with images.
     */
    @Query("SELECT DISTINCT c FROM CardDefinition c " +
            "LEFT JOIN c.types t " + // Join types table
            "JOIN c.set s " +        // Join set table
            "WHERE c.imageUrl IS NOT NULL " + // Only show cards with images
            "AND (:name IS NULL OR LOWER(CAST(c.name AS string)) LIKE LOWER(CONCAT('%', CAST(:name AS string), '%'))) " +
            "AND (:cardType IS NULL OR t = :cardType) " +
            "AND (:rarity IS NULL OR c.rarity = :rarity) " +
            "AND (:setId IS NULL OR s.id = :setId) " + 
            "AND (:hp IS NULL OR c.hp = :hp)")

        Page<CardDefinition> searchCards(
            @Param("name") String name,
            @Param("cardType") String cardType,
            @Param("rarity") String rarity,
            @Param("setId") String setId,
            @Param("hp") Integer hp,
            Pageable pageable
    );
}