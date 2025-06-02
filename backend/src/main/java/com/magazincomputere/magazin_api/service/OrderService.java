package com.magazincomputere.magazin_api.service;

import com.magazincomputere.magazin_api.dto.OrderDto;
import com.magazincomputere.magazin_api.dto.OrderItemDto;
import com.magazincomputere.magazin_api.exception.BadRequestException;
import com.magazincomputere.magazin_api.exception.ResourceNotFoundException;
import com.magazincomputere.magazin_api.model.*; // Import User, Customer, Product, Order, OrderItem
import com.magazincomputere.magazin_api.repository.*; // Import toate repository-urile necesare
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.magazincomputere.magazin_api.model.Order; // Asigură-te că importul este corect
import com.magazincomputere.magazin_api.model.OrderItem;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    // ... injectările tale (OrderRepository, UserRepository, etc.) ...
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CustomerRepository customerRepository;
    @Autowired
    private ProductRepository productRepository;
    // @Autowired private OrderItemRepository orderItemRepository; // Decomentează dacă îl folosești direct

    // --- Metode de conversie DTO <-> Entity ---
    // Acestea trebuie să fie metode helper, cel mai probabil private
    private OrderDto convertOrderToDto(Order order) { // PARAMETRUL 'order' NU este un bean injectat
        OrderDto dto = new OrderDto();
        dto.setId(order.getId());
        if (order.getUser() != null) {
            dto.setUserId(order.getUser().getId());
            dto.setUsername(order.getUser().getUsername());
        } else if (order.getCustomer() != null) {
             dto.setUsername(order.getCustomer().getFirstName() != null ? order.getCustomer().getFirstName() + " " + order.getCustomer().getLastName() : order.getCustomer().getEmail());
        }
        dto.setOrderDate(order.getOrderDate());
        dto.setStatus(order.getStatus());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setShippingAddress(order.getShippingAddress());
        dto.setCustomerName(order.getShippingCustomerName());
        dto.setCustomerEmail(order.getShippingCustomerEmail());
        dto.setCustomerPhone(order.getShippingCustomerPhone());

        if (order.getOrderItems() != null) {
            dto.setOrderItems(order.getOrderItems().stream()
                    .map(this::convertOrderItemToDto).collect(Collectors.toList()));
        }
        return dto;
    }

    private OrderItemDto convertOrderItemToDto(OrderItem item) { // PARAMETRUL 'item' NU este un bean injectat
        OrderItemDto dto = new OrderItemDto();
        dto.setId(item.getId());
        dto.setProductId(item.getProductIdSnapshot());
        dto.setProductName(item.getProductNameSnapshot());
        dto.setProductImageBase64(item.getProductImageBase64Snapshot());
        dto.setQuantity(item.getQuantity());
        dto.setPriceAtPurchase(item.getPriceAtPurchase());
        return dto;
    }
    // --- Sfârșit metode de conversie ---

    // ... restul metodelor din OrderService (createOrder, getOrderHistoryForUser, etc.) ...
    // Asigură-te că aceste metode publice sunt cele care sunt apelate de controller
    // și ele, la rândul lor, apelează metodele private de conversie.
    @Transactional
    public OrderDto createOrder(OrderDto orderDto, Long userIdRequesting) {
        User user = userRepository.findById(userIdRequesting)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userIdRequesting));

        Customer customer = customerRepository.findByUserId(user.getId())
            .orElseGet(() -> {
                Customer newCustomer = new Customer();
                newCustomer.setUser(user);
                newCustomer.setEmail(user.getEmail()); 
                if (orderDto.getCustomerName() != null && !orderDto.getCustomerName().isEmpty()) {
                    String[] names = orderDto.getCustomerName().trim().split("\\s+");
                    newCustomer.setFirstName(names[0]);
                    if (names.length > 1) {
                        newCustomer.setLastName(orderDto.getCustomerName().substring(names[0].length()).trim());
                    }
                }
                newCustomer.setPhone(orderDto.getCustomerPhone());
                newCustomer.setAddressDetails(orderDto.getShippingAddress());
                return customerRepository.save(newCustomer);
            });

        Order order = new Order();
        order.setUser(user);
        order.setCustomer(customer);
        // order.setOrderDate(LocalDateTime.now()); // Setat de @PrePersist
        order.setStatus("PENDING_CONFIRMATION"); 
        order.setShippingAddress(orderDto.getShippingAddress());
        order.setShippingCustomerName(orderDto.getCustomerName());
        order.setShippingCustomerEmail(orderDto.getCustomerEmail());
        order.setShippingCustomerPhone(orderDto.getCustomerPhone());

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItemsEntities = new ArrayList<>();

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
            orderItem.setProductImageBase64Snapshot(product.getImageBase64());
            orderItem.setQuantity(itemDto.getQuantity());
            orderItem.setPriceAtPurchase(product.getPrice()); 
            orderItem.setLineTotal(product.getPrice().multiply(BigDecimal.valueOf(itemDto.getQuantity())));
            orderItemsEntities.add(orderItem);

            totalAmount = totalAmount.add(orderItem.getLineTotal());

            product.setStockQuantity(product.getStockQuantity() - itemDto.getQuantity());
            // Nu e nevoie să salvezi produsul aici dacă ai CascadeType corespunzător pe Order->OrderItems
            // și tranzacția se ocupă de asta. Dar dacă nu, salvează-l:
            // productRepository.save(product);
        }

        order.setOrderItems(orderItemsEntities);
        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepository.save(order);
        return convertOrderToDto(savedOrder); // Aici se apelează metoda privată
    }
    
    @Transactional(readOnly = true)
    public List<OrderDto> getOrderHistoryForUser(Long userId) {
        return orderRepository.findByUserIdOrderByOrderDateDesc(userId).stream()
                .map(this::convertOrderToDto) // Apel corect
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getAllOrders(String statusFilter) {
        List<Order> orders;
        if (statusFilter != null && !statusFilter.trim().isEmpty()) {
            orders = orderRepository.findByStatus(statusFilter);
        } else {
            orders = orderRepository.findAll();
        }
        return orders.stream().map(this::convertOrderToDto).collect(Collectors.toList()); // Apel corect
    }

    @Transactional(readOnly = true)
    public OrderDto getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        return convertOrderToDto(order); // Apel corect
    }

    @Transactional
    public OrderDto updateOrderStatus(Long orderId, String newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        order.setStatus(newStatus);
        Order updatedOrder = orderRepository.save(order);
        return convertOrderToDto(updatedOrder); // Apel corect
    }
}