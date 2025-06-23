// backend/src/main/java/com/magazincomputere/magazin_api/dto/UserUpdateDto.java
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

    @Size(max = 100)
    private String fullName;

    @Size(max = 20)
    private String phone;

    @Size(max = 500)
    private String address;

    private String avatarImageBase64;

    private Set<String> roles;
}