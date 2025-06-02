package com.magazincomputere.magazin_api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerDto { // Acest DTO reflectă mai mult entitatea Customer
    private Long id;
    private Long userId; // Poate fi null dacă un client nu are cont de utilizator

    @Size(max = 100, message = "Prenumele nu poate depăși 100 de caractere.")
    private String firstName;

    @Size(max = 100, message = "Numele de familie nu poate depăși 100 de caractere.")
    private String lastName;

    @Email(message = "Formatul emailului este invalid.")
    @Size(max = 100, message = "Emailul nu poate depăși 100 de caractere.")
    private String email; // Poate fi diferit de emailul User-ului dacă e cazul

    @Size(max = 20, message = "Numărul de telefon nu poate depăși 20 de caractere.")
    private String phone;

    @Size(max = 500, message = "Adresa nu poate depăși 500 de caractere.")
    private String address;
    // Alte câmpuri relevante pentru admin
}