// src/main/java/com/magazincomputere/magazin_api/model/Product.java
package com.magazincomputere.magazin_api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Numele produsului este obligatoriu")
    @Size(min = 3, max = 255, message = "Numele produsului trebuie să aibă între 3 și 255 de caractere")
    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull(message = "Prețul este obligatoriu")
    @DecimalMin(value = "0.01", message = "Prețul trebuie să fie pozitiv")
    @Column(nullable = false)
   private BigDecimal price;

    @NotNull(message = "Cantitatea în stoc este obligatorie")
    @Min(value = 0, message = "Stocul nu poate fi negativ")
    @Column(nullable = false)
    private Integer stockQuantity;

    // @Lob // Adnotarea @Lob este importantă pentru câmpuri mari de tip TEXT în unele baze de date
    // @Column(columnDefinition = "TEXT") // Asigură-te că tipul de coloană este adecvat pentru base64
    // private String imageBase64; // COMENTAT TEMPORAR

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    @NotNull(message = "Categoria este obligatorie")
    private Category category;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ProductSpecificationValue> specifications;

    public Product(Long id) {
        this.id = id;
    }
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
@ToString.Exclude
@EqualsAndHashCode.Exclude
private List<Review> reviews = new ArrayList<>();

@Transient
private Double averageRating;

@Transient
private Integer reviewCount;

// Add a method to calculate average rating
public Double calculateAverageRating() {
    if (reviews == null || reviews.isEmpty()) {
        return 0.0;
    }
    return reviews.stream()
        .mapToInt(Review::getRating)
        .average()
        .orElse(0.0);
}

public Integer getReviewCount() {
    return reviews != null ? reviews.size() : 0;
}
}