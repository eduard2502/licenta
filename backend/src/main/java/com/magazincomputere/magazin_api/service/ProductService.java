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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private SpecificationDefinitionRepository specificationDefinitionRepository;
    @Autowired
    private ProductSpecificationValueRepository productSpecificationValueRepository; // Adăugat

    private ProductDto convertToDto(Product product) {
        ProductDto dto = new ProductDto();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setStockQuantity(product.getStockQuantity());
      //  dto.setImageBase64(product.getImageBase64());
        if (product.getCategory() != null) {
            dto.setCategoryId(product.getCategory().getId());
            dto.setCategoryName(product.getCategory().getName());
        }
        if (product.getSpecifications() != null) {
            dto.setSpecifications(product.getSpecifications().stream().map(specVal ->
                new SpecificationDto(
                    specVal.getSpecificationDefinition().getId(),
                    specVal.getSpecificationDefinition().getName(),
                    specVal.getValue(),
                    specVal.getSpecificationDefinition().getUnit()
                )
            ).collect(Collectors.toList()));
        }
        return dto;
    }

    private Product convertToEntity(ProductDto productDto, Product product) {
        product.setName(productDto.getName());
        product.setDescription(productDto.getDescription());
        product.setPrice(productDto.getPrice());
        product.setStockQuantity(productDto.getStockQuantity());
       // product.setImageBase64(productDto.getImageBase64());

        if (productDto.getCategoryId() != null) {
            Category category = categoryRepository.findById(productDto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + productDto.getCategoryId()));
            product.setCategory(category);
        } else {
            product.setCategory(null);
        }

        // Gestionare specificații
        // Șterge specificațiile vechi (o abordare simplă; poate fi optimizată)
        if (product.getId() != null) { // Doar pentru update
             product.getSpecifications().clear(); // Va declanșa orphanRemoval dacă e configurat
             // Alternativ, iterează și șterge manual dacă orphanRemoval nu e suficient:
             // productSpecificationValueRepository.deleteAll(product.getSpecifications());
        }


        if (productDto.getSpecifications() != null) {
            List<ProductSpecificationValue> newSpecValues = new ArrayList<>();
            for (SpecificationDto specDto : productDto.getSpecifications()) {
                SpecificationDefinition def;
                if (specDto.getDefinitionId() != null) {
                    def = specificationDefinitionRepository.findById(specDto.getDefinitionId())
                        .orElseThrow(() -> new ResourceNotFoundException("SpecificationDefinition not found with id: " + specDto.getDefinitionId()));
                } else if (specDto.getName() != null && !specDto.getName().trim().isEmpty()){
                    // Caută sau creează o nouă definiție de specificație dacă se trimite numele
                    def = specificationDefinitionRepository.findByNameIgnoreCase(specDto.getName().trim())
                        .orElseGet(() -> {
                            SpecificationDefinition newDef = new SpecificationDefinition();
                            newDef.setName(specDto.getName().trim());
                            newDef.setUnit(specDto.getUnit()); // Salvează și unitatea dacă e trimisă
                            return specificationDefinitionRepository.save(newDef);
                        });
                } else {
                    throw new IllegalArgumentException("Specification must have a definitionId or a name.");
                }

                ProductSpecificationValue specValue = new ProductSpecificationValue();
                specValue.setProduct(product); // Asociază cu produsul curent
                specValue.setSpecificationDefinition(def);
                specValue.setValue(specDto.getValue());
                newSpecValues.add(specValue);
            }
             product.setSpecifications(newSpecValues); // Setează noua listă
        } else {
             product.setSpecifications(new ArrayList<>()); // Sau lasă null dacă este permis
        }
        return product;
    }
    // Restul metodelor (getAllProducts, getProductById, createProduct, updateProduct, deleteProduct)
    // rămân ca în exemplul anterior, dar vor beneficia de noile metode de conversie.
    // Asigură-te că createProduct și updateProduct apelează corect convertToEntity.

    @Transactional(readOnly = true)
    public List<ProductDto> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return convertToDto(product);
    }

    @Transactional
    public ProductDto createProduct(ProductDto productDto) {
        Product product = new Product();
        product = convertToEntity(productDto, product); // Se mapează și specificațiile
        Product savedProduct = productRepository.save(product);
        return convertToDto(savedProduct);
    }

    @Transactional
    public ProductDto updateProduct(Long id, ProductDto productDto) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        // Salvează referința la specificațiile vechi înainte de a le curăța din entitate
        // pentru a le șterge explicit dacă orphanRemoval nu funcționează cum te aștepți
        // sau dacă vrei control mai fin. Această parte poate fi complexă.
        // O strategie simplă este ca convertToEntity să gestioneze curățarea și adăugarea.

        existingProduct = convertToEntity(productDto, existingProduct);
        Product updatedProduct = productRepository.save(existingProduct);
        return convertToDto(updatedProduct);
    }

    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }
}