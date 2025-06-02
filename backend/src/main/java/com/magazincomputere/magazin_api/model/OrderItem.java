package com.magazincomputere.magazin_api.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Order order;

    // Stochează ID-ul produsului și alte detalii relevante la momentul comenzii
    // pentru a evita probleme dacă produsul este șters sau modificat ulterior.
    @Column(nullable = false)
    private Long productIdSnapshot; // ID-ul produsului la momentul comenzii

    @Column(nullable = false)
    private String productNameSnapshot; // Numele produsului la momentul comenzii

    @Lob
    @Column(columnDefinition = "TEXT")
    private String productImageBase64Snapshot; // Imaginea produsului la momentul comenzii

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal priceAtPurchase; // Prețul unitar al produsului la momentul comenzii

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal lineTotal; // quantity * priceAtPurchase

    // Dacă vrei o legătură directă la entitatea Product (poate fi utilă, dar gestionează cu atenție
    // dacă produsul poate fi șters și comanda trebuie să existe în continuare)
    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "product_id", foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT)) // Permite product_id null dacă produsul e șters
    // private Product product;
}