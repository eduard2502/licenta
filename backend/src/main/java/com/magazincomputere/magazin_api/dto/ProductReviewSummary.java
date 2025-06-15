// backend/src/main/java/com/magazincomputere/magazin_api/dto/ProductReviewSummary.java
package com.magazincomputere.magazin_api.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductReviewSummary {
    private Double averageRating;
    private Integer totalReviews;
    private Map<Integer, Integer> ratingDistribution; // Key: rating (1-5), Value: count
}