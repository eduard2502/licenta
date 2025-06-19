// backend/src/main/java/com/magazincomputere/magazin_api/service/ReviewService.java
package com.magazincomputere.magazin_api.service;

import com.magazincomputere.magazin_api.dto.*;
import com.magazincomputere.magazin_api.exception.BadRequestException;
import com.magazincomputere.magazin_api.exception.ResourceNotFoundException;
import com.magazincomputere.magazin_api.model.*;
import com.magazincomputere.magazin_api.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private UserRepository userRepository;

    @Transactional
    public ReviewDto createReview(CreateReviewRequest request, Long userId) {
        // Check if user already reviewed this product
        if (reviewRepository.existsByProductIdAndUserId(request.getProductId(), userId)) {
            throw new BadRequestException("Ai deja o recenzie pentru acest produs");
        }
        
        Product product = productRepository.findById(request.getProductId())
            .orElseThrow(() -> new ResourceNotFoundException("Produsul nu a fost găsit"));
            
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Utilizatorul nu a fost găsit"));
        
        Review review = new Review();
        review.setProduct(product);
        review.setUser(user);
        review.setRating(request.getRating());
        review.setTitle(request.getTitle());
        review.setComment(request.getComment());
        
        Review savedReview = reviewRepository.save(review);
        return convertToDto(savedReview);
    }
    
    @Transactional
    public ReviewDto updateReview(Long reviewId, CreateReviewRequest request, Long userId) {
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new ResourceNotFoundException("Recenzia nu a fost găsită"));
            
        if (!review.getUser().getId().equals(userId)) {
            throw new BadRequestException("Nu poți modifica recenzia altui utilizator");
        }
        
        review.setRating(request.getRating());
        review.setTitle(request.getTitle());
        review.setComment(request.getComment());
        
        Review updatedReview = reviewRepository.save(review);
        return convertToDto(updatedReview);
    }
    
    @Transactional
    public void deleteReview(Long reviewId, Long userId, boolean isAdmin) {
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new ResourceNotFoundException("Recenzia nu a fost găsită"));
            
        if (!isAdmin && !review.getUser().getId().equals(userId)) {
            throw new BadRequestException("Nu poți șterge recenzia altui utilizator");
        }
        
        reviewRepository.delete(review);
    }
    
    public Page<ReviewDto> getProductReviews(Long productId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Review> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId, pageable);
        return reviews.map(this::convertToDto);
    }
    
    public ReviewDto getUserReviewForProduct(Long productId, Long userId) {
        Review review = reviewRepository.findByProductIdAndUserId(productId, userId)
            .orElse(null);
        return review != null ? convertToDto(review) : null;
    }
    
    public ProductReviewSummary getProductReviewSummary(Long productId) {
        ProductReviewSummary summary = new ProductReviewSummary();
        
        Double avgRating = reviewRepository.calculateAverageRatingByProductId(productId);
        summary.setAverageRating(avgRating != null ? avgRating : 0.0);
        
        Integer totalReviews = reviewRepository.countByProductId(productId);
        summary.setTotalReviews(totalReviews != null ? totalReviews : 0);
        
        Map<Integer, Integer> distribution = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            distribution.put(i, 0);
        }
        
        List<Object[]> ratingCounts = reviewRepository.getRatingDistributionByProductId(productId);
        for (Object[] row : ratingCounts) {
            Integer rating = (Integer) row[0];
            Long count = (Long) row[1];
            distribution.put(rating, count.intValue());
        }
        
        summary.setRatingDistribution(distribution);
        return summary;
    }
    public List<ReviewDto> getUserReviews(Long userId) {
    List<Review> reviews = reviewRepository.findByUserId(userId);
    return reviews.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
}
    
    private ReviewDto convertToDto(Review review) {
        ReviewDto dto = new ReviewDto();
        dto.setId(review.getId());
        dto.setProductId(review.getProduct().getId());
        dto.setProductName(review.getProduct().getName());
        dto.setUserId(review.getUser().getId());
        dto.setUsername(review.getUser().getUsername());
        dto.setRating(review.getRating());
        dto.setTitle(review.getTitle());
        dto.setComment(review.getComment());
        dto.setCreatedAt(review.getCreatedAt());
        dto.setUpdatedAt(review.getUpdatedAt());
        return dto;
    }
}