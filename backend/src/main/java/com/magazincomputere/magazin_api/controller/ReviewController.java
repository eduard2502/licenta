// backend/src/main/java/com/magazincomputere/magazin_api/controller/ReviewController.java
package com.magazincomputere.magazin_api.controller;

import com.magazincomputere.magazin_api.dto.*;
import com.magazincomputere.magazin_api.security.services.UserDetailsImpl;
import com.magazincomputere.magazin_api.service.ReviewService;
import jakarta.validation.Valid;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReviewDto> createReview(@Valid @RequestBody CreateReviewRequest request) {
        Long userId = getCurrentUserId();
        ReviewDto review = reviewService.createReview(request, userId);
        return new ResponseEntity<>(review, HttpStatus.CREATED);
    }

    @PutMapping("/{reviewId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReviewDto> updateReview(
            @PathVariable Long reviewId,
            @Valid @RequestBody CreateReviewRequest request) {
        Long userId = getCurrentUserId();
        ReviewDto review = reviewService.updateReview(reviewId, request, userId);
        return ResponseEntity.ok(review);
    }

    @DeleteMapping("/{reviewId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteReview(@PathVariable Long reviewId) {
        Long userId = getCurrentUserId();
        boolean isAdmin = isCurrentUserAdmin();
        reviewService.deleteReview(reviewId, userId, isAdmin);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<Page<ReviewDto>> getProductReviews(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<ReviewDto> reviews = reviewService.getProductReviews(productId, page, size);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/product/{productId}/summary")
    public ResponseEntity<ProductReviewSummary> getProductReviewSummary(@PathVariable Long productId) {
        ProductReviewSummary summary = reviewService.getProductReviewSummary(productId);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/product/{productId}/my-review")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReviewDto> getMyReviewForProduct(@PathVariable Long productId) {
        Long userId = getCurrentUserId();
        ReviewDto review = reviewService.getUserReviewForProduct(productId, userId);
        return ResponseEntity.ok(review);
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userDetails.getId();
    }

    private boolean isCurrentUserAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
    }
    @GetMapping("/user/my-reviews")
@PreAuthorize("isAuthenticated()")
public ResponseEntity<List<ReviewDto>> getMyReviews() {
    Long userId = getCurrentUserId();
    List<ReviewDto> reviews = reviewService.getUserReviews(userId);
    return ResponseEntity.ok(reviews);
}
}