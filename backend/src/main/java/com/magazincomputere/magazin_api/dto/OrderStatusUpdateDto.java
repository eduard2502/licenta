package com.magazincomputere.magazin_api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusUpdateDto {
    @NotBlank(message = "Noua stare a comenzii este obligatorie.")
    private String newStatus;
}