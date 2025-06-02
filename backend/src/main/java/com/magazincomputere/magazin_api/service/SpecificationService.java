package com.magazincomputere.magazin_api.service;

import com.magazincomputere.magazin_api.dto.SpecificationDefinitionDto;
import com.magazincomputere.magazin_api.exception.ResourceNotFoundException;
import com.magazincomputere.magazin_api.model.SpecificationDefinition;
import com.magazincomputere.magazin_api.repository.SpecificationDefinitionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SpecificationService {

    @Autowired
    private SpecificationDefinitionRepository definitionRepository;

    private SpecificationDefinitionDto convertToDto(SpecificationDefinition definition) {
        return new SpecificationDefinitionDto(definition.getId(), definition.getName(), definition.getUnit());
    }

    // Metodă pentru a actualiza câmpurile unei entități existente dintr-un DTO
    private void updateEntityFromDto(SpecificationDefinitionDto dto, SpecificationDefinition definition) {
        definition.setName(dto.getName());
        definition.setUnit(dto.getUnit());
    }

    @Transactional(readOnly = true)
    public List<SpecificationDefinitionDto> getAllDefinitions() {
        return definitionRepository.findAll().stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SpecificationDefinitionDto getDefinitionById(Long id) {
        SpecificationDefinition def = definitionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SpecificationDefinition", "id", id));
        return convertToDto(def);
    }

    @Transactional
    public SpecificationDefinitionDto createDefinition(SpecificationDefinitionDto definitionDto) {
         definitionRepository.findByNameIgnoreCase(definitionDto.getName()).ifPresent(existingDef -> {
            throw new IllegalArgumentException("Specification definition with name '" + existingDef.getName() + "' already exists.");
        });
        SpecificationDefinition definition = new SpecificationDefinition();
        updateEntityFromDto(definitionDto, definition); // Folosim metoda care nu returnează pentru claritate
        SpecificationDefinition saved = definitionRepository.save(definition);
        return convertToDto(saved);
    }

    @Transactional
    public SpecificationDefinitionDto updateDefinition(Long id, SpecificationDefinitionDto definitionDto) {
        // Pasul 1: Găsește entitatea existentă
        SpecificationDefinition existingDef = definitionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SpecificationDefinition", "id", id));
        
        // Pasul 2: Verifică dacă noul nume este deja folosit de altă definiție
        // Folosim o variabilă finală sau effectively final pentru ID-ul definiției existente în lambda
        final Long existingDefId = existingDef.getId();
        definitionRepository.findByNameIgnoreCase(definitionDto.getName()).ifPresent(defWithSameName -> {
            if(!defWithSameName.getId().equals(existingDefId)){
                 throw new IllegalArgumentException("Another specification definition with name '" + defWithSameName.getName() + "' already exists.");
            }
        });

        // Pasul 3: Actualizează câmpurile entității existente cu datele din DTO
        // Nu re-atribuim existingDef, ci îi modificăm starea.
        updateEntityFromDto(definitionDto, existingDef);

        // Pasul 4: Salvează entitatea actualizată
        SpecificationDefinition updated = definitionRepository.save(existingDef);

        // Pasul 5: Converteste entitatea actualizată în DTO și returneaz-o
        return convertToDto(updated);
    }

    @Transactional
    public void deleteDefinition(Long id) {
        SpecificationDefinition definition = definitionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SpecificationDefinition", "id", id));
        
        // TODO: Verifică dacă această definiție este folosită în ProductSpecificationValue înainte de ștergere.
        // De exemplu: if (!productSpecificationValueRepository.findBySpecificationDefinitionId(id).isEmpty()) {
        // throw new BadRequestException("Cannot delete specification definition that is in use by products.");
        // }
        definitionRepository.delete(definition);
    }
}