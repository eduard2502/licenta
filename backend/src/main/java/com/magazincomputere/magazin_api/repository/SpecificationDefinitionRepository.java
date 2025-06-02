package com.magazincomputere.magazin_api.repository;

import com.magazincomputere.magazin_api.model.SpecificationDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SpecificationDefinitionRepository extends JpaRepository<SpecificationDefinition, Long> {
    // Găsește o definiție de specificație după nume (util pentru a evita duplicate)
    Optional<SpecificationDefinition> findByNameIgnoreCase(String name);
}