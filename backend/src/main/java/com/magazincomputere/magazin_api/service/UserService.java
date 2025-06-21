package com.magazincomputere.magazin_api.service;

import com.magazincomputere.magazin_api.dto.UserDto;
import com.magazincomputere.magazin_api.dto.UserUpdateDto; // Import the new DTO
import com.magazincomputere.magazin_api.exception.ResourceNotFoundException;
import com.magazincomputere.magazin_api.model.User;
import com.magazincomputere.magazin_api.model.Role;
import com.magazincomputere.magazin_api.model.ERole;
import com.magazincomputere.magazin_api.repository.UserRepository;
import com.magazincomputere.magazin_api.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private UserDto convertToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setAvatarImageBase64(user.getAvatarImageBase64());
        if (user.getRoles() != null) {
            dto.setRoles(user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet()));
        }
        return dto;
    }

    @Transactional(readOnly = true)
    public List<UserDto> findAllUsers() {
        return userRepository.findAll().stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserDto findUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return convertToDto(user);
    }

    @Transactional
    public UserDto updateUser(Long id, UserUpdateDto userUpdateDto) { // Accept UserUpdateDto
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        // Log for debugging
        System.out.println("Existing user: " + existingUser.getUsername());
        System.out.println("Update data - email: " + userUpdateDto.getEmail());
        System.out.println("Update data - roles: " + userUpdateDto.getRoles());

        // Update email
        existingUser.setEmail(userUpdateDto.getEmail());
        
        if (userUpdateDto.getAvatarImageBase64() != null) {
            existingUser.setAvatarImageBase64(userUpdateDto.getAvatarImageBase64());
        }

        // Update roles if provided
        if (userUpdateDto.getRoles() != null && !userUpdateDto.getRoles().isEmpty()) {
            Set<Role> newRoles = new HashSet<>();
            for (String roleName : userUpdateDto.getRoles()) {
                // Handle both with and without ROLE_ prefix
                String normalizedRoleName = roleName.startsWith("ROLE_") ? roleName : "ROLE_" + roleName;
                
                try {
                    ERole eRole = ERole.valueOf(normalizedRoleName);
                    Role role = roleRepository.findByName(eRole)
                            .orElseThrow(() -> new RuntimeException("Error: Role " + normalizedRoleName + " is not found."));
                    newRoles.add(role);
                } catch (IllegalArgumentException e) {
                    throw new RuntimeException("Error: Invalid role name " + roleName);
                }
            }
            existingUser.setRoles(newRoles);
        }

        User updatedUser = userRepository.save(existingUser);
        return convertToDto(updatedUser);
    }

    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }
}