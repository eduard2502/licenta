package com.magazincomputere.magazin_api.repository;

import com.magazincomputere.magazin_api.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {

    // Găsește toate comenzile pentru un anumit ID de utilizator
    List<Order> findByUserIdOrderByOrderDateDesc(Long userId);

    // Găsește toate comenzile pentru un anumit ID de client
    List<Order> findByCustomerIdOrderByOrderDateDesc(Long customerId);

    // Găsește comenzi după status
    List<Order> findByStatus(String status);

    // Găsește comenzi plasate într-un interval de date
    List<Order> findByOrderDateBetween(LocalDateTime startDate, LocalDateTime endDate);

    // Găsește comenzi plasate într-un interval de date și cu un anumit status
    List<Order> findByStatusAndOrderDateBetween(String status, LocalDateTime startDate, LocalDateTime endDate);

    // Pentru rapoarte: comenzi pentru o anumită categorie de produs într-un interval de timp
    // Acest lucru este mai complex și ar necesita probabil un @Query cu JOIN-uri
    // către OrderItem și Product pentru a filtra după categoryId din Product.
    // Exemplu de schelet pentru o astfel de interogare (necesită ajustare):
    /*
    @Query("SELECT o FROM Order o JOIN o.orderItems oi JOIN oi.product p WHERE p.category.id = :categoryId AND o.orderDate BETWEEN :startDate AND :endDate")
    List<Order> findOrdersByProductCategoryAndDateRange(
        @Param("categoryId") Long categoryId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
    */
}