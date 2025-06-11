package com.magazincomputere.magazin_api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CheckoutRequest {
    @NotBlank(message = "Numele complet este obligatoriu")
    @Size(max = 100)
    private String fullName;
    
    @NotBlank(message = "Email-ul este obligatoriu")
    @Email(message = "Format email invalid")
    private String email;
    
    @NotBlank(message = "Numărul de telefon este obligatoriu")
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Număr de telefon invalid")
    private String phone;
    
    @NotBlank(message = "Adresa este obligatorie")
    @Size(max = 500)
    private String billingAddress;
    
    private String shippingAddress; // Poate fi diferită de billing address
    
    @NotBlank(message = "Metoda de plată este obligatorie")
    @Pattern(regexp = "^(CARD|CASH_ON_DELIVERY|BANK_TRANSFER)$", message = "Metodă de plată invalidă")
    private String paymentMethod;
    
    private String orderNotes;
    
    private boolean agreeToTerms;
}