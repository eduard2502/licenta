package com.magazincomputere.magazin_api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SpecificationDefinitionDto {
    private Long id;

    @NotBlank(message = "Numele definiției specificației este obligatoriu.")
    @Size(max = 100)
    private String name;

    @Size(max = 50)
    private String unit; // opțional
}