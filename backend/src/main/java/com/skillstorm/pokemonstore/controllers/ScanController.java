package com.skillstorm.pokemonstore.controllers;

import com.skillstorm.pokemonstore.models.CardDefinition;
import com.skillstorm.pokemonstore.services.ScanService;
import com.skillstorm.pokemonstore.services.CardLibraryService; 
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("api/v1/scan")
@CrossOrigin(origins = "http://localhost:5173") // Allow React to call this
public class ScanController {



    private final ScanService ocrService;
    private final CardLibraryService libraryService; // You'll need this later to search DB

    public ScanController(ScanService ocrService, CardLibraryService libraryService) {
        this.ocrService = ocrService;
        this.libraryService = libraryService;
    }

    @PostMapping("/identify")
    public ResponseEntity<?> identifyCard(@RequestBody Map<String, String> payload) {
        try {
            String base64Image = payload.get("image");
            if (base64Image == null) return ResponseEntity.badRequest().body("No image provided");

            System.out.println("Processing Scan... (" + base64Image.length() + " chars)");

            // 1. Get Text from Google
            String detectedText = ocrService.detectText(base64Image);
            System.out.println("--- OCR RESULT ---\n" + detectedText);

            // 2. TODO: Match against DB (We will do this next)
            
            // Return empty list for now just to confirm flow works
            return ResponseEntity.ok(List.of());

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }
}