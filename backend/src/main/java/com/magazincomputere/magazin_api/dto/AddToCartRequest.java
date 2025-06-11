package com.magazincomputere.magazin_api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddToCartRequest {
    @NotNull(message = "ID-ul produsului este obligatoriu")
    private Long productId;
    
    @NotNull(message = "Cantitatea este obligatorie")
    @Min(value = 1, message = "Cantitatea trebuie să fie cel puțin 1")
    private Integer quantity;
}