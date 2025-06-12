package com.magazincomputere.magazin_api.dto.report;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategorySalesDto {
    private String category;
    private Integer quantitySold;
    private BigDecimal revenue;
}