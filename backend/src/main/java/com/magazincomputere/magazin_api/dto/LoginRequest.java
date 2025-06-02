package com.magazincomputere.magazin_api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    @NotBlank(message = "Numele de utilizator este obligatoriu.")
    private String username;

    @NotBlank(message = "Parola este obligatorie.")
    private String password;
}