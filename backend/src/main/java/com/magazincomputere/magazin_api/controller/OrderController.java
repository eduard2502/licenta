package com.magazincomputere.magazin_api.controller;

import com.magazincomputere.magazin_api.dto.OrderDto; // Va trebui să creezi OrderDto și OrderItemDto
import com.magazincomputere.magazin_api.dto.OrderStatusUpdateDto; // DTO pentru actualizarea stării
import com.magazincomputere.magazin_api.service.OrderService; // Va trebui să creezi OrderService
import com.magazincomputere.magazin_api.security.services.UserDetailsImpl; // Pentru a obține userul curent
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
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    @PreAuthorize("isAuthenticated()") // Utilizatorii logați (USER sau ADMIN) pot plasa comenzi
    public ResponseEntity<?> createOrder(@Valid @RequestBody OrderDto orderDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        try {
            OrderDto createdOrder = orderService.createOrder(orderDto, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdOrder);
        } catch (Exception e) {
            // Loghează excepția e.getMessage()
            return ResponseEntity.badRequest().body("Eroare la crearea comenzii: " + e.getMessage());
        }
    }

    @GetMapping("/my-history")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<OrderDto>> getMyOrderHistory() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        List<OrderDto> orders = orderService.getOrderHistoryForUser(userId);
        return ResponseEntity.ok(orders);
    }

    // Endpoint-uri pentru ADMIN
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderDto>> getAllOrders(
        @RequestParam(required = false) String status // Exemplu de filtrare opțională
    ) {
        return ResponseEntity.ok(orderService.getAllOrders(status));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderDto> getOrderByIdForAdmin(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @Valid @RequestBody OrderStatusUpdateDto statusUpdateDto) {
        try {
             OrderDto updatedOrder = orderService.updateOrderStatus(id, statusUpdateDto.getNewStatus()); // Presupunând că OrderStatusUpdateDto are un câmp newStatus
             return ResponseEntity.ok(updatedOrder);
         } catch (Exception e) {
             return ResponseEntity.badRequest().body("Eroare la actualizarea stării comenzii: " + e.getMessage());
         }
    }
}