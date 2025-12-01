package com.skillstorm.pokemonstore.models.enums;

/**
 * Defines the specific type of storage container within a warehouse.
 * <p>
 * This helps categorize where items are stored physically.
 * For example, high-value cards might be in a {@link #DISPLAY_CASE}, while bulk commons are in a {@link #BULK_BOX}.
 * </p>
 */
public enum LocationType {
    /**
     * A glass case usually at the front of the store for high-value singles.
     */
    DISPLAY_CASE,

    /**
     * A physical binder containing pages of cards, usually organized by set or type.
     */
    BINDER,

    /**
     * Large boxes (e.g., 5000-count boxes) for low-value bulk inventory.
     */
    BULK_BOX,

    /**
     * Storage in the back office, not accessible to customers.
     */
    BACK_ROOM
}