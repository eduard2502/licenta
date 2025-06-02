package com.magazincomputere.magazin_api.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "specification_definitions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SpecificationDefinition {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name; // Ex: "Procesor", "RAM", "Culoare"

    @Column(length = 50)
    private String unit; // Ex: "GB", "MHz", "inch" (opțional)
}