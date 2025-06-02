package com.magazincomputere.magazin_api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDto {
    private Long id;

    @NotBlank(message = "Numele categoriei este obligatoriu.")
    @Size(min = 2, max = 100, message = "Numele categoriei trebuie să aibă între 2 și 100 de caractere.")
    private String name;

    @Size(max = 1000, message = "Descrierea categoriei nu poate depăși 1000 de caractere.")
    private String description;
}