// backend/src/main/java/com/magazincomputere/magazin_api/dto/UserDto.java
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

    @NotBlank(message = "Numele de utilizator este obligatoriu.")
    @Size(min = 3, max = 20)
    private String username;

    @NotBlank(message = "Emailul este obligatoriu.")
    @Size(max = 50)
    @Email(message = "Formatul emailului este invalid.")
    private String email;

    private String fullName;
    private String phone;
    private String address;
    private String avatarImageBase64;

    private Set<String> roles;
}