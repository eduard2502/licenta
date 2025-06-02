package com.magazincomputere.magazin_api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDto {
    private Long id; // Pentru răspunsuri, nu pentru creare

    @NotBlank(message = "Numele produsului este obligatoriu.")
    @Size(min = 3, max = 255, message = "Numele produsului trebuie să aibă între 3 și 255 de caractere.")
    private String name;

    @Size(max = 5000, message = "Descrierea nu poate depăși 5000 de caractere.") // Mărit limita pentru descrieri detaliate
    private String description;

    @NotNull(message = "Prețul este obligatoriu.")
    @DecimalMin(value = "0.0", inclusive = true, message = "Prețul trebuie să fie un număr pozitiv sau zero.")
    @Digits(integer=8, fraction=2, message = "Prețul are un format invalid (maxim 8 cifre întregi, 2 zecimale).")
    private BigDecimal price;

    @NotNull(message = "Cantitatea în stoc este obligatorie.")
    @Min(value = 0, message = "Cantitatea în stoc nu poate fi negativă.")
    private Integer stockQuantity;

    // imageBase64 este un string lung, validarea specifică (ex: dacă e un base64 valid)
    // s-ar putea face în serviciu sau cu un validator custom dacă e critic.
    private String imageBase64;

    @NotNull(message = "ID-ul categoriei este obligatoriu pentru produs.")
    private Long categoryId;

    private String categoryName; // Pentru afișare, populat de backend la citire

    @Valid // Validează fiecare element din listă
    private List<SpecificationDto> specifications;
}