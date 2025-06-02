package com.magazincomputere.magazin_api.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders") // "order" este adesea un cuvânt cheie SQL, deci "orders" e mai sigur
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Referință către User (dacă utilizatorul este logat) sau Customer (dacă informațiile sunt separate)
    // Alege una dintre următoarele două sau gestionează ambele dacă permiți comenzi guest
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id") // Poate fi null dacă se permite comandă fără cont și se folosește Customer
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false) // O comandă trebuie să aibă un client asociat
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Customer customer;

    @Column(nullable = false)
    private LocalDateTime orderDate;

    @Column(nullable = false, length = 50)
    private String status; // Ex: PENDING_PAYMENT, PROCESSING, SHIPPED, DELIVERED, CANCELED, APPROVED

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    // Informații denormalizate pentru livrare, chiar dacă există în Customer/User,
    // pentru a păstra adresa exactă la momentul comenzii.
    @Column(nullable = false, length = 255)
    private String shippingAddress;

    @Column(nullable = false, length = 100)
    private String shippingCustomerName;

    @Column(nullable = false, length = 100)
    private String shippingCustomerEmail;

    @Column(nullable = false, length = 20)
    private String shippingCustomerPhone;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<OrderItem> orderItems = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        orderDate = LocalDateTime.now();
        // Poți seta un status inițial aici, de ex. "PENDING_PAYMENT"
        if (status == null) {
            status = "PENDING_CONFIRMATION";
        }
    }
}