package com.magazincomputere.magazin_api.dto.report;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GeneralReportDto {
    private LocalDateTime generatedAt;
    private ReportPeriodDto reportPeriod;
    private SalesReportDto salesReport;
    private StockReportDto stockReport;
    private UserReportDto userReport;
}