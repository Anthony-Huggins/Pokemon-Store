package com.skillstorm.pokemonstore.exceptions;

/**
 * Custom exception thrown when a requested resource (Warehouse, Item, etc.) cannot be found in the database.
 * <p>
 * This exception is intercepted by the {@link com.skillstorm.pokemonstore.aspects.ExceptionHandlerAspect}
 * to return a standard HTTP 404 Not Found response.
 * </p>
 */
public class ResourceNotFoundException extends RuntimeException {

    /**
     * Constructs a new ResourceNotFoundException with the specified detail message.
     *
     * @param message The detail message explaining which resource was not found (e.g., "Warehouse ID 5 not found").
     */
    public ResourceNotFoundException(String message) {
        super(message);
    }
}