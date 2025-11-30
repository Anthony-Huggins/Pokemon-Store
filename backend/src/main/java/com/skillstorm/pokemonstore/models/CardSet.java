package com.skillstorm.pokemonstore.models;

import jakarta.persistence.*;
import java.util.Objects;

/**
 * Represents a specific Pokémon Trading Card Game expansion set (e.g., "Scarlet & Violet Base").
 * <p>
 * This entity stores metadata about the set itself, which groups individual {@link CardDefinition} entities.
 * Data is typically synced from the TCGdex API.
 * </p>
 */
@Entity
@Table(name = "sets")
public class CardSet {

    /**
     * The unique identifier for the set, provided by the API.
     * Example: "sv1" (Scarlet & Violet), "swsh1" (Sword & Shield Base).
     */
    @Id
    private String id;

    /**
     * The official name of the expansion set.
     * Example: "Scarlet & Violet Base Set".
     */
    @Column(nullable = false)
    private String name;

    /**
     * The series/era the set belongs to.
     * Example: "Scarlet & Violet", "Sword & Shield", "Sun & Moon".
     */
    private String series;

    /**
     * The total number of cards officially listed in this set.
     * This count might differ from the actual database count if secret rares are included or excluded by the API.
     */
    @Column(name = "total_cards")
    private Integer totalCards;

    /**
     * The URL to the set's official logo image.
     */
    @Column(name = "logo_url")
    private String logoUrl;

    // --- Constructors ---

    /**
     * Default no-args constructor required by JPA.
     */
    public CardSet() {
    }

    /**
     * Constructs a new CardSet with all details.
     *
     * @param id         The unique API identifier (e.g., "sv1").
     * @param name       The official name of the set.
     * @param series     The series name (e.g., "Scarlet & Violet").
     * @param totalCards The total count of cards in the set.
     * @param logoUrl    The URL for the set's logo.
     */
    public CardSet(String id, String name, String series, Integer totalCards, String logoUrl) {
        this.id = id;
        this.name = name;
        this.series = series;
        this.totalCards = totalCards;
        this.logoUrl = logoUrl;
    }

    // --- Getters and Setters ---

    /**
     * Gets the unique set ID.
     * @return The ID string.
     */
    public String getId() {
        return id;
    }

    /**
     * Sets the unique set ID.
     * @param id The ID string.
     */
    public void setId(String id) {
        this.id = id;
    }

    /**
     * Gets the set name.
     * @return The name string.
     */
    public String getName() {
        return name;
    }

    /**
     * Sets the set name.
     * @param name The name string.
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Gets the series name.
     * @return The series string.
     */
    public String getSeries() {
        return series;
    }

    /**
     * Sets the series name.
     * @param series The series string.
     */
    public void setSeries(String series) {
        this.series = series;
    }

    /**
     * Gets the total number of cards in the set.
     * @return The integer count.
     */
    public Integer getTotalCards() {
        return totalCards;
    }

    /**
     * Sets the total number of cards.
     * @param totalCards The integer count.
     */
    public void setTotalCards(Integer totalCards) {
        this.totalCards = totalCards;
    }

    /**
     * Gets the logo URL.
     * @return The URL string.
     */
    public String getLogoUrl() {
        return logoUrl;
    }

    /**
     * Sets the logo URL.
     * @param logoUrl The URL string.
     */
    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    // --- Equals and HashCode ---

    /**
     * Checks equality based on the unique Set ID.
     * @param o The object to compare.
     * @return true if IDs match, false otherwise.
     */
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CardSet cardSet = (CardSet) o;
        return Objects.equals(id, cardSet.id);
    }

    /**
     * Generates a hash code based on the unique Set ID.
     * @return The hash code.
     */
    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}