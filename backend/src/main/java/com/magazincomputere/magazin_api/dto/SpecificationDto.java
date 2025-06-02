package com.magazincomputere.magazin_api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SpecificationDto {
    // Când se trimit datele pentru un produs, definitionId sau name+unit ar trebui să fie prezente.
    // La citire, toate ar putea fi populate.
    private Long definitionId; // ID-ul din SpecificationDefinition (pentru a lega de o definiție existentă)

    @Size(max = 100, message = "Numele specificației nu poate depăși 100 de caractere.")
    // Numele este necesar dacă definitionId nu este furnizat la creare/update specificație pentru produs
    private String name;       // Numele specificației (ex: "RAM")

    @NotBlank(message = "Valoarea specificației este obligatorie.")
    @Size(max = 255, message = "Valoarea specificației nu poate depăși 255 de caractere.")
    private String value;      // Valoarea (ex: "16GB")

    @Size(max = 50, message = "Unitatea de măsură nu poate depăși 50 de caractere.")
    private String unit;       // Opțional (ex: "GB", "MHz")
}