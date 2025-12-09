package com.skillstorm.pokemonstore.controllers;

import com.skillstorm.pokemonstore.services.PriceSyncService;
import com.skillstorm.pokemonstore.services.TcgDexSyncService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@RestController
@RequestMapping("/api/v1/sync")
@CrossOrigin(origins = "http://localhost:5173") // Explicit origin often helps SSE
public class SyncController {

    private final TcgDexSyncService cardSyncService;
    private final PriceSyncService priceSyncService;
    // Use a cached thread pool to manage background tasks efficiently
    private final ExecutorService executor = Executors.newCachedThreadPool();

    public SyncController(TcgDexSyncService cardSyncService, PriceSyncService priceSyncService) {
        this.cardSyncService = cardSyncService;
        this.priceSyncService = priceSyncService;
    }

    /**
     * Helper to create an SSE stream and handle the background execution.
     */
    private SseEmitter streamTask(RunnableWithProgress task) {
        // Timeout: 60 minutes (enough for full library sync)
        SseEmitter emitter = new SseEmitter(3600000L);

        executor.execute(() -> {
            try {
                // Run the service logic, passing a callback to send progress events
                task.run(progress -> {
                    try {
                        // Send "progress" event: { "data": 50.5 }
                        emitter.send(SseEmitter.event().name("progress").data(progress));
                    } catch (IOException e) {
                        emitter.completeWithError(e);
                    }
                });
                
                // Send "complete" event when done
                emitter.send(SseEmitter.event().name("complete").data("Done"));
                emitter.complete();
                
            } catch (Exception e) {
                emitter.completeWithError(e);
            }
        });

        return emitter;
    }

    // Functional Interface for our tasks
    interface RunnableWithProgress {
        void run(java.util.function.Consumer<Integer> progressCallback);
    }

    // --- ENDPOINTS ---

    @GetMapping("/sets")
    public SseEmitter syncAllSets() {
        return streamTask(cardSyncService::syncAllSets);
    }

    @GetMapping("/prices/inventory")
    public SseEmitter syncInventoryPrices() {
        return streamTask(priceSyncService::syncInventoryPrices);
    }

    @GetMapping("/prices/library")
    public SseEmitter syncLibraryPrices() {
        return streamTask(priceSyncService::syncLibraryPrices);
    }
}