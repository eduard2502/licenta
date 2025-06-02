package com.magazincomputere.magazin_api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignupRequest {
    @NotBlank(message = "Numele de utilizator este obligatoriu.")
    @Size(min = 3, max = 20, message = "Numele de utilizator trebuie să aibă între 3 și 20 de caractere.")
    private String username;

    @NotBlank(message = "Emailul este obligatoriu.")
    @Size(max = 50, message = "Emailul nu poate depăși 50 de caractere.")
    @Email(message = "Formatul emailului este invalid.")
    private String email;

    @NotBlank(message = "Parola este obligatorie.")
    @Size(min = 6, max = 40, message = "Parola trebuie să aibă între 6 și 40 de caractere.")
    private String password;

    // Frontend-ul poate trimite rolurile dorite (ex: la crearea unui admin de către alt admin)
    // Sau acest câmp poate fi ignorat la signup-ul standard al unui client, backend-ul setând rolul USER.
    private Set<String> roles;
}