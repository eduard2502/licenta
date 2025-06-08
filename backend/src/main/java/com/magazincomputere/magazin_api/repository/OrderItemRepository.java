// src/main/java/com/magazincomputere/magazin_api/repository/OrderItemRepository.java
package com.magazincomputere.magazin_api.repository;

import com.magazincomputere.magazin_api.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// import java.util.List; // Decomentează dacă adaugi metode custom

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    // Spring Data JPA va furniza automat implementările pentru metodele CRUD de bază
    // (save, findById, findAll, delete, etc.) pentru entitatea OrderItem.

    // Poți adăuga metode custom de interogare aici dacă este necesar în viitor.
    // De exemplu, dacă ai vrea să găsești toate articolele unei anumite comenzi
    // direct prin acest repository (deși acest lucru este de obicei gestionat
    // prin colecția `orderItems` din entitatea `Order`):
    // List<OrderItem> findByOrderId(Long orderId);

    // Sau pentru a găsi articolele care conțin un anumit produs (snapshot ID):
    // List<OrderItem> findByProductIdSnapshot(Long productIdSnapshot);
}
