// backend/src/main/java/com/magazincomputere/magazin_api/controller/UserController.java
package com.magazincomputere.magazin_api.controller;

import com.magazincomputere.magazin_api.dto.UserDto;
import com.magazincomputere.magazin_api.dto.UserUpdateDto;
import com.magazincomputere.magazin_api.service.UserService;
import com.magazincomputere.magazin_api.security.services.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    // New endpoint for users to get their own profile
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDto> getMyProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UserDto userDto = userService.findUserById(userDetails.getId());
        return ResponseEntity.ok(userDto);
    }

    // New endpoint for users to update their own profile
    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateMyProfile(
            @Valid @RequestBody UserUpdateDto userUpdateDto,
            BindingResult bindingResult) {
        
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
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        try {
            // For user's own profile update, don't allow role changes
            userUpdateDto.setRoles(null); // Clear any role changes
            UserDto updatedUser = userService.updateUser(userDetails.getId(), userUpdateDto);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Existing admin endpoints remain unchanged
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserDto> getAllUsers() {
        return userService.findAllUsers();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        UserDto userDto = userService.findUserById(id);
        return ResponseEntity.ok(userDto);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUser(
            @PathVariable Long id, 
            @Valid @RequestBody UserUpdateDto userUpdateDto,
            BindingResult bindingResult) {
        
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
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}