package com.magazincomputere.magazin_api.dto.report;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalesReportDto {
    private Integer totalSales;
    private BigDecimal totalRevenue;
    private LocalDate periodStart;
    private LocalDate periodEnd;
    private List<DailySalesDto> dailySales;
    private List<ProductSalesDto> topSellingProducts;
    private List<CategorySalesDto> categorySales;
}