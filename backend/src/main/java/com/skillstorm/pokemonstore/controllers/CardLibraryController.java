package com.skillstorm.pokemonstore.controllers;

import com.skillstorm.pokemonstore.models.CardDefinition;
import com.skillstorm.pokemonstore.services.CardLibraryService;
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
@CrossOrigin(origins = "*")
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
     * GET /api/v1/library
     * Retrieves a paginated list of card definitions.
     * <p>
     * <b>Sorting Logic:</b>
     * 1. {@code imageUrl}: Ascending with NULLS LAST. This ensures cards with artwork appear first.
     * 2. {@code set.id}: Group cards by their expansion set.
     * 3. {@code localId}: Sort numerically by the card number printed on the bottom.
     * </p>
     *
     * @param page Zero-based page index (default 0).
     * @param size The number of records per page (default 24).
     * @return A {@link Page} of {@link CardDefinition} entities.
     */
    @GetMapping
    public ResponseEntity<Page<CardDefinition>> getAllCards(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "24") int size
    ) {
        return ResponseEntity.ok(libraryService.getAllCards(page, size));
    }

    @GetMapping("/search")
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
}