package com.skillstorm.pokemonstore.controllers;

import com.skillstorm.pokemonstore.models.CardDefinition;
import com.skillstorm.pokemonstore.models.CardSet;
import com.skillstorm.pokemonstore.services.CardLibraryService;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for accessing the read-only Card Library.
 * <p>
 * This controller provides endpoints to browse the master list of Pokémon card definitions
 * imported from the TCGdex API. It supports pagination to handle large datasets (20k+ cards).
 * Base Path: /api/v1/library
 * </p>
 */
@RestController
@RequestMapping("/api/v1/library")
@CrossOrigin(origins = "http://localhost:5173")
public class CardLibraryController {

    private final CardLibraryService libraryService;

    /**
     * Constructor injection for the Library Service.
     * @param libraryService Service handling card definition retrieval.
     */
    public CardLibraryController(CardLibraryService libraryService) {
        this.libraryService = libraryService;
    }



    /**
     * GET /api/v1/library/search
     * Searches for cards based on various criteria.
     *
     * @param name      Partial or full name of the card.
     * @param cardType  Type of the card (e.g., "Fire", "Water").
     * @param rarity    Rarity level (e.g., "Common", "Rare").
     * @param setId     ID of the expansion set.
     * @param hp        Hit points of the card.
     * @param page      Zero-based page index (default 0).
     * @param size      The number of records per page (default 24).
     * @return A {@link Page} of {@link CardDefinition} entities matching the criteria.
     */
    @GetMapping()
    public ResponseEntity<Page<CardDefinition>> searchCards(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String cardType,
            @RequestParam(required = false) String rarity,
            @RequestParam(required = false) String setId,
            @RequestParam(required = false) Integer hp,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "24") int size
    ) {
        return ResponseEntity.ok(libraryService.searchCards(name, cardType, rarity, setId, hp, page, size));
    }

    /**
     * GET /api/v1/library/sets
     * Retrieves all available expansion sets.
     * <p>
     * Used for the "Set" dropdown filter on the library page.
     * </p>
     *
     * @return A list of {@link CardSet} objects.
     */
    @GetMapping("/sets")
    public ResponseEntity<List<CardSet>> getAllSets() {
        return ResponseEntity.ok(libraryService.getAllSets());
    }
}