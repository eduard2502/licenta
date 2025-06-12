package com.magazincomputere.magazin_api.controller;

import com.magazincomputere.magazin_api.dto.UserDto;
import com.magazincomputere.magazin_api.dto.UserUpdateDto; // Import the new DTO
import com.magazincomputere.magazin_api.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public List<UserDto> getAllUsers() {
        return userService.findAllUsers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        UserDto userDto = userService.findUserById(id);
        return ResponseEntity.ok(userDto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(
            @PathVariable Long id, 
            @Valid @RequestBody UserUpdateDto userUpdateDto, // Use UserUpdateDto
            BindingResult bindingResult) {
        
        // Check for validation errors
        if (bindingResult.hasErrors()) {
            Map<String, String> fieldErrors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error -> 
                fieldErrors.put(error.getField(), error.getDefaultMessage())
            );
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Input data validation failed");
            errorResponse.put("fieldErrors", fieldErrors);
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
        
        try {
            // Log the received data for debugging
            System.out.println("Updating user " + id + " with data: " + userUpdateDto);
            
            UserDto updatedUser = userService.updateUser(id, userUpdateDto);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}