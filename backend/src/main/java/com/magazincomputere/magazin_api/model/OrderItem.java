// src/main/java/com/magazincomputere/magazin_api/model/OrderItem.java
package com.magazincomputere.magazin_api.model;

import java.math.BigDecimal;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @NotNull(message = "ID-ul produsului este obligatoriu pentru un articol de comandă")
    @Column(nullable = false)
    private Long productIdSnapshot;

    @NotNull(message = "Numele produsului este obligatoriu")
    @Column(nullable = false)
    private String productNameSnapshot;

    // @Lob
    // @Column(columnDefinition = "TEXT")
    // private String productImageBase64Snapshot; // COMENTAT TEMPORAR

    @NotNull(message = "Cantitatea este obligatorie")
    @Min(value = 1, message = "Cantitatea trebuie să fie cel puțin 1")
    @Column(nullable = false)
    private Integer quantity;

    @NotNull(message = "Prețul la achiziție este obligatoriu")
    @Column(nullable = false)
    private BigDecimal priceAtPurchase;

    @NotNull(message = "Totalul liniei este obligatoriu")
    @Column(nullable = false)
    private BigDecimal lineTotal;
}
