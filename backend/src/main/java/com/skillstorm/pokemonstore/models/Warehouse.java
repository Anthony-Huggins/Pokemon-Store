package com.skillstorm.pokemonstore.models;

import jakarta.persistence.*;
import java.util.List;
import java.util.Objects;

/**
 * Represents a physical building or store location.
 * <p>
 * A Warehouse is the top-level container in the hierarchy. It contains multiple {@link StorageLocation}s
 * (like binders or cases).
 * </p>
 */
@Entity
@Table(name = "warehouses")
public class Warehouse {

    /**
     * Unique identifier for the warehouse.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /**
     * Friendly name for the store (e.g., "Downtown Branch").
     */
    @Column(nullable = false)
    private String name;

    /**
     * Physical address or description of location.
     */
    private String location;

    /**
     * The list of storage containers inside this warehouse.
     * <p>
     * <b>API Note:</b> This list IS serialized to JSON. This allows the frontend to fetch
     * a Warehouse and immediately see all binders/cases inside it without a second API call.
     * </p>
     */
    @OneToMany(mappedBy = "warehouse", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StorageLocation> storageLocations;

    // --- Constructors ---

    /**
     * Default no-args constructor required by JPA.
     */
    public Warehouse() {}

    /**
     * Constructs a new Warehouse.
     * @param name The store name.
     * @param location The physical address.
     */
    public Warehouse(String name, String location) {
        this.name = name;
        this.location = location;
    }

    // --- Getters & Setters ---

    /**
     * Gets the unique warehouse ID.
     * @return The ID.
     */
    public Integer getId() { return id; }

    /**
     * Sets the warehouse ID.
     * @param id The ID.
     */
    public void setId(Integer id) { this.id = id; }

    /**
     * Gets the store name.
     * @return The name string.
     */
    public String getName() { return name; }

    /**
     * Sets the store name.
     * @param name The name string.
     */
    public void setName(String name) { this.name = name; }

    /**
     * Gets the physical location/address.
     * @return The location string.
     */
    public String getLocation() { return location; }

    /**
     * Sets the physical location.
     * @param location The location string.
     */
    public void setLocation(String location) { this.location = location; }

    /**
     * Gets the list of storage locations (binders, cases) in this store.
     * @return A list of StorageLocation entities.
     */
    public List<StorageLocation> getStorageLocations() { return storageLocations; }

    /**
     * Sets the list of storage locations.
     * @param storageLocations The list of entities.
     */
    public void setStorageLocations(List<StorageLocation> storageLocations) { this.storageLocations = storageLocations; }

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
        Warehouse warehouse = (Warehouse) o;
        return Objects.equals(id, warehouse.id);
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
     * Returns a string representation of the Warehouse.
     * <p>Note: The list of storage locations is omitted to prevent large log outputs.</p>
     * @return A string summary.
     */
    @Override
    public String toString() {
        return "Warehouse{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", location='" + location + '\'' +
                '}';
    }
}