package com.magazincomputere.magazin_api.repository;

import com.magazincomputere.magazin_api.model.ERole;
import com.magazincomputere.magazin_api.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Integer> {
    // Găsește un rol după numele său (enum)
    Optional<Role> findByName(ERole name);
}