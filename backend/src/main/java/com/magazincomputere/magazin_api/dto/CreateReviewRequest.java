// backend/src/main/java/com/magazincomputere/magazin_api/dto/CreateReviewRequest.java
package com.magazincomputere.magazin_api.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CreateReviewRequest {
    @NotNull(message = "ID-ul produsului este obligatoriu")
    private Long productId;
    
    @NotNull(message = "Rating-ul este obligatoriu")
    @Min(value = 1, message = "Rating-ul minim este 1")
    @Max(value = 5, message = "Rating-ul maxim este 5")
    private Integer rating;
    
    @Size(max = 100, message = "Titlul nu poate depăși 100 de caractere")
    private String title;
    
    @Size(max = 1000, message = "Comentariul nu poate depăși 1000 de caractere")
    private String comment;
}