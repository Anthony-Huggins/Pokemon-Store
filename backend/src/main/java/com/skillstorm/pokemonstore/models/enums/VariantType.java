package com.skillstorm.pokemonstore.models.enums;

/**
 * Represents the specific printing variant of a card.
 * <p>
 * TCGdex tracks prices separately for these variants. For example, a "Reverse Holo" Charizard
 * has a different market price than the "Normal" version of the same card ID.
 * </p>
 */
public enum VariantType {
    /**
     * Standard non-foil printing.
     */
    NORMAL,

    /**
     * The main artwork is foil (holographic).
     */
    HOLO,

    /**
     * The card frame is foil, but the artwork is not (Reverse Holo).
     */
    REVERSE,

    /**
     * Specific to older WOTC era sets (Base Set, Jungle, etc.) indicating the first print run.
     */
    FIRST_EDITION
}