// src/main/java/com/magazincomputere/magazin_api/dto/OrderItemDto.java
package com.magazincomputere.magazin_api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class OrderItemDto {
    private Long id;

    @NotNull(message = "ID-ul produsului este obligatoriu")
    private Long productId; // ID-ul produsului original

    private String productNameSnapshot;
    // private String productImageBase64Snapshot; // COMENTAT TEMPORAR

    @NotNull(message = "Cantitatea este obligatorie")
    @Min(value = 1, message = "Cantitatea trebuie să fie cel puțin 1")
    private Integer quantity;

    private BigDecimal priceAtPurchase;
    private BigDecimal lineTotal;
}
