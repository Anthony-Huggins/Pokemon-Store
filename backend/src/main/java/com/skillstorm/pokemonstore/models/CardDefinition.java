package com.skillstorm.pokemonstore.models;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "card_definitions")
public class CardDefinition {

    @Id
    private String id; // e.g., "sv1-001"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "set_id", referencedColumnName = "id")
    private CardSet set;

    @Column(name = "local_id", nullable = false)
    private String localId; // e.g., "001/198"

    @Column(nullable = false)
    private String name;

    @Column(name = "image_url")
    private String imageUrl;

    private String category; // Pokemon, Trainer, etc.

    private String rarity;

    private Integer hp;

    // --- List mapped to a separate table ---
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "card_definition_types", 
        joinColumns = @JoinColumn(name = "card_definition_id")
    )
    @Column(name = "type_name")
    private List<String> types = new ArrayList<>();

    // --- Constructors ---

    public CardDefinition() {
    }

    public CardDefinition(String id, CardSet set, String localId, String name, String imageUrl, String category, String rarity, Integer hp, List<String> types) {
        this.id = id;
        this.set = set;
        this.localId = localId;
        this.name = name;
        this.imageUrl = imageUrl;
        this.category = category;
        this.rarity = rarity;
        this.hp = hp;
        
        this.types = (types != null) ? new ArrayList<>(types) : new ArrayList<>();
    }

    // --- Getters and Setters ---

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public CardSet getSet() {
        return set;
    }

    public void setSet(CardSet set) {
        this.set = set;
    }

    public String getLocalId() {
        return localId;
    }

    public void setLocalId(String localId) {
        this.localId = localId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getRarity() {
        return rarity;
    }

    public void setRarity(String rarity) {
        this.rarity = rarity;
    }

    public Integer getHp() {
        return hp;
    }

    public void setHp(Integer hp) {
        this.hp = hp;
    }

    public List<String> getTypes() {
        return types;
    }

    public void setTypes(List<String> types) {
        this.types = types;
    }

    // --- Equals and HashCode ---

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CardDefinition that = (CardDefinition) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
