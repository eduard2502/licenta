// src/main/java/com/magazincomputere/magazin_api/dto/ProductDto.java
package com.magazincomputere.magazin_api.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.List;
import java.math.BigDecimal;


@Data
public class ProductDto {
    private Long id;

    @NotBlank(message = "Numele produsului este obligatoriu")
    @Size(min = 3, max = 255, message = "Numele produsului trebuie să aibă între 3 și 255 de caractere")
    private String name;

    private String description;

    @NotNull(message = "Prețul este obligatoriu")
    @DecimalMin(value = "0.01", message = "Prețul trebuie să fie pozitiv")
    private BigDecimal price;

    @NotNull(message = "Cantitatea în stoc este obligatorie")
    @Min(value = 0, message = "Stocul nu poate fi negativ")
    private Integer stockQuantity;

    // private String imageBase64; // COMENTAT TEMPORAR

    @NotNull(message = "ID-ul categoriei este obligatoriu")
    private Long categoryId;
    private String categoryName;

    private List<SpecificationDto> specifications;
    private Double averageRating;
    private Integer reviewCount;
}