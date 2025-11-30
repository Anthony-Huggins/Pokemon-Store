package com.skillstorm.pokemonstore.repositories;

import com.skillstorm.pokemonstore.models.CardSet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CardSetRepository extends JpaRepository<CardSet, String> {
}
