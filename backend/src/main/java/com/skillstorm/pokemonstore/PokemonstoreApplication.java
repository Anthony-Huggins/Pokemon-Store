package com.skillstorm.pokemonstore;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.skillstorm.pokemonstore.repositories.CardSetRepository;
import com.skillstorm.pokemonstore.services.TcgDexSyncService;

@SpringBootApplication
public class PokemonstoreApplication {

	public static void main(String[] args) {
		SpringApplication.run(PokemonstoreApplication.class, args);
	}

	@Bean
    CommandLineRunner run(TcgDexSyncService service, CardSetRepository setRepository) {
        return args -> {
            // Check if we already have data to avoid re-syncing on every restart
            long setCount = setRepository.count();
            
            if (setCount == 0) {
                System.out.println("Database is empty. Starting initial seed from TCGdex...");
                service.syncAllSets();
            } else {
                System.out.println("Database already contains " + setCount + " sets. Skipping initial sync.");
                // If you want to force a sync, you can delete the db file or drop tables
            }
        };
    }
}
