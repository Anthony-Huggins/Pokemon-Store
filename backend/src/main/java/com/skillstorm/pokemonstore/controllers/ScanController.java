package com.skillstorm.pokemonstore.controllers;

import com.skillstorm.pokemonstore.models.CardDefinition;
import com.skillstorm.pokemonstore.services.ScanService;
import com.skillstorm.pokemonstore.services.CardLibraryService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for handling image scanning and card identification operations.
 * <p>
 * This controller serves as the entry point for the "Card Scanner" feature. It accepts
 * Base64-encoded images from the frontend, delegates OCR processing to the {@link ScanService},
 * and then queries the database via the {@link CardLibraryService} to find matching Pokémon cards.
 * </p>
 */
@RestController
@RequestMapping("api/v1/scan")
@CrossOrigin(origins = "http://localhost:5173") // Allow React to call this
public class ScanController {


    private final ScanService scanService;

    /**
     * Constructs a new ScanController with the required services.
     *
     * @param scanService     The service responsible for performing OCR (Optical Character Recognition) on images.
     */
    public ScanController(ScanService scanService) {
        this.scanService = scanService;

    }


   
    @PostMapping("/identify")
    public ResponseEntity<?> identifyCard(@RequestBody Map<String, String> payload) {
        try {
            String base64Image = payload.get("image");
            if (base64Image == null || base64Image.isBlank()) {
                return ResponseEntity.badRequest().body("No image provided");
            }

            // Delegate all logic to the service
            List<CardDefinition> matches = scanService.identifyBestMatch(base64Image);

            return ResponseEntity.ok(matches);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error processing scan: " + e.getMessage());
        }
    }
}