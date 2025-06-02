package com.magazincomputere.magazin_api.controller;

// import com.magazincomputere.magazin_api.dto.CustomerDto;
// import com.magazincomputere.magazin_api.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@PreAuthorize("hasRole('ADMIN')")
public class CustomerController {

    // @Autowired
    // private CustomerService customerService;

    // @GetMapping
    // public List<CustomerDto> getAllCustomers() {
    //     return customerService.findAllCustomers();
    // }

    // @GetMapping("/{id}")
    // public ResponseEntity<CustomerDto> getCustomerById(@PathVariable Long id) {
    //     return ResponseEntity.ok(customerService.findCustomerById(id));
    // }
    // TODO: Adaugă endpoint-uri pentru UPDATE, DELETE dacă este necesar
}