package com.magazincomputere.magazin_api.repository;

import com.magazincomputere.magazin_api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Găsește un utilizator după username (pentru login și verificare existență)
    Optional<User> findByUsername(String username);

    // Verifică dacă un utilizator există după username
    Boolean existsByUsername(String username);

    // Verifică dacă un utilizator există după email
    Boolean existsByEmail(String email);
}