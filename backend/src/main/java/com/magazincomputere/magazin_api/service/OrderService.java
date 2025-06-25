// src/main/java/com/magazincomputere/magazin_api/service/OrderService.java
package com.magazincomputere.magazin_api.service;

import com.magazincomputere.magazin_api.dto.OrderDto;
import com.magazincomputere.magazin_api.dto.OrderItemDto;
import com.magazincomputere.magazin_api.dto.OrderStatusUpdateDto;
import com.magazincomputere.magazin_api.exception.BadRequestException;
import com.magazincomputere.magazin_api.exception.ResourceNotFoundException;
import com.magazincomputere.magazin_api.model.*;
import com.magazincomputere.magazin_api.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    // Remove CustomerRepository

    private OrderDto convertToDto(Order order) {
        OrderDto orderDto = new OrderDto();
        orderDto.setId(order.getId());
        if (order.getUser() != null) {
            orderDto.setUserId(order.getUser().getId());
            orderDto.setUsername(order.getUser().getUsername());
        }
        orderDto.setOrderDate(order.getOrderDate());
        orderDto.setStatus(order.getStatus());
        orderDto.setTotalAmount(order.getTotalAmount());

        orderDto.setCustomerName(order.getShippingCustomerName());
        orderDto.setShippingAddress(order.getShippingAddress());
        orderDto.setCustomerEmail(order.getShippingCustomerEmail());
        orderDto.setCustomerPhone(order.getShippingCustomerPhone());

        if (order.getOrderItems() != null) {
            orderDto.setOrderItems(order.getOrderItems().stream()
                    .map(this::convertOrderItemToDto)
                    .collect(Collectors.toList()));
        }
        return orderDto;
    }

    private OrderItemDto convertOrderItemToDto(OrderItem orderItem) {
        OrderItemDto dto = new OrderItemDto();
        dto.setId(orderItem.getId());
        dto.setProductId(orderItem.getProductIdSnapshot());
        dto.setProductNameSnapshot(orderItem.getProductNameSnapshot());
        dto.setQuantity(orderItem.getQuantity());
        dto.setPriceAtPurchase(orderItem.getPriceAtPurchase());
        dto.setLineTotal(orderItem.getLineTotal());
        return dto;
    }

    @Transactional
    public OrderDto createOrder(OrderDto orderDto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Remove all Customer-related logic

        Order order = new Order();
        order.setUser(user);
        order.setShippingCustomerName(orderDto.getCustomerName());
        order.setShippingAddress(orderDto.getShippingAddress());
        order.setShippingCustomerEmail(orderDto.getCustomerEmail());
        order.setShippingCustomerPhone(orderDto.getCustomerPhone());

        List<OrderItem> orderItemsList = new ArrayList<>();
        BigDecimal totalOrderAmount = BigDecimal.ZERO;

        if (orderDto.getOrderItems() == null || orderDto.getOrderItems().isEmpty()) {
            throw new BadRequestException("Order must contain at least one item.");
        }

        for (OrderItemDto itemDto : orderDto.getOrderItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemDto.getProductId()));

            if (product.getStockQuantity() < itemDto.getQuantity()) {
                throw new BadRequestException("Insufficient stock for product: " + product.getName());
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProductIdSnapshot(product.getId());
            orderItem.setProductNameSnapshot(product.getName());
            orderItem.setQuantity(itemDto.getQuantity());
            
            BigDecimal itemPrice = product.getPrice(); 
            orderItem.setPriceAtPurchase(itemPrice);

            BigDecimal quantity = new BigDecimal(itemDto.getQuantity());
            BigDecimal lineTotal = itemPrice.multiply(quantity); 
            
            orderItem.setLineTotal(lineTotal);

            orderItemsList.add(orderItem);
            totalOrderAmount = totalOrderAmount.add(lineTotal);

            product.setStockQuantity(product.getStockQuantity() - itemDto.getQuantity());
            productRepository.save(product);
        }

        order.setOrderItems(orderItemsList);
        order.setTotalAmount(totalOrderAmount);

        Order savedOrder = orderRepository.save(order);
        return convertToDto(savedOrder);
    }

    public List<OrderDto> getOrdersByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return orderRepository.findByUserOrderByOrderDateDesc(user)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<OrderDto> getAllOrders(String status) {
        List<Order> orders;
        if (status != null && !status.trim().isEmpty()) {
            orders = orderRepository.findByStatusOrderByOrderDateDesc(status);
        } else {
            orders = orderRepository.findAllByOrderByOrderDateDesc();
        }
        return orders.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    public OrderDto getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        return convertToDto(order);
    }

    @Transactional
    public OrderDto updateOrderStatus(Long orderId, OrderStatusUpdateDto statusUpdateDto) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        order.setStatus(statusUpdateDto.getNewStatus().toUpperCase());
        Order updatedOrder = orderRepository.save(order);
        return convertToDto(updatedOrder);
    }
}