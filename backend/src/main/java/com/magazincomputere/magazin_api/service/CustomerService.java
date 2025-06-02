package com.magazincomputere.magazin_api.service;

import com.magazincomputere.magazin_api.dto.CustomerDto;
import com.magazincomputere.magazin_api.exception.ResourceNotFoundException;
import com.magazincomputere.magazin_api.model.Customer;
import com.magazincomputere.magazin_api.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;
    // @Autowired private UserRepository userRepository; // Dacă e nevoie să legi de User

    private CustomerDto convertToDto(Customer customer) {
        CustomerDto dto = new CustomerDto();
        dto.setId(customer.getId());
        if (customer.getUser() != null) {
            dto.setUserId(customer.getUser().getId());
        }
        dto.setFirstName(customer.getFirstName());
        dto.setLastName(customer.getLastName());
        dto.setEmail(customer.getEmail());
        dto.setPhone(customer.getPhone());
        dto.setAddress(customer.getAddressDetails());
        return dto;
    }

    private Customer convertToEntity(CustomerDto dto, Customer customer) {
        // Nu setăm User aici, se face la creare/asociere
        customer.setFirstName(dto.getFirstName());
        customer.setLastName(dto.getLastName());
        customer.setEmail(dto.getEmail());
        customer.setPhone(dto.getPhone());
        customer.setAddressDetails(dto.getAddress());
        return customer;
    }

    @Transactional(readOnly = true)
    public List<CustomerDto> findAllCustomers() {
        return customerRepository.findAll().stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CustomerDto findCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
        return convertToDto(customer);
    }

    // Crearea de Customer se poate face și implicit la prima comandă a unui User,
    // sau explicit de către un admin.
    // @Transactional
    // public CustomerDto createCustomer(CustomerDto customerDto) {
    //     Customer customer = new Customer();
    //     // Dacă se trimite userId, asociază-l
    //     if (customerDto.getUserId() != null) {
    //         User user = userRepository.findById(customerDto.getUserId()).orElse(null);
    //         customer.setUser(user);
    //     }
    //     customer = convertToEntity(customerDto, customer);
    //     return convertToDto(customerRepository.save(customer));
    // }

    // @Transactional
    // public CustomerDto updateCustomer(Long id, CustomerDto customerDto) {
    //     Customer existingCustomer = customerRepository.findById(id)
    //         .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
    //     existingCustomer = convertToEntity(customerDto, existingCustomer);
    //     return convertToDto(customerRepository.save(existingCustomer));
    // }

    // @Transactional
    // public void deleteCustomer(Long id){
    //      if(!customerRepository.existsById(id)){
    //          throw new ResourceNotFoundException("Customer not found with id: " + id);
    //      }
    //      // Verifică dacă clientul are comenzi înainte de ștergere
    //      customerRepository.deleteById(id);
    // }

}