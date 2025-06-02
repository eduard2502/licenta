package com.magazincomputere.magazin_api.repository;

import com.magazincomputere.magazin_api.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    // Găsește o categorie după nume (util pentru a evita duplicate)
    Optional<Category> findByNameIgnoreCase(String name);
}