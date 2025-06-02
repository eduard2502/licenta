package com.magazincomputere.magazin_api.repository;

import com.magazincomputere.magazin_api.model.ProductSpecificationValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductSpecificationValueRepository extends JpaRepository<ProductSpecificationValue, Long> {
    // Găsește toate valorile specificațiilor pentru un anumit produs
    List<ProductSpecificationValue> findByProductId(Long productId);

    // Găsește toate valorile pentru o anumită definiție de specificație
    List<ProductSpecificationValue> findBySpecificationDefinitionId(Long definitionId);

    // Șterge toate valorile specificațiilor pentru un produs (util la actualizarea produsului)
    void deleteByProductId(Long productId);
}