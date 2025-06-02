package com.magazincomputere.magazin_api.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Entity
@Table(name = "product_specification_values", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"product_id", "specification_definition_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductSpecificationValue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Product product;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "specification_definition_id", nullable = false)
    private SpecificationDefinition specificationDefinition;

    @Column(name = "specification_value", nullable = false, length = 255) // AM SCHIMBAT NUMELE COLOANEI AICI
    private String value;
}