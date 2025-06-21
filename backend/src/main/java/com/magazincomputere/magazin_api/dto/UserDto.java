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
public class UserDto {
    private Long id;

    // La creare/update, username-ul nu ar trebui să se schimbe ușor după creare.
    // Validările sunt mai importante pentru SignupRequestDto.
    @NotBlank(message = "Numele de utilizator este obligatoriu.")
    @Size(min = 3, max = 20)
    private String username;

    @NotBlank(message = "Emailul este obligatoriu.")
    @Size(max = 50)
    @Email(message = "Formatul emailului este invalid.")
    private String email;
    private String avatarImageBase64;

    // Parola nu este expusă în DTO-urile de răspuns.
    // Pentru schimbarea parolei, se va folosi un DTO dedicat.

    private Set<String> roles; // Numele rolurilor, ex: "ROLE_ADMIN", "ROLE_USER"
}