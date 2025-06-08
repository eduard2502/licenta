// src/main/java/com/magazincomputere/magazin_api/util/DataInitializer.java
package com.magazincomputere.magazin_api.util;

import com.magazincomputere.magazin_api.model.ERole;
import com.magazincomputere.magazin_api.model.Role;
import com.magazincomputere.magazin_api.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Această componentă rulează o singură dată la pornirea aplicației.
 * Scopul său este să inițializeze datele esențiale în baza de date,
 * cum ar fi rolurile de utilizator.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Această metodă va fi executată la pornirea aplicației Spring Boot.
     */
    @Override
    public void run(String... args) throws Exception {
        
        // ==============================================================================
        // == GENERAREA HASH-URILOR PENTRU PAROLE (SCOP TEMPORAR) ==
        // ==============================================================================
        System.out.println("====================================================================");
        System.out.println("Parola pentru 'admin123' encodata: " + passwordEncoder.encode("admin123"));
        System.out.println("Parola pentru 'user123' encodata: " + passwordEncoder.encode("user123"));
        System.out.println("====================================================================");
        // ==============================================================================


        // ==============================================================================
        // == INIȚIALIZAREA ROLURILOR ÎN BAZA DE DATE ==
        // ==============================================================================
        try {
            // Verifică dacă rolul ROLE_USER există
            if (roleRepository.findByName(ERole.ROLE_USER).isEmpty()) {
                // Creează un obiect Role folosind constructorul fără argumente
                Role userRole = new Role();
                // Setează numele rolului
                userRole.setName(ERole.ROLE_USER);
                // Salvează obiectul în baza de date
                roleRepository.save(userRole); // <<< CORECTAT
                System.out.println("Rolul ROLE_USER a fost adăugat în baza de date.");
            }

            // Verifică dacă rolul ROLE_ADMIN există
            if (roleRepository.findByName(ERole.ROLE_ADMIN).isEmpty()) {
                // Creează un obiect Role folosind constructorul fără argumente
                Role adminRole = new Role();
                // Setează numele rolului
                adminRole.setName(ERole.ROLE_ADMIN);
                // Salvează obiectul în baza de date
                roleRepository.save(adminRole); // <<< CORECTAT
                System.out.println("Rolul ROLE_ADMIN a fost adăugat în baza de date.");
            }
        } catch (Exception e) {
            System.err.println("Eroare la inițializarea rolurilor: " + e.getMessage());
        }
    }
}
