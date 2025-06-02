package com.magazincomputere.magazin_api.repository;

import com.magazincomputere.magazin_api.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    // Găsește un client după email (dacă emailul este unic și folosit pentru identificare)
    Optional<Customer> findByEmail(String email);

    // Găsește un client după ID-ul utilizatorului asociat
    Optional<Customer> findByUserId(Long userId);
}