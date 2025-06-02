package com.magazincomputere.magazin_api.controller;

// import com.magazincomputere.magazin_api.dto.SalesReportDto; // DTO pentru răspunsul raportului
// import com.magazincomputere.magazin_api.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
@PreAuthorize("hasRole('ADMIN')")
public class ReportController {

    // @Autowired
    // private ReportService reportService;

    // @GetMapping("/sales-by-category")
    // public ResponseEntity<SalesReportDto> getSalesByCategoryAndPeriod(
    //         @RequestParam Long categoryId,
    //         @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
    //         @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
    //     SalesReportDto report = reportService.generateSalesByCategoryAndPeriod(categoryId, startDate, endDate);
    //     return ResponseEntity.ok(report);
    // }
    // TODO: Definește SalesReportDto și implementează logica în ReportService
}