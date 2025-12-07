package com.skillstorm.pokemonstore.services;

import com.skillstorm.pokemonstore.models.CardDefinition;
import com.skillstorm.pokemonstore.repositories.CardDefinitionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

/**
 * Service class for managing the static Card Library.
 * <p>
 * Handles retrieval of {@link CardDefinition} entities. Unlike the Inventory Service,
 * this service deals with the "Blueprint" data (what a card IS), not physical stock.
 * </p>
 */
@Service
public class CardLibraryService {

    private final CardDefinitionRepository cardRepo;

    public CardLibraryService(CardDefinitionRepository cardRepo) {
        this.cardRepo = cardRepo;
    }

    /**
     * Retrieves a paginated list of cards that have images.
     * <p>
     * Applies a default sort order: Grouped by Set ID, then by Local Card Number.
     * This ensures the grid looks organized (e.g., all Base Set cards appear together).
     * </p>
     *
     * @param page The zero-based page index.
     * @param size The number of records per page.
     * @return A Page of CardDefinitions with valid images.
     */
    public Page<CardDefinition> getAllCards(int page, int size) {
        // Define the business rule for sorting here
        Sort sort = Sort.by("id");
        
        // Build the Pageable object
        Pageable pageable = PageRequest.of(page, size, sort);
        
        return cardRepo.findByImageUrlIsNotNull(pageable);
    }

    /**
     * Searches for cards based on various criteria.
     *
     * @param name      Partial or full name of the card.
     * @param cardType  Type of the card (e.g., "Fire", "Water").
     * @param rarity    Rarity level (e.g., "Common", "Rare").
     * @param setId     Expansion set ID.
     * @param page      Zero-based page index.
     * @param size      Number of records per page.
     * @return A Page of CardDefinitions matching the search criteria.
     */
    public Page<CardDefinition> searchCards(String name, String cardType, String rarity, String setId, Integer hp, int page, int size) {
        // Sort by Set then ID
        Pageable pageable = PageRequest.of(page, size, Sort.by("id"));
        
        return cardRepo.searchCards(name, cardType, rarity, setId, hp, pageable);
    }
}