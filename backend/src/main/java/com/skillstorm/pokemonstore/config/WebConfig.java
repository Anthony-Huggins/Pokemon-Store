package com.skillstorm.pokemonstore.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 1. Define the physical path to the folder
        // Paths.get("card_images") looks for the folder at the Project Root
        Path uploadDir = Paths.get("backend/card_images");
        String uploadPath = uploadDir.toFile().getAbsolutePath();

        // 2. Map the URL "/images/**" to that physical folder
        // "file:" prefix is crucial—it tells Spring to look on the File System, not inside the JAR
        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:" + uploadPath + "/");
    }
}