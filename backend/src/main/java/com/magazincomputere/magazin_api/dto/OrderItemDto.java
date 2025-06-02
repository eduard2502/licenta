package com.magazincomputere.magazin_api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDto {
    private Long id; // Doar în răspuns

    @NotNull(message = "ID-ul produsului este obligatoriu.")
    private Long productId;

    private String productName; // În răspuns, pentru afișare
    private String productImageBase64; // În răspuns, pentru afișare

    @NotNull(message = "Cantitatea este obligatorie.")
    @Min(value = 1, message = "Cantitatea trebuie să fie cel puțin 1.")
    private Integer quantity;

    private BigDecimal priceAtPurchase; // În răspuns, prețul la momentul comenzii
                                       // Calculat de backend la crearea comenzii.
}