package com.skillstorm.pokemonstore.Configuration;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import javax.sql.DataSource;
import java.sql.Connection;

@Configuration
public class DatabaseCheck {

    @Bean
    CommandLineRunner testConnection(DataSource dataSource) {
        return args -> {
            try (Connection connection = dataSource.getConnection()) {
                if (connection.isValid(1)) {
                    System.out.println("✅✅✅ DATABASE CONNECTED SUCCESSFULLY! ✅✅✅");
                    System.out.println("URL: " + connection.getMetaData().getURL());
                } else {
                    System.out.println("❌❌❌ DATABASE CONNECTION FAILED ❌❌❌");
                }
            } catch (Exception e) {
                System.out.println("❌❌❌ DATABASE ERROR: " + e.getMessage());
            }
        };
    }
}
