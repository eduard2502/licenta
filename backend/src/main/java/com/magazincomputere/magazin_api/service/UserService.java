package com.magazincomputere.magazin_api.service;

import com.magazincomputere.magazin_api.dto.UserDto;
import com.magazincomputere.magazin_api.exception.ResourceNotFoundException;
import com.magazincomputere.magazin_api.model.User; // Importă și Role, ERole
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
    private PasswordEncoder passwordEncoder; // Injectează pentru a parola parolele

    private UserDto convertToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        if (user.getRoles() != null) {
            dto.setRoles(user.getRoles().stream().map(role -> role.getName().name()).collect(Collectors.toSet()));
        }
        return dto;
    }

    // Notă: Nu vom avea convertToEntity care primește parola în clar aici
    // Crearea utilizatorilor se face prin AuthController/Signup sau un DTO specific.
    // Actualizarea parolei ar trebui să aibă un endpoint și DTO dedicat.

    @Transactional(readOnly = true)
    public List<UserDto> findAllUsers() {
        return userRepository.findAll().stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserDto findUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return convertToDto(user);
    }

    @Transactional
    public UserDto updateUser(Long id, UserDto userDto) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        // Nu permitem schimbarea username-ului prin acest DTO general
        // existingUser.setUsername(userDto.getUsername()); // Comentat intenționat

        existingUser.setEmail(userDto.getEmail());

        if (userDto.getRoles() != null && !userDto.getRoles().isEmpty()) {
            Set<Role> newRoles = new HashSet<>();
            userDto.getRoles().forEach(roleName -> {
                ERole eRole = ERole.valueOf(roleName); // Presupune că rolurile din DTO sunt valide
                Role role = roleRepository.findByName(eRole)
                        .orElseThrow(() -> new RuntimeException("Error: Role " + roleName + " is not found."));
                newRoles.add(role);
            });
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
        // TODO: Adaugă logica de verificare a dependențelor (comenzi, etc.) înainte de ștergere
        userRepository.deleteById(id);
    }
}