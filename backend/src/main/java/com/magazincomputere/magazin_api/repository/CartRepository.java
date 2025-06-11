package com.magazincomputere.magazin_api.repository;

import com.magazincomputere.magazin_api.model.Cart;
import com.magazincomputere.magazin_api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUser(User user);
    
    Optional<Cart> findByUserId(Long userId);
    
    Optional<Cart> findBySessionId(String sessionId);
    
    
}