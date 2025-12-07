package com.skillstorm.pokemonstore.models;

import com.skillstorm.pokemonstore.models.enums.CardCondition;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;

/**
 * Represents a stack of identical physical cards stored in a specific location.
 * <p>
 * This entity links the abstract {@link CardDefinition} (What is it?) to the
 * {@link StorageLocation} (Where is it?), while adding physical properties like
 * condition, quantity, and specific pricing.
 * </p>
 */
@Entity
@Table(name = "inventory_items")
public class InventoryItem {

    /**
     * Unique identifier for this inventory record.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The specific container (binder, case) holding these cards.
     */
    @ManyToOne
    @JoinColumn(name = "storage_location_id", nullable = false)
    private StorageLocation storageLocation;

    /**
     * The card definition (name, image, set info).
     */
    @ManyToOne
    @JoinColumn(name = "card_definition_id", nullable = false)
    private CardDefinition cardDefinition;

    /**
     * The physical condition of the cards (NM, LP, etc.).
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CardCondition condition;



    // --- Pricing Fields ---

    /**
     * A manually set price for this item.
     * Ignored if {@code matchMarketPrice} is true.
     */
    @Column(name = "set_price")
    private BigDecimal setPrice;

    /**
     * If true, the price is calculated dynamically based on TCGdex market data + markup.
     */
    @Column(name = "match_market_price", nullable = false)
    private Boolean matchMarketPrice = false;

    /**
     * The percentage markup to apply if matching market price.
     * (e.g., 10.00 adds 10% to the base market value).
     */
    @Column(name = "markup_percentage", nullable = false)
    private BigDecimal markupPercentage = BigDecimal.ZERO;

    // --- Timestamps ---

    /**
     * When this item was first added to inventory.
     */
    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    /**
     * When this item (e.g., quantity or price) was last changed.
     */
    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    // --- Constructors ---

    /**
     * Default no-args constructor required by JPA.
     */
    public InventoryItem() {}

    // --- Getters & Setters ---

    /**
     * Gets the unique inventory ID.
     * @return The ID.
     */
    public Long getId() { return id; }
    
    /**
     * Sets the unique inventory ID.
     * @param id The ID.
     */
    public void setId(Long id) { this.id = id; }

    /**
     * Gets the storage location.
     * @return The StorageLocation entity.
     */
    public StorageLocation getStorageLocation() { return storageLocation; }

    /**
     * Sets the storage location.
     * @param storageLocation The StorageLocation entity.
     */
    public void setStorageLocation(StorageLocation storageLocation) { this.storageLocation = storageLocation; }

    /**
     * Gets the card definition.
     * @return The CardDefinition entity.
     */
    public CardDefinition getCardDefinition() { return cardDefinition; }

    /**
     * Sets the card definition.
     * @param cardDefinition The CardDefinition entity.
     */
    public void setCardDefinition(CardDefinition cardDefinition) { this.cardDefinition = cardDefinition; }

    /**
     * Gets the condition.
     * @return The CardCondition enum.
     */
    public CardCondition getCondition() { return condition; }

    /**
     * Sets the condition.
     * @param condition The CardCondition enum.
     */
    public void setCondition(CardCondition condition) { this.condition = condition; }

    /**
     * Gets the manual price.
     * @return The price or null.
     */
    public BigDecimal getSetPrice() { return setPrice; }

    /**
     * Sets the manual price.
     * @param setPrice The price.
     */
    public void setSetPrice(BigDecimal setPrice) { this.setPrice = setPrice; }

    /**
     * Checks if market price matching is enabled.
     * @return True if enabled.
     */
    public Boolean getMatchMarketPrice() { return matchMarketPrice; }

    /**
     * Sets market price matching.
     * @param matchMarketPrice Boolean flag.
     */
    public void setMatchMarketPrice(Boolean matchMarketPrice) { this.matchMarketPrice = matchMarketPrice; }

    /**
     * Gets the markup percentage.
     * @return The percentage (e.g., 10.5).
     */
    public BigDecimal getMarkupPercentage() { return markupPercentage; }

    /**
     * Sets the markup percentage.
     * @param markupPercentage The percentage.
     */
    public void setMarkupPercentage(BigDecimal markupPercentage) { this.markupPercentage = markupPercentage; }

    /**
     * Lifecycle hook to automatically update the {@code updatedAt} timestamp
     * whenever the entity is modified in the database.
     */
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    // --- Overrides ---

    /**
     * Checks equality based on the unique Database ID.
     * @param o The object to compare.
     * @return true if IDs match.
     */
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        InventoryItem that = (InventoryItem) o;
        return Objects.equals(id, that.id);
    }

    /**
     * Generates a hash code based on the Database ID.
     * @return The hash code.
     */
    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    /**
     * Returns a string representation of the InventoryItem.
     * Includes basic details like ID, Card Name, and Condition.
     * @return A string summary.
     */
    @Override
    public String toString() {
        return "InventoryItem{" +
                "id=" + id +
                ", card=" + (cardDefinition != null ? cardDefinition.getName() : "null") +
                ", condition=" + condition +
                '}';
    }
}