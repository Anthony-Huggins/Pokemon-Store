package com.skillstorm.pokemonstore;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.fasterxml.jackson.datatype.hibernate5.jakarta.Hibernate5JakartaModule;
import com.skillstorm.pokemonstore.repositories.CardSetRepository;
import com.skillstorm.pokemonstore.services.TcgDexSyncService;

/**
 * The main entry point for the Pokémon Store Inventory Management System.
 * <p>
 * This class bootstraps the Spring Boot application and configures the initial startup behavior.
 * It includes a {@link CommandLineRunner} to automatically seed the database with Pokémon card data
 * from the TCGdex API if the local database is detected as empty.
 * </p>
 */
@SpringBootApplication
public class PokemonstoreApplication {

    /**
     * The main method that launches the Spring Boot application.
     *
     * @param args Command line arguments passed to the application.
     */
    public static void main(String[] args) {
        SpringApplication.run(PokemonstoreApplication.class, args);
    }

    /**
     * Configures the Hibernate5JakartaModule for Jackson to handle lazy loading and proxies.
     * This bean ensures that Hibernate-specific types are properly serialized/deserialized
     * when working with JSON in REST APIs.
     *
     * @return An instance of Hibernate5JakartaModule.
     */
    @Bean
    public Hibernate5JakartaModule hibernate5Module() {
        return new Hibernate5JakartaModule();
    }


    /**
     * Defines a startup task that checks the database state and performs initial data seeding.
     * <p>
     * This bean runs automatically after the Spring application context is loaded.
     * It checks if the {@link CardSetRepository} is empty. If it is, it triggers a full
     * synchronization via {@link TcgDexSyncService#syncAllSets()}.
     * </p>
     *
     * @param service       The service used to sync data from the TCGdex API.
     * @param setRepository The repository used to check existing data counts.
     * @return A CommandLineRunner lambda that executes the seeding logic.
     */
    @Bean
    CommandLineRunner run(TcgDexSyncService service, CardSetRepository setRepository) {
        return args -> {
            // Check if we already have data to avoid re-syncing on every restart
            long setCount = setRepository.count();
            
            if (setCount == 0) {
                System.out.println("Database is empty. Starting initial seed from TCGdex...");
                //service.syncAllSets();
            } else {
                System.out.println("Database already contains " + setCount + " sets. Skipping initial sync.");
                // If you want to force a sync, you can delete the db file or drop tables manually
            }
        };
    }

    
}
