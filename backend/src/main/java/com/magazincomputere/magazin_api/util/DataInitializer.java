package com.magazincomputere.magazin_api.util; // Sau pachetul tău de config/util

import com.magazincomputere.magazin_api.model.ERole;
import com.magazincomputere.magazin_api.model.Role;
import com.magazincomputere.magazin_api.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

@Component // Important pentru ca Spring să o detecteze și să ruleze bean-ul CommandLineRunner
public class DataInitializer {

    @Bean // Acest bean va fi executat la pornirea aplicației
    CommandLineRunner initRoles(RoleRepository roleRepository) {
        return args -> {
            // Verifică și adaugă ROLE_USER dacă nu există
            if (roleRepository.findByName(ERole.ROLE_USER).isEmpty()) {
                Role userRole = new Role(); // Presupunând că ai un constructor implicit
                userRole.setName(ERole.ROLE_USER);
                roleRepository.save(userRole);
                System.out.println("Initialized ROLE_USER");
            }

            // Verifică și adaugă ROLE_ADMIN dacă nu există
            if (roleRepository.findByName(ERole.ROLE_ADMIN).isEmpty()) {
                Role adminRole = new Role(); // Presupunând că ai un constructor implicit
                adminRole.setName(ERole.ROLE_ADMIN);
                roleRepository.save(adminRole);
                System.out.println("Initialized ROLE_ADMIN");
            }
        };
    }

    // Opțional: Poți adăuga aici și crearea unui utilizator admin default
    // Asigură-te că faci asta DUPĂ ce rolurile sunt create și că gestionezi cazul în care userul admin deja există.
    /*
    @Bean
    CommandLineRunner initAdminUser(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.findByUsername("admin").isEmpty()) {
                User adminUser = new User("admin", "admin@magazin.com", passwordEncoder.encode("admin123"));
                Set<Role> roles = new HashSet<>();
                Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                                   .orElseThrow(() -> new RuntimeException("Error: Role ADMIN is not found for default admin user."));
                roles.add(adminRole);
                adminUser.setRoles(roles);
                userRepository.save(adminUser);
                System.out.println("Initialized default ADMIN user.");
            }
        };
    }
    */
}