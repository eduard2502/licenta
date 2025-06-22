package com.magazincomputere.magazin_api.controller;

import com.magazincomputere.magazin_api.dto.PayPalOrderResponse;
import com.magazincomputere.magazin_api.service.PayPalService;
import com.paypal.orders.Order;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/cart/paypal")
@PreAuthorize("hasRole('USER')")
public class PayPalController {
    
    @Autowired
    private PayPalService payPalService;
    
    @Value("${app.frontend.url}")
    private String frontendUrl;
    
    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> orderData) {
        try {
            Double amount = Double.parseDouble(orderData.get("amount").toString());
            String currency = orderData.getOrDefault("currency", "USD").toString();
            
            String returnUrl = frontendUrl + "/payment-success";
            String cancelUrl = frontendUrl + "/payment-cancel";
            
            Order order = payPalService.createOrder(amount, currency, returnUrl, cancelUrl);
            
            PayPalOrderResponse response = new PayPalOrderResponse();
            response.setOrderId(order.id());
            response.setStatus(order.status());
            
            // Find approval URL
            order.links().forEach(link -> {
                if (link.rel().equals("approve")) {
                    response.setApprovalUrl(link.href());
                }
            });
            
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to create PayPal order"));
        }
    }
    
    @PostMapping("/capture-order/{orderId}")
    public ResponseEntity<?> captureOrder(@PathVariable String orderId) {
        try {
            Order order = payPalService.captureOrder(orderId);
            return ResponseEntity.ok(Map.of(
                "status", order.status(),
                "orderId", order.id()
            ));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to capture PayPal order"));
        }
    }
}