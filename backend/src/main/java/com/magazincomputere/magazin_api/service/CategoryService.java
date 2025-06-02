package com.magazincomputere.magazin_api.service;

import com.magazincomputere.magazin_api.dto.CategoryDto;
import com.magazincomputere.magazin_api.exception.ResourceNotFoundException;
import com.magazincomputere.magazin_api.model.Category;
import com.magazincomputere.magazin_api.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    // --- Metode de conversie DTO <-> Entity ---
    private CategoryDto convertToDto(Category category) {
        CategoryDto dto = new CategoryDto();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        return dto;
    }

    // Această metodă modifică direct obiectul 'category' pasat
    private void updateEntityFromDto(CategoryDto categoryDto, Category category) {
        category.setName(categoryDto.getName());
        category.setDescription(categoryDto.getDescription());
    }
    // --- Sfârșit metode de conversie ---

    @Transactional(readOnly = true)
    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryDto getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        return convertToDto(category);
    }

    @Transactional
    public CategoryDto createCategory(CategoryDto categoryDto) {
        categoryRepository.findByNameIgnoreCase(categoryDto.getName()).ifPresent(existingCategory -> {
            throw new IllegalArgumentException("Category with name '" + existingCategory.getName() + "' already exists.");
        });
        Category category = new Category();
        updateEntityFromDto(categoryDto, category); // Folosim metoda care nu returnează pentru claritate
        Category savedCategory = categoryRepository.save(category);
        return convertToDto(savedCategory);
    }

    @Transactional
    public CategoryDto updateCategory(Long id, CategoryDto categoryDto) {
        // Pasul 1: Găsește entitatea existentă
        Category existingCategory = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        // Pasul 2: Verifică dacă noul nume este deja folosit de altă categorie
        // Folosim o variabilă finală sau effectively final pentru ID-ul categoriei existente în lambda
        final Long existingCategoryId = existingCategory.getId();
        categoryRepository.findByNameIgnoreCase(categoryDto.getName()).ifPresent(catWithSameName -> {
            if (!catWithSameName.getId().equals(existingCategoryId)) {
                throw new IllegalArgumentException("Another category with name '" + catWithSameName.getName() + "' already exists.");
            }
        });

        // Pasul 3: Actualizează câmpurile entității existente cu datele din DTO
        // Nu re-atribuim existingCategory, ci îi modificăm starea.
        updateEntityFromDto(categoryDto, existingCategory);

        // Pasul 4: Salvează entitatea actualizată
        Category updatedCategory = categoryRepository.save(existingCategory);

        // Pasul 5: Converteste entitatea actualizată în DTO și returneaz-o
        return convertToDto(updatedCategory);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        
        // TODO: Adaugă logica de verificare dacă există produse în această categorie înainte de ștergere
        // De exemplu: if (!productRepository.findByCategoryId(id).isEmpty()) { throw new BadRequestException("Cannot delete category with products."); }
        categoryRepository.delete(category);
    }
}