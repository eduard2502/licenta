package com.magazincomputere.magazin_api.dto.report;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockItemDto {
    private Long productId;
    private String productName;
    private String category;
    private Integer currentStock;
    private BigDecimal price;
    private BigDecimal stockValue;
}