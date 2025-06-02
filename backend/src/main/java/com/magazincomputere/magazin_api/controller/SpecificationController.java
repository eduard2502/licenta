package com.magazincomputere.magazin_api.controller;

import com.magazincomputere.magazin_api.dto.SpecificationDefinitionDto; // Va trebui să creezi acest DTO
import com.magazincomputere.magazin_api.service.SpecificationService; // Va trebui să creezi acest serviciu
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/specifications/definitions") // Am specificat 'definitions' pentru claritate
public class SpecificationController {

    @Autowired
    private SpecificationService specificationService;

    @GetMapping
    public List<SpecificationDefinitionDto> getAllSpecificationDefinitions() { // Acces public
        return specificationService.getAllDefinitions();
    }

    @GetMapping("/{id}")
    public ResponseEntity<SpecificationDefinitionDto> getSpecificationDefinitionById(@PathVariable Long id) { // Acces public
        SpecificationDefinitionDto dto = specificationService.getDefinitionById(id);
        return ResponseEntity.ok(dto);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SpecificationDefinitionDto> createSpecificationDefinition(@Valid @RequestBody SpecificationDefinitionDto definitionDto) {
        SpecificationDefinitionDto savedDto = specificationService.createDefinition(definitionDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedDto);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SpecificationDefinitionDto> updateSpecificationDefinition(@PathVariable Long id, @Valid @RequestBody SpecificationDefinitionDto definitionDto) {
        SpecificationDefinitionDto updatedDto = specificationService.updateDefinition(id, definitionDto);
        return ResponseEntity.ok(updatedDto);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSpecificationDefinition(@PathVariable Long id) {
        specificationService.deleteDefinition(id);
        return ResponseEntity.noContent().build();
    }
}