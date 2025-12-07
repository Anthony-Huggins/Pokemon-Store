package com.skillstorm.pokemonstore.models;

import com.skillstorm.pokemonstore.models.enums.LocationType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import java.util.Objects;

import org.hibernate.annotations.Formula;

/**
 * Represents a specific storage container inside a warehouse.
 * <p>
 * Examples include a specific "Display Case", a "Binder", or a "Bulk Box".
 * Crucially, this entity enforces a {@code maxCapacity} to prevent overfilling physical containers.
 * </p>
 */
@Entity
@Table(name = "storage_locations")
public class StorageLocation {

    /**
     * Unique identifier for the storage container.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /**
     * The parent warehouse where this container is located.
     * <p>
     * <b>API Note:</b> Annotated with {@link JsonIgnore} to prevent infinite recursion.
     * The frontend typically accesses this entity from the Warehouse context anyway.
     * </p>
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "warehouse_id", nullable = false)
    @JsonIgnoreProperties("storageLocations")
    private Warehouse warehouse;

    /**
     * A friendly name (e.g., "Charizard Binder #1").
     */
    @Column(nullable = false)
    private String name;

    /**
     * The category of container (Binder, Case, etc.).
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private LocationType type;

    /**
     * The hard limit on how many individual cards this container can hold.
     * Checked by the {@code InventoryService} before adding items.
     */
    @Column(name = "max_capacity", nullable = false)
    private Integer maxCapacity;

    // This runs a sub-query to count items for THIS specific location ID
    @Formula("(SELECT COUNT(*) FROM inventory_items i WHERE i.storage_location_id = id)")
    private int currentCount;


    // --- Constructors ---

    /**
     * Default no-args constructor required by JPA.
     */
    public StorageLocation() {}

    /**
     * Constructs a new StorageLocation.
     * @param warehouse The parent warehouse.
     * @param name The name of the container.
     * @param type The type of container.
     * @param maxCapacity The maximum number of cards allowed.
     */
    public StorageLocation(Warehouse warehouse, String name, LocationType type, Integer maxCapacity) {
        this.warehouse = warehouse;
        this.name = name;
        this.type = type;
        this.maxCapacity = maxCapacity;
    }

    // --- Getters & Setters ---

    /**
     * Gets the unique ID.
     * @return The ID.
     */
    public Integer getId() { return id; }

    /**
     * Sets the unique ID.
     * @param id The ID.
     */
    public void setId(Integer id) { this.id = id; }

    /**
     * Gets the parent Warehouse.
     * @return The Warehouse entity.
     */
    public Warehouse getWarehouse() { return warehouse; }

    /**
     * Sets the parent Warehouse.
     * @param warehouse The Warehouse entity.
     */
    public void setWarehouse(Warehouse warehouse) { this.warehouse = warehouse; }

    /**
     * Gets the container name.
     * @return The name string.
     */
    public String getName() { return name; }

    /**
     * Sets the container name.
     * @param name The name string.
     */
    public void setName(String name) { this.name = name; }

    /**
     * Gets the container type.
     * @return The LocationType enum.
     */
    public LocationType getType() { return type; }

    /**
     * Sets the container type.
     * @param type The LocationType enum.
     */
    public void setType(LocationType type) { this.type = type; }

    /**
     * Gets the maximum capacity.
     * @return The capacity integer.
     */
    public Integer getMaxCapacity() { return maxCapacity; }

    /**
     * Sets the maximum capacity.
     * @param maxCapacity The capacity integer.
     */
    public void setMaxCapacity(Integer maxCapacity) { this.maxCapacity = maxCapacity; }

    /**
     * Gets the current count of items in this location.
     * @return The current item count.
     */
    public int getCurrentCount() { return currentCount; }
    
    /**
     * Sets the current count of items in this location.
     * @param currentCount The current item count.
     */
    public void setCurrentCount(int currentCount) { this.currentCount = currentCount; }
    
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
        StorageLocation that = (StorageLocation) o;
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
     * Returns a string representation of the StorageLocation.
     * @return A string summary.
     */
    @Override
    public String toString() {
        return "StorageLocation{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", type=" + type +
                ", maxCapacity=" + maxCapacity +
                '}';
    }
}