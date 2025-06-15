package com.magazincomputere.magazin_api.service;

import com.magazincomputere.magazin_api.dto.ProductDto;
import com.magazincomputere.magazin_api.dto.SpecificationDto;
import com.magazincomputere.magazin_api.exception.ResourceNotFoundException;
import com.magazincomputere.magazin_api.model.Category;
import com.magazincomputere.magazin_api.model.Product;
import com.magazincomputere.magazin_api.model.ProductSpecificationValue;
import com.magazincomputere.magazin_api.model.SpecificationDefinition;
import com.magazincomputere.magazin_api.repository.CategoryRepository;
import com.magazincomputere.magazin_api.repository.ProductRepository;
import com.magazincomputere.magazin_api.repository.ProductSpecificationValueRepository;
import com.magazincomputere.magazin_api.repository.SpecificationDefinitionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SpecificationDefinitionRepository specDefRepository;
    private final ProductSpecificationValueRepository specValueRepository;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository, SpecificationDefinitionRepository specDefRepository, ProductSpecificationValueRepository specValueRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.specDefRepository = specDefRepository;
        this.specValueRepository = specValueRepository;
    }

    public List<ProductDto> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return mapToDto(product);
    }

    @Transactional
    public ProductDto createProduct(ProductDto productDto) {
        Product product = new Product();
        product.setName(productDto.getName());
        product.setDescription(productDto.getDescription());
        product.setPrice(productDto.getPrice());
        // MODIFICARE: Adăugăm stockQuantity la creare
        product.setStockQuantity(productDto.getStockQuantity());
        
        Category category = categoryRepository.findById(productDto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        product.setCategory(category);
        
        Product savedProduct = productRepository.save(product);

        if (productDto.getSpecifications() != null) {
            for (SpecificationDto specDto : productDto.getSpecifications()) {
                SpecificationDefinition specDef = specDefRepository.findById(specDto.getDefinitionId())
                        .orElseThrow(() -> new ResourceNotFoundException("Specification Definition not found"));

                ProductSpecificationValue specValue = new ProductSpecificationValue();
                specValue.setProduct(savedProduct);
                specValue.setSpecificationDefinition(specDef);
                specValue.setValue(specDto.getValue());
                
                specValueRepository.save(specValue);
            }
        }
        return mapToDto(productRepository.findById(savedProduct.getId()).get());
    }

    @Transactional
    public ProductDto updateProduct(Long id, ProductDto productDto) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        existingProduct.setName(productDto.getName());
        existingProduct.setDescription(productDto.getDescription());
        existingProduct.setPrice(productDto.getPrice());
        // MODIFICARE: Adăugăm stockQuantity la actualizare
        existingProduct.setStockQuantity(productDto.getStockQuantity());

        if (!existingProduct.getCategory().getId().equals(productDto.getCategoryId())) {
            Category newCategory = categoryRepository.findById(productDto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            existingProduct.setCategory(newCategory);
        }
        
        specValueRepository.deleteAll(existingProduct.getSpecifications());
        existingProduct.getSpecifications().clear();
        productRepository.saveAndFlush(existingProduct);

        if (productDto.getSpecifications() != null) {
            for (SpecificationDto specDto : productDto.getSpecifications()) {
                SpecificationDefinition specDef = specDefRepository.findById(specDto.getDefinitionId())
                        .orElseThrow(() -> new ResourceNotFoundException("Specification Definition not found"));
                
                ProductSpecificationValue specValue = new ProductSpecificationValue();
                specValue.setProduct(existingProduct);
                specValue.setSpecificationDefinition(specDef);
                specValue.setValue(specDto.getValue());
                
                existingProduct.getSpecifications().add(specValue);
            }
        }
        
        Product updatedProduct = productRepository.save(existingProduct);
        return mapToDto(updatedProduct);
    }

    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }
    
    // Update the mapToDto method in ProductService to include review data:

private ProductDto mapToDto(Product product) {
    ProductDto dto = new ProductDto();
    dto.setId(product.getId());
    dto.setName(product.getName());
    dto.setDescription(product.getDescription());
    dto.setPrice(product.getPrice());
    dto.setStockQuantity(product.getStockQuantity());
    dto.setCategoryId(product.getCategory().getId());
    dto.setCategoryName(product.getCategory().getName());
    
    // Add review data
    dto.setAverageRating(product.calculateAverageRating());
    dto.setReviewCount(product.getReviewCount());

    if (product.getSpecifications() != null) {
        dto.setSpecifications(product.getSpecifications().stream().map(specValue -> {
            SpecificationDto specDto = new SpecificationDto();
            specDto.setDefinitionId(specValue.getSpecificationDefinition().getId());
            specDto.setName(specValue.getSpecificationDefinition().getName());
            specDto.setValue(specValue.getValue());
            return specDto;
        }).collect(Collectors.toList()));
    } else {
        dto.setSpecifications(new ArrayList<>());
    }
    return dto;
}
}
