package com.skillstorm.pokemonstore.services;

import com.skillstorm.pokemonstore.models.CardDefinition;
import com.skillstorm.pokemonstore.models.CardSet;
import com.skillstorm.pokemonstore.repositories.CardDefinitionRepository;
import com.skillstorm.pokemonstore.repositories.CardSetRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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
    private final CardSetRepository setRepo;

    public CardLibraryService(CardDefinitionRepository cardRepo, CardSetRepository setRepo) {
        this.cardRepo = cardRepo;
        this.setRepo = setRepo;
    }

    /**
     * @deprecated NO LONGER IN USE - use searchCards with no filters instead.
     * 
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
        Sort sort = Sort.by(Sort.Order.desc("marketPrice").nullsLast());
        Pageable pageable = PageRequest.of(page, size, sort);
        
        return cardRepo.searchCards(name, cardType, rarity, setId, hp, pageable);
    }

    /**
     * Retrieves a list of all available card sets, sorted alphabetically by name.
     * <p>
     * Used to populate dropdown filters in the frontend.
     * </p>
     *
     * @return A List of all {@link CardSet} entities.
     */
    public List<CardSet> getAllSets() {
        return setRepo.findAll(Sort.by("name"));
    }

    /**
     * Finds and returns a list of card definitions that match the given scan text.
     * @param scanText
     * @return
     */
    public List<CardDefinition> findMatchesFromScan(String scanText) {
        if (scanText == null || scanText.isEmpty()) return new ArrayList<>();

        System.out.println("Analyzing OCR Text...");
        List<CardDefinition> matches = new ArrayList<>();

        // split the text into by newlines
        String[] lines = scanText.split("\n");

        Integer detectedHp = null;
        Pattern hpPattern = Pattern.compile("\\b\\d{3}\\b");
        // 1. EXTRACT HP using Regex (Looks for 2-3 digits in first 5 lines )
        for (int i = 0; i < 5; i++) {
            Matcher hpMatcher = hpPattern.matcher(lines[i]);
            if (hpMatcher.find()) {
                detectedHp = Integer.parseInt(hpMatcher.group(0));
                System.out.println("Detected HP: " + detectedHp);
                break;
            }
        }

        // search for name with extracted HP for first 5 lines.
        for (int i = 0; i < 5; i++) {

            matches = cardRepo.searchCards(
                lines[i].trim(),
                null,
                null,
                null,
                detectedHp,
                PageRequest.of(0, 100)
            ).getContent();

            // if a match is found, return it
            if (!matches.isEmpty()) {
                return matches;
            }
            
        }
        return matches;
    }
}