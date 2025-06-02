package com.magazincomputere.magazin_api.controller;

import com.magazincomputere.magazin_api.dto.UserDto; // Va trebui să creezi acest DTO
import com.magazincomputere.magazin_api.service.UserService; // Va trebui să creezi acest serviciu
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')") // Majoritatea operațiunilor sunt pentru ADMIN
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

    // Adminul poate crea utilizatori (sau poate fi doar prin /api/auth/signup)
    // @PostMapping
    // public ResponseEntity<UserDto> createUser(@Valid @RequestBody UserDto userDto) {
    //     UserDto createdUser = userService.createUser(userDto); // Acest serviciu ar trebui să paroleze și să seteze roluri
    //     return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
    // }

    @PutMapping("/{id}")
    public ResponseEntity<UserDto> updateUser(@PathVariable Long id, @Valid @RequestBody UserDto userDto) {
        // Atenție la actualizarea parolei și a rolurilor
        UserDto updatedUser = userService.updateUser(id, userDto);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}