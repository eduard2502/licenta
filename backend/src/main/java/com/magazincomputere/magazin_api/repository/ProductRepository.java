package com.magazincomputere.magazin_api.repository;

import com.magazincomputere.magazin_api.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor; // Pentru căutare/filtrare complexă
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    // Găsește produse după ID-ul categoriei
    List<Product> findByCategoryId(Long categoryId);

    // Găsește produse al căror nume conține un anumit string (case-insensitive)
    List<Product> findByNameContainingIgnoreCase(String name);

    // Găsește produse într-un interval de preț
    List<Product> findByPriceBetween(BigDecimal minPrice, BigDecimal maxPrice);

    // Găsește produse după ID categorie și într-un interval de preț
    List<Product> findByCategoryIdAndPriceBetween(Long categoryId, BigDecimal minPrice, BigDecimal maxPrice);

    // Poți adăuga aici și alte metode de interogare bazate pe convențiile de numire Spring Data JPA
    // sau folosind @Query pentru interogări JPQL sau SQL native mai complexe.
}