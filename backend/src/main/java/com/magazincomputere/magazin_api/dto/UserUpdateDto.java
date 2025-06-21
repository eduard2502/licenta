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
public class UserUpdateDto {
    @NotBlank(message = "Emailul este obligatoriu.")
    @Size(max = 50)
    @Email(message = "Formatul emailului este invalid.")
    private String email;
    private String avatarImageBase64;

    private Set<String> roles; // Rolurile pot fi opționale la update
}