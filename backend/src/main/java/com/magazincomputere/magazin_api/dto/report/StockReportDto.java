package com.magazincomputere.magazin_api.dto.report;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockReportDto {
    private Integer totalProducts;
    private BigDecimal totalStockValue;
    private List<StockItemDto> lowStockProducts;
    private List<StockItemDto> outOfStockProducts;
    private List<CategoryStockDto> categoryStock;
}