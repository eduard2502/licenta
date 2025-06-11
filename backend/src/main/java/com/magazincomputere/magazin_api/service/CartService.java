// backend/src/main/java/com/magazincomputere/magazin_api/service/CartService.java
package com.magazincomputere.magazin_api.service;

import com.magazincomputere.magazin_api.dto.*;
import com.magazincomputere.magazin_api.exception.BadRequestException;
import com.magazincomputere.magazin_api.exception.ResourceNotFoundException;
import com.magazincomputere.magazin_api.model.*;
import com.magazincomputere.magazin_api.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.stream.Collectors;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;
    
    @Autowired
    private CartItemRepository cartItemRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private OrderService orderService;

    @Transactional
    public CartDto getCartByUserId(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
            .orElseGet(() -> createNewCart(userId));
        return convertToDto(cart);
    }

    @Transactional
    public CartDto addToCart(Long userId, AddToCartRequest request) {
        Cart cart = cartRepository.findByUserId(userId)
            .orElseGet(() -> createNewCart(userId));
            
        Product product = productRepository.findById(request.getProductId())
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));
            
        if (product.getStockQuantity() < request.getQuantity()) {
            throw new BadRequestException("Insufficient stock. Available: " + product.getStockQuantity());
        }
        
        CartItem existingItem = cart.getItems().stream()
            .filter(item -> item.getProduct().getId().equals(request.getProductId()))
            .findFirst()
            .orElse(null);
            
        if (existingItem != null) {
            int newQuantity = existingItem.getQuantity() + request.getQuantity();
            if (product.getStockQuantity() < newQuantity) {
                throw new BadRequestException("Insufficient stock. Available: " + product.getStockQuantity());
            }
            existingItem.setQuantity(newQuantity);
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(request.getQuantity());
            cart.getItems().add(newItem);
        }
        
        cart = cartRepository.save(cart);
        return convertToDto(cart);
    }

    @Transactional
    public CartDto updateCartItem(Long userId, Long productId, UpdateCartItemRequest request) {
        Cart cart = cartRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user"));
            
        CartItem item = cart.getItems().stream()
            .filter(cartItem -> cartItem.getProduct().getId().equals(productId))
            .findFirst()
            .orElseThrow(() -> new ResourceNotFoundException("Product not found in cart"));
            
        if (item.getProduct().getStockQuantity() < request.getQuantity()) {
            throw new BadRequestException("Insufficient stock. Available: " + item.getProduct().getStockQuantity());
        }
        
        item.setQuantity(request.getQuantity());
        cart = cartRepository.save(cart);
        return convertToDto(cart);
    }

    @Transactional
    public CartDto removeFromCart(Long userId, Long productId) {
        Cart cart = cartRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user"));
            
        cart.getItems().removeIf(item -> item.getProduct().getId().equals(productId));
        cart = cartRepository.save(cart);
        return convertToDto(cart);
    }

    @Transactional
    public void clearCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user"));
        cart.clearCart();
        cartRepository.save(cart);
    }

    @Transactional
    public OrderDto checkout(Long userId, CheckoutRequest request) {
        Cart cart = cartRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user"));
            
        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }
        
        if (!request.isAgreeToTerms()) {
            throw new BadRequestException("You must agree to terms and conditions");
        }
        
        // Validare stoc pentru toate produsele
        for (CartItem item : cart.getItems()) {
            if (item.getProduct().getStockQuantity() < item.getQuantity()) {
                throw new BadRequestException("Insufficient stock for product: " + item.getProduct().getName());
            }
        }
        
        // Creare comandă
        OrderDto orderDto = new OrderDto();
        orderDto.setCustomerName(request.getFullName());
        orderDto.setCustomerEmail(request.getEmail());
        orderDto.setCustomerPhone(request.getPhone());
        orderDto.setShippingAddress(request.getShippingAddress() != null ? 
            request.getShippingAddress() : request.getBillingAddress());
        
        // Convertire cart items la order items
        orderDto.setOrderItems(cart.getItems().stream().map(cartItem -> {
            OrderItemDto orderItem = new OrderItemDto();
            orderItem.setProductId(cartItem.getProduct().getId());
            orderItem.setQuantity(cartItem.getQuantity());
            return orderItem;
        }).collect(Collectors.toList()));
        
        // Plasare comandă
        OrderDto createdOrder = orderService.createOrder(orderDto, userId);
        
        // Golire coș după comandă reușită
        clearCart(userId);
        
        return createdOrder;
    }

    private Cart createNewCart(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
            
        Cart cart = new Cart();
        cart.setUser(user);
        return cartRepository.save(cart);
    }

    private CartDto convertToDto(Cart cart) {
        CartDto dto = new CartDto();
        dto.setId(cart.getId());
        dto.setLastUpdated(cart.getLastUpdated());
        dto.setTotalAmount(cart.getTotalAmount());
        dto.setTotalItems(cart.getItems().stream()
            .mapToInt(CartItem::getQuantity)
            .sum());
        
        dto.setItems(cart.getItems().stream().map(item -> {
            CartItemDto itemDto = new CartItemDto();
            itemDto.setId(item.getId());
            itemDto.setProductId(item.getProduct().getId());
            itemDto.setProductName(item.getProduct().getName());
            itemDto.setProductDescription(item.getProduct().getDescription());
            itemDto.setProductPrice(item.getProduct().getPrice());
            itemDto.setProductStock(item.getProduct().getStockQuantity());
            // itemDto.setProductImageBase64(item.getProduct().getImageBase64());
            itemDto.setQuantity(item.getQuantity());
            itemDto.setSubtotal(item.getProduct().getPrice().multiply(new BigDecimal(item.getQuantity())));
            return itemDto;
        }).collect(Collectors.toList()));
        
        return dto;
    }
}