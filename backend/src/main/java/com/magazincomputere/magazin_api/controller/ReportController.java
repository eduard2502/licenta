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
import java.time.format.DateTimeFormatter;

@RestController
// Am actualizat ruta de bază pentru a se potrivi cu celelalte controllere de admin
@RequestMapping("/api/admin/reports") 
@PreAuthorize("hasRole('ADMIN')")
public class ReportController {

    @Autowired
    private ReportService reportService;

    // Endpoint pentru a vedea datele raportului în format JSON (util pentru debugging)
    @GetMapping("/general")
    public ResponseEntity<GeneralReportDto> generateGeneralReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        GeneralReportDto report = reportService.generateGeneralReport(startDate, endDate);
        return ResponseEntity.ok(report);
    }
    
    // Endpoint unic și robust pentru descărcarea rapoartelor
    @GetMapping("/download")
    public ResponseEntity<byte[]> downloadReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam String format) {
        
        byte[] reportData;
        String contentType;
        String fileName;

        // Construim un nume de fișier dinamic, care include perioada
        String dateSuffix = startDate.toString() + "_to_" + endDate.toString();

        if ("pdf".equalsIgnoreCase(format)) {
            reportData = reportService.generatePdfReport(startDate, endDate);
            contentType = MediaType.APPLICATION_PDF_VALUE;
            fileName = "Raport_" + dateSuffix + ".pdf";
        } else if ("excel".equalsIgnoreCase(format)) {
            reportData = reportService.generateExcelReport(startDate, endDate);
            contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            fileName = "Raport_" + dateSuffix + ".xlsx";
        } else {
            // Dacă formatul nu este nici pdf, nici excel, returnăm o eroare
            return ResponseEntity.badRequest().body("Format invalid. Folosiți 'pdf' sau 'excel'.".getBytes());
        }

        // Setăm antetele HTTP corecte pentru a forța descărcarea
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(reportData);
    }
    
    // Am eliminat celelalte endpoint-uri individuale (/sales, /stock, /users) pentru a simplifica.
    // Acum totul se gestionează prin /general (pentru vizualizare JSON) și /download (pentru descărcare).
}
