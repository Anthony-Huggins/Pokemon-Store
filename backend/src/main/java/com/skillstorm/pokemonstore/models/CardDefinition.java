package com.skillstorm.pokemonstore.models;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Represents the static definition of a Pokémon card as it exists in the official library.
 * This entity stores immutable data about a card (e.g., name, HP, types) that is fetched
 * from an external API (TCGdex).
 * <p>
 * This class does not track inventory quantity or condition; it serves as the "blueprint"
 * for {@link InventoryItem} entities.
 * </p>
 */
@Entity
@Table(name = "card_definitions")
public class CardDefinition {

    /**
     * The unique identifier for the card, typically provided by the API.
     * Example: "sv1-001" (Scarlet & Violet Base Set, Card #1).
     */
    @Id
    private String id;

    /**
     * The expansion set this card belongs to.
     * Fetched lazily to optimize performance when loading large lists of cards.
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "set_id", referencedColumnName = "id")
    private CardSet set;

    /**
     * The local identifier printed on the card itself.
     * Example: "001/198".
     */
    @Column(name = "local_id", nullable = false)
    private String localId;

    /**
     * The name of the card.
     * Example: "Bulbasaur".
     */
    @Column(nullable = false)
    private String name;

    /**
     * The URL to the high-resolution image of the card.
     */
    @Column(name = "image_url")
    private String imageUrl;

    /**
     * The category of the card.
     * Examples: "Pokemon", "Trainer", "Energy".
     */
    private String category;

    /**
     * The rarity level of the card.
     * Examples: "Common", "Rare Holo", "Secret Rare".
     */
    private String rarity;

    /**
     * The Hit Points (HP) of the Pokémon.
     * Can be null for non-Pokémon cards (e.g., Trainers).
     */
    private Integer hp;

    /**
     * A list of elemental types associated with the card.
     * Examples: ["Grass", "Poison"].
     * <p>
     * Mapped to a separate table `card_definition_types` via {@code @ElementCollection}.
     * Fetched EAGERly as the data is lightweight and almost always needed for display.
     * </p>
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "card_definition_types", 
        joinColumns = @JoinColumn(name = "card_definition_id")
    )
    @Column(name = "type_name")
    private List<String> types = new ArrayList<>();

    // --- Constructors ---

    /**
     * Default no-args constructor required by JPA.
     */
    public CardDefinition() {
    }

    /**
     * Constructs a new CardDefinition with all required fields.
     * <p>
     * Note: The `types` list is defensively copied into a new ArrayList to ensure mutability
     * for Hibernate, preventing issues with immutable lists returned by APIs.
     * </p>
     *
     * @param id       The unique API identifier (e.g., "sv1-001").
     * @param set      The {@link CardSet} this card belongs to.
     * @param localId  The printed card number (e.g., "001/198").
     * @param name     The name of the card.
     * @param imageUrl URL to the card image.
     * @param category The card category (Pokemon, Trainer, etc.).
     * @param rarity   The rarity string.
     * @param hp       The hit points (nullable).
     * @param types    A list of types (e.g., "Fire"). Can be null (will be initialized as empty).
     */
    public CardDefinition(String id, CardSet set, String localId, String name, 
                          String imageUrl, String category, String rarity, 
                          Integer hp, List<String> types) {
        this.id = id;
        this.set = set;
        this.localId = localId;
        this.name = name;
        this.imageUrl = imageUrl;
        this.category = category;
        this.rarity = rarity;
        this.hp = hp;
        
        // Ensure the list is a mutable ArrayList for Hibernate
        this.types = (types != null) ? new ArrayList<>(types) : new ArrayList<>();
    }

    // --- Getters and Setters ---

    /**
     * Gets the unique API ID.
     * @return The ID string.
     */
    public String getId() {
        return id;
    }

    /**
     * Sets the unique API ID.
     * @param id The ID string.
     */
    public void setId(String id) {
        this.id = id;
    }

    /**
     * Gets the associated CardSet.
     * @return The CardSet entity.
     */
    public CardSet getSet() {
        return set;
    }

    /**
     * Sets the associated CardSet.
     * @param set The CardSet entity.
     */
    public void setSet(CardSet set) {
        this.set = set;
    }

    /**
     * Gets the local ID (printed number).
     * @return The local ID string.
     */
    public String getLocalId() {
        return localId;
    }

    /**
     * Sets the local ID.
     * @param localId The local ID string.
     */
    public void setLocalId(String localId) {
        this.localId = localId;
    }

    /**
     * Gets the card name.
     * @return The name string.
     */
    public String getName() {
        return name;
    }

    /**
     * Sets the card name.
     * @param name The name string.
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Gets the image URL.
     * @return The URL string.
     */
    public String getImageUrl() {
        return imageUrl;
    }

    /**
     * Sets the image URL.
     * @param imageUrl The URL string.
     */
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    /**
     * Gets the card category.
     * @return The category string.
     */
    public String getCategory() {
        return category;
    }

    /**
     * Sets the card category.
     * @param category The category string.
     */
    public void setCategory(String category) {
        this.category = category;
    }

    /**
     * Gets the card rarity.
     * @return The rarity string.
     */
    public String getRarity() {
        return rarity;
    }

    /**
     * Sets the card rarity.
     * @param rarity The rarity string.
     */
    public void setRarity(String rarity) {
        this.rarity = rarity;
    }

    /**
     * Gets the HP.
     * @return The HP integer, or null if not applicable.
     */
    public Integer getHp() {
        return hp;
    }

    /**
     * Sets the HP.
     * @param hp The HP integer.
     */
    public void setHp(Integer hp) {
        this.hp = hp;
    }

    /**
     * Gets the list of types.
     * @return A list of type strings.
     */
    public List<String> getTypes() {
        return types;
    }

    /**
     * Sets the list of types.
     * @param types A list of type strings.
     */
    public void setTypes(List<String> types) {
        this.types = types;
    }

    // --- Equals and HashCode ---

    /**
     * Checks equality based on the unique ID.
     * @param o The object to compare.
     * @return true if IDs match, false otherwise.
     */
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CardDefinition that = (CardDefinition) o;
        return Objects.equals(id, that.id);
    }

    /**
     * Generates a hash code based on the unique ID.
     * @return The hash code.
     */
    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}