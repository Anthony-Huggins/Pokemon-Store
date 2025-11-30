package com.skillstorm.pokemonstore.models;

import jakarta.persistence.*;
import java.util.Objects;

@Entity
@Table(name = "sets")
public class CardSet {

    @Id
    private String id; // e.g., "sv1"

    @Column(nullable = false)
    private String name;

    private String series;

    @Column(name = "total_cards")
    private Integer totalCards;

    @Column(name = "logo_url")
    private String logoUrl;

    // --- Constructors ---

    public CardSet() {
    }

    public CardSet(String id, String name, String series, Integer totalCards, String logoUrl) {
        this.id = id;
        this.name = name;
        this.series = series;
        this.totalCards = totalCards;
        this.logoUrl = logoUrl;
    }

    // --- Getters and Setters ---

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSeries() {
        return series;
    }

    public void setSeries(String series) {
        this.series = series;
    }

    public Integer getTotalCards() {
        return totalCards;
    }

    public void setTotalCards(Integer totalCards) {
        this.totalCards = totalCards;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    // --- Equals and HashCode ---

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CardSet cardSet = (CardSet) o;
        return Objects.equals(id, cardSet.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
