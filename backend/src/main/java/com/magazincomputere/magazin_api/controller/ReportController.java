package com.magazincomputere.magazin_api.controller;

import com.magazincomputere.magazin_api.dto.report.*;
import com.magazincomputere.magazin_api.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/reports")
@PreAuthorize("hasRole('ADMIN')")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/general")
    public ResponseEntity<GeneralReportDto> generateGeneralReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        GeneralReportDto report = reportService.generateGeneralReport(startDate, endDate);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/sales")
    public ResponseEntity<SalesReportDto> getSalesReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        SalesReportDto report = reportService.generateSalesReport(startDate, endDate);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/stock")
    public ResponseEntity<StockReportDto> getStockReport() {
        StockReportDto report = reportService.generateStockReport();
        return ResponseEntity.ok(report);
    }

    @GetMapping("/users")
    public ResponseEntity<UserReportDto> getUserReport() {
        UserReportDto report = reportService.generateUserReport();
        return ResponseEntity.ok(report);
    }

    @GetMapping("/download")
    public ResponseEntity<byte[]> downloadReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam String format) {
        
        byte[] reportData;
        String contentType;
        String fileName;

        if ("pdf".equalsIgnoreCase(format)) {
            reportData = reportService.generatePdfReport(startDate, endDate);
            contentType = MediaType.APPLICATION_PDF_VALUE;
            fileName = "report.pdf";
        } else if ("excel".equalsIgnoreCase(format)) {
            reportData = reportService.generateExcelReport(startDate, endDate);
            contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            fileName = "report.xlsx";
        } else {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(reportData);
    }
}