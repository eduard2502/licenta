package com.magazincomputere.magazin_api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDto {
    // Câmpuri pentru răspuns
    private Long id;
    private Long userId;
    private String username; // Numele utilizatorului care a plasat comanda
    private LocalDateTime orderDate;
    private String status;
    private BigDecimal totalAmount;

    // Câmpuri pentru request și răspuns
    @NotEmpty(message = "Comanda trebuie să conțină cel puțin un produs.")
    @Valid // Asigură validarea fiecărui OrderItemDto din listă
    private List<OrderItemDto> orderItems;

    // Informații de livrare/client (pot fi preluate parțial din profilul utilizatorului)
    @NotBlank(message = "Numele clientului este obligatoriu pentru livrare.")
    @Size(max = 100, message = "Numele clientului este prea lung.")
    private String customerName;

    @NotBlank(message = "Adresa de livrare este obligatorie.")
    @Size(max = 255, message = "Adresa de livrare este prea lungă.")
    private String shippingAddress;

    @NotBlank(message = "Emailul clientului este obligatoriu.")
    @Email(message = "Formatul emailului este invalid.")
    @Size(max = 100)
    private String customerEmail;

    @NotBlank(message = "Numărul de telefon este obligatoriu.")
    @Size(min=10, max = 20, message = "Numărul de telefon are format invalid.")
    private String customerPhone;
}