package com.skillstorm.pokemonstore.models.enums;

/**
 * Represents the physical condition of a card.
 * <p>
 * This is critical for valuation, as a {@link #NM} (Near Mint) card is worth significantly more
 * than a {@link #DMG} (Damaged) one.
 * </p>
 */
public enum CardCondition {
    /**
     * Near Mint: The card looks almost perfect.
     */
    NM,

    /**
     * Lightly Played: Minor edgewear or scuffs.
     */
    LP,

    /**
     * Moderately Played: Noticeable wear, whitening on corners.
     */
    MP,

    /**
     * Heavily Played: Significant wear, creases, or scratches.
     */
    HP,

    /**
     * Damaged: Bends, water damage, or tears.
     */
    DMG,

    /**
     * Sealed: An unopened product (e.g., a sealed promo packet).
     */
    SEALED
}