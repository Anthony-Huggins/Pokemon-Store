package com.skillstorm.pokemonstore.aspects;

import com.skillstorm.pokemonstore.exceptions.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Global Aspect for handling exceptions thrown across the application.
 * <p>
 * This class uses Spring AOP (via {@link ControllerAdvice}) to intercept exceptions thrown
 * from any Controller method. It transforms raw Java exceptions into structured, client-friendly
 * JSON responses with appropriate HTTP status codes.
 * </p>
 */
@ControllerAdvice
public class ExceptionHandlerAspect {

    /**
     * Handles {@link ResourceNotFoundException}.
     * <p>
     * Triggered when a requested entity (e.g., Warehouse, Item) does not exist.
     * </p>
     *
     * @param ex The caught exception containing the specific "not found" message.
     * @return A {@link ResponseEntity} containing a JSON error map and HTTP 404 Status.
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(ResourceNotFoundException ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("timestamp", LocalDateTime.now());
        error.put("status", HttpStatus.NOT_FOUND.value());
        error.put("error", "Not Found");
        error.put("message", ex.getMessage());

        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    /**
     * Handles {@link IllegalStateException}.
     * <p>
     * Triggered during business logic failures, such as attempting to add items to a full binder.
     * </p>
     *
     * @param ex The caught exception containing the validation error message.
     * @return A {@link ResponseEntity} containing a JSON error map and HTTP 400 Status.
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalState(IllegalStateException ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("timestamp", LocalDateTime.now());
        error.put("status", HttpStatus.BAD_REQUEST.value());
        error.put("error", "Bad Request");
        error.put("message", ex.getMessage());

        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles {@link IllegalArgumentException}.
     * <p>
     * Triggered when invalid arguments are passed to service methods (e.g., trying to add an item to a null location).
     * </p>
     *
     * @param ex The caught exception containing the argument error message.
     * @return A {@link ResponseEntity} containing a JSON error map and HTTP 400 Status.
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("timestamp", LocalDateTime.now());
        error.put("status", HttpStatus.BAD_REQUEST.value());
        error.put("error", "Bad Request");
        error.put("message", ex.getMessage());

        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    /**
     * Catch-all handler for unexpected exceptions.
     * <p>
     * This ensures that even unhandled runtime errors (like NullPointerException) return a JSON response
     * instead of a raw HTML stack trace.
     * </p>
     *
     * @param ex The unexpected exception.
     * @return A {@link ResponseEntity} containing a generic error message and HTTP 500 Status.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneralError(Exception ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("timestamp", LocalDateTime.now());
        error.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        error.put("error", "Internal Server Error");
        error.put("message", "An unexpected error occurred: " + ex.getMessage());

        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
