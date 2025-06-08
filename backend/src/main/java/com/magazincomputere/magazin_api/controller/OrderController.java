// src/main/java/com/magazincomputere/magazin_api/controller/OrderController.java
package com.magazincomputere.magazin_api.controller;

import com.magazincomputere.magazin_api.dto.OrderDto;
import com.magazincomputere.magazin_api.dto.OrderStatusUpdateDto; // Asigură-te că acest DTO este importat
import com.magazincomputere.magazin_api.model.User; // Nu este folosit direct, dar poate rămâne
import com.magazincomputere.magazin_api.repository.UserRepository; // Nu este folosit direct, dar poate rămâne
import com.magazincomputere.magazin_api.security.services.UserDetailsImpl;
import com.magazincomputere.magazin_api.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*", maxAge = 3600)
public class OrderController {

    @Autowired
    private OrderService orderService;

    // @Autowired // Nu este folosit direct aici, poate fi eliminat dacă nu e necesar pentru altceva
    // private UserRepository userRepository;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderDto> createOrder(@Valid @RequestBody OrderDto orderDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();

        OrderDto createdOrder = orderService.createOrder(orderDto, userId);
        return new ResponseEntity<>(createdOrder, HttpStatus.CREATED);
    }

    @GetMapping("/my-history")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<OrderDto>> getMyOrderHistory() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        // Folosește numele corect al metodei din OrderService
        List<OrderDto> orders = orderService.getOrdersByUser(userId); // <<< CORECTAT AICI
        return ResponseEntity.ok(orders);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderDto>> getAllOrders(@RequestParam(required = false) String status) {
        List<OrderDto> orders = orderService.getAllOrders(status);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{orderId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderDto> getOrderById(@PathVariable Long orderId) {
        OrderDto orderDto = orderService.getOrderById(orderId);
        return ResponseEntity.ok(orderDto);
    }

    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderDto> updateOrderStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody OrderStatusUpdateDto statusUpdateDto) { // <<< CORECTAT AICI: Primește DTO-ul
        // Transmite DTO-ul la serviciu
        OrderDto updatedOrder = orderService.updateOrderStatus(orderId, statusUpdateDto); // <<< CORECTAT AICI
        return ResponseEntity.ok(updatedOrder);
    }
}
