package com.magazincomputere.magazin_api.dto.report;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportPeriodDto {
    private LocalDate startDate;
    private LocalDate endDate;
    private String type; // daily, weekly, monthly, yearly, custom
}