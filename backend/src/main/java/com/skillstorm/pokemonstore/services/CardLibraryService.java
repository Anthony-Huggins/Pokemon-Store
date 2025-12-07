package com.skillstorm.pokemonstore.services;

import com.skillstorm.pokemonstore.models.CardDefinition;
import com.skillstorm.pokemonstore.repositories.CardDefinitionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
     * Retrieves a paginated list of all card definitions in the database.
     *
     * @param pageable The pagination information (page number, size, sorting).
     * @return A {@link Page} container holding the requested slice of CardDefinitions.
     */
    public Page<CardDefinition> getAllCards(Pageable pageable) {
        return cardRepo.findAll(pageable);
    }
}