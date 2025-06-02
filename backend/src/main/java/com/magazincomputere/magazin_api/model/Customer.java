package com.magazincomputere.magazin_api.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.util.List;

@Entity
@Table(name = "customers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 100)
    private String firstName;

    @Column(length = 100)
    private String lastName;

    // Emailul clientului poate fi diferit de cel al contului de utilizator,
    // sau poate fi același. Depinde de logica de business.
    @Column(unique = true, length = 100) // Poate fi null dacă un client nu are cont și face comandă ca guest
    private String email;

    @Column(length = 20)
    private String phone;

    @Lob // Pentru adrese multiple sau mai lungi
    @Column(columnDefinition = "TEXT")
    private String addressDetails; // Poate stoca adresa principală sau un JSON cu mai multe adrese

    // Relație opțională OneToOne cu User (un client poate avea un cont de utilizator)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", unique = true) // Poate fi null
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User user;

    // Un client poate avea mai multe comenzi
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Order> orders;
}