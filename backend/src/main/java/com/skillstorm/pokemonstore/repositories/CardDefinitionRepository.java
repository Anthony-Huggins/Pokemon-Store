package com.skillstorm.pokemonstore.repositories;

import com.skillstorm.pokemonstore.models.CardDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CardDefinitionRepository extends JpaRepository<CardDefinition, String> {
}