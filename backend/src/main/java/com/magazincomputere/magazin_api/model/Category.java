package com.magazincomputere.magazin_api.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode; // Pentru a gestiona corect relațiile bidirecționale
import lombok.ToString; // Pentru a gestiona corect relațiile bidirecționale

import java.util.List;

@Entity
@Table(name = "categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(length = 1000)
    private String description;

    // Relația One-to-Many cu Product (o categorie poate avea mai multe produse)
    // Comentat pentru a evita problemele de serializare ciclică dacă nu este gestionat atent în DTO-uri
    // Poți decomenta dacă ai nevoie să navighezi de la Category la Products și gestionezi DTO-urile corespunzător.
    // @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    // @ToString.Exclude // Pentru a evita bucle infinite la toString
    // @EqualsAndHashCode.Exclude // Pentru a evita bucle infinite la equals/hashCode
    // private List<Product> products;
}