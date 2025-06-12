// backend/src/main/java/com/magazincomputere/magazin_api/controller/CartController.java
package com.magazincomputere.magazin_api.controller;

import com.magazincomputere.magazin_api.dto.*;
import com.magazincomputere.magazin_api.security.services.UserDetailsImpl;
import com.magazincomputere.magazin_api.service.CartService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CartDto> getCart() {
        Long userId = getCurrentUserId();
        CartDto cart = cartService.getCartByUserId(userId);
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/items")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CartDto> addToCart(@Valid @RequestBody AddToCartRequest request) {
        Long userId = getCurrentUserId();
        CartDto cart = cartService.addToCart(userId, request);
        return new ResponseEntity<>(cart, HttpStatus.CREATED);
    }

    @PutMapping("/items/{productId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CartDto> updateCartItem(
            @PathVariable Long productId,
            @Valid @RequestBody UpdateCartItemRequest request) {
        Long userId = getCurrentUserId();
        CartDto cart = cartService.updateCartItem(userId, productId, request);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/items/{productId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CartDto> removeFromCart(@PathVariable Long productId) {
        Long userId = getCurrentUserId();
        CartDto cart = cartService.removeFromCart(userId, productId);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/clear")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> clearCart() {
        Long userId = getCurrentUserId();
        cartService.clearCart(userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/checkout")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderDto> checkout(@Valid @RequestBody CheckoutRequest request) {
        Long userId = getCurrentUserId();
        OrderDto order = cartService.checkout(userId, request);
        return new ResponseEntity<>(order, HttpStatus.CREATED);
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userDetails.getId();
    }
}