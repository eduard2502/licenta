package com.magazincomputere.magazin_api.service;

import com.magazincomputere.magazin_api.dto.report.*;
import com.magazincomputere.magazin_api.model.*;
import com.magazincomputere.magazin_api.repository.*;

// Excel imports
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.ss.util.CellRangeAddress;

// PDF imports
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
// Not importing com.itextpdf.layout.element.Cell to avoid conflicts
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.io.font.constants.StandardFonts;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
@Service
@Transactional(readOnly = true)
public class ReportService {

    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;

    public GeneralReportDto generateGeneralReport(LocalDate startDate, LocalDate endDate) {
        GeneralReportDto report = new GeneralReportDto();
        report.setGeneratedAt(LocalDateTime.now());
        
        ReportPeriodDto period = new ReportPeriodDto();
        period.setStartDate(startDate);
        period.setEndDate(endDate);
        period.setType("custom");
        report.setReportPeriod(period);
        
        report.setSalesReport(generateSalesReport(startDate, endDate));
        report.setStockReport(generateStockReport());
        report.setUserReport(generateUserReport());
        
        return report;
    }

    public SalesReportDto generateSalesReport(LocalDate startDate, LocalDate endDate) {
        SalesReportDto salesReport = new SalesReportDto();
        salesReport.setPeriodStart(startDate);
        salesReport.setPeriodEnd(endDate);
        
        // Obține toate comenzile din perioada specificată
        List<Order> orders = orderRepository.findAll().stream()
            .filter(order -> {
                LocalDate orderDate = order.getOrderDate().toLocalDate();
                return !orderDate.isBefore(startDate) && !orderDate.isAfter(endDate);
            })
            .filter(order -> !"CANCELED".equals(order.getStatus()))
            .collect(Collectors.toList());
        
        // Calculează totaluri
        salesReport.setTotalSales(orders.size());
        BigDecimal totalRevenue = orders.stream()
            .map(Order::getTotalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        salesReport.setTotalRevenue(totalRevenue);
        
        // Vânzări zilnice
        Map<LocalDate, List<Order>> ordersByDate = orders.stream()
            .collect(Collectors.groupingBy(order -> order.getOrderDate().toLocalDate()));
        
        List<DailySalesDto> dailySales = new ArrayList<>();
        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            List<Order> dayOrders = ordersByDate.getOrDefault(currentDate, new ArrayList<>());
            DailySalesDto dailySale = new DailySalesDto();
            dailySale.setDate(currentDate);
            dailySale.setSalesCount(dayOrders.size());
            dailySale.setRevenue(dayOrders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
            dailySales.add(dailySale);
            currentDate = currentDate.plusDays(1);
        }
        salesReport.setDailySales(dailySales);
        
        // Top produse vândute
        Map<Product, Integer> productSales = new HashMap<>();
        Map<Product, BigDecimal> productRevenue = new HashMap<>();
        
        for (Order order : orders) {
            for (OrderItem item : order.getOrderItems()) {
                Product product = productRepository.findById(item.getProductIdSnapshot()).orElse(null);
                if (product != null) {
                    productSales.merge(product, item.getQuantity(), Integer::sum);
                    productRevenue.merge(product, item.getLineTotal(), BigDecimal::add);
                }
            }
        }
        
        List<ProductSalesDto> topProducts = productSales.entrySet().stream()
            .sorted(Map.Entry.<Product, Integer>comparingByValue().reversed())
            .limit(10)
            .map(entry -> {
                Product product = entry.getKey();
                ProductSalesDto dto = new ProductSalesDto();
                dto.setProductId(product.getId());
                dto.setProductName(product.getName());
                dto.setCategory(product.getCategory().getName());
                dto.setQuantitySold(entry.getValue());
                dto.setRevenue(productRevenue.get(product));
                dto.setCurrentStock(product.getStockQuantity());
                return dto;
            })
            .collect(Collectors.toList());
        salesReport.setTopSellingProducts(topProducts);
        
        // Vânzări pe categorii
        Map<String, Integer> categorySales = new HashMap<>();
        Map<String, BigDecimal> categoryRevenue = new HashMap<>();
        
        for (Map.Entry<Product, Integer> entry : productSales.entrySet()) {
            String categoryName = entry.getKey().getCategory().getName();
            categorySales.merge(categoryName, entry.getValue(), Integer::sum);
            categoryRevenue.merge(categoryName, productRevenue.get(entry.getKey()), BigDecimal::add);
        }
        
        List<CategorySalesDto> categorySalesList = categorySales.entrySet().stream()
            .map(entry -> {
                CategorySalesDto dto = new CategorySalesDto();
                dto.setCategory(entry.getKey());
                dto.setQuantitySold(entry.getValue());
                dto.setRevenue(categoryRevenue.get(entry.getKey()));
                return dto;
            })
            .collect(Collectors.toList());
        salesReport.setCategorySales(categorySalesList);
        
        return salesReport;
    }

    public StockReportDto generateStockReport() {
        StockReportDto stockReport = new StockReportDto();
        
        List<Product> allProducts = productRepository.findAll();
        
        // Total produse și valoare stoc
        stockReport.setTotalProducts(allProducts.size());
        BigDecimal totalStockValue = allProducts.stream()
            .map(p -> p.getPrice().multiply(new BigDecimal(p.getStockQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        stockReport.setTotalStockValue(totalStockValue);
        
        // Produse cu stoc redus (< 10)
        List<StockItemDto> lowStock = allProducts.stream()
            .filter(p -> p.getStockQuantity() > 0 && p.getStockQuantity() < 10)
            .map(this::productToStockItem)
            .collect(Collectors.toList());
        stockReport.setLowStockProducts(lowStock);
        
        // Produse fără stoc
        List<StockItemDto> outOfStock = allProducts.stream()
            .filter(p -> p.getStockQuantity() == 0)
            .map(this::productToStockItem)
            .collect(Collectors.toList());
        stockReport.setOutOfStockProducts(outOfStock);
        
        // Stoc pe categorii
        Map<Category, List<Product>> productsByCategory = allProducts.stream()
            .collect(Collectors.groupingBy(Product::getCategory));
        
        List<CategoryStockDto> categoryStocks = productsByCategory.entrySet().stream()
            .map(entry -> {
                CategoryStockDto dto = new CategoryStockDto();
                dto.setCategory(entry.getKey().getName());
                dto.setTotalProducts(entry.getValue().size());
                dto.setTotalStock(entry.getValue().stream()
                    .mapToInt(Product::getStockQuantity)
                    .sum());
                dto.setStockValue(entry.getValue().stream()
                    .map(p -> p.getPrice().multiply(new BigDecimal(p.getStockQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add));
                return dto;
            })
            .collect(Collectors.toList());
        stockReport.setCategoryStock(categoryStocks);
        
        return stockReport;
    }

    public UserReportDto generateUserReport() {
        UserReportDto userReport = new UserReportDto();
        
        List<User> allUsers = userRepository.findAll();
        userReport.setTotalUsers(allUsers.size());
        
        // Pentru active users - considerăm toți utilizatorii ca activi momentan
        // În producție, ai putea avea un câmp lastLoginDate în User
        userReport.setActiveUsers(allUsers.size());
        
        // Utilizatori noi luna aceasta
        YearMonth currentMonth = YearMonth.now();
        LocalDateTime startOfMonth = currentMonth.atDay(1).atStartOfDay();
        long newUsersCount = allUsers.stream()
            .filter(user -> {
                // Presupunem că avem un câmp createdDate în User
                // Pentru moment, returnăm un număr estimativ
                return true; // Înlocuiește cu logica reală
            })
            .count();
        userReport.setNewUsersThisMonth((int) newUsersCount);
        
        // Utilizatori pe roluri
        Map<String, Long> usersByRole = allUsers.stream()
            .flatMap(user -> user.getRoles().stream())
            .collect(Collectors.groupingBy(role -> role.getName().name(), Collectors.counting()));
        
        List<UserRoleCountDto> roleCountList = usersByRole.entrySet().stream()
            .map(entry -> {
                UserRoleCountDto dto = new UserRoleCountDto();
                dto.setRole(entry.getKey());
                dto.setCount(entry.getValue().intValue());
                return dto;
            })
            .collect(Collectors.toList());
        userReport.setUsersByRole(roleCountList);
        
        // Înregistrări recente (ultimii 10 utilizatori)
        List<UserInfoDto> recentUsers = allUsers.stream()
            .sorted((u1, u2) -> Long.compare(u2.getId(), u1.getId())) // Sortare inversă după ID
            .limit(10)
            .map(user -> {
                UserInfoDto dto = new UserInfoDto();
                dto.setId(user.getId());
                dto.setUsername(user.getUsername());
                dto.setEmail(user.getEmail());
                dto.setRegistrationDate(LocalDateTime.now()); // Placeholder
                dto.setLastLoginDate(LocalDateTime.now()); // Placeholder
                dto.setIsActive(true);
                return dto;
            })
            .collect(Collectors.toList());
        userReport.setRecentRegistrations(recentUsers);
        
        return userReport;
    }

    private StockItemDto productToStockItem(Product product) {
        StockItemDto dto = new StockItemDto();
        dto.setProductId(product.getId());
        dto.setProductName(product.getName());
        dto.setCategory(product.getCategory().getName());
        dto.setCurrentStock(product.getStockQuantity());
        dto.setPrice(product.getPrice());
        dto.setStockValue(product.getPrice().multiply(new BigDecimal(product.getStockQuantity())));
        return dto;
    }

    public byte[] generatePdfReport(LocalDate startDate, LocalDate endDate) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);
            
            PdfFont titleFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            PdfFont normalFont = PdfFontFactory.createFont(StandardFonts.HELVETICA);
            PdfFont headerFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            
            document.add(new Paragraph("RAPORT GENERAL - MAGAZIN CALCULATOARE")
                .setFont(titleFont).setFontSize(18).setTextAlignment(TextAlignment.CENTER).setMarginBottom(20));
            
            document.add(new Paragraph(String.format("Perioada: %s - %s", 
                startDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")),
                endDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))))
                .setFont(normalFont).setTextAlignment(TextAlignment.CENTER).setMarginBottom(20));
            
            GeneralReportDto report = generateGeneralReport(startDate, endDate);
            
            // SALES SUMMARY
            document.add(new Paragraph("1. REZUMAT VÂNZĂRI").setFont(titleFont).setFontSize(14).setMarginTop(20).setMarginBottom(10));
            Table salesSummaryTable = new Table(2).setWidth(UnitValue.createPercentValue(100));
            salesSummaryTable.addCell(createHeaderCell("Total Vânzări:", headerFont));
            salesSummaryTable.addCell(createCell(report.getSalesReport().getTotalSales().toString() + " comenzi", normalFont));
            salesSummaryTable.addCell(createHeaderCell("Venituri Totale:", headerFont));
            salesSummaryTable.addCell(createCell(formatCurrency(report.getSalesReport().getTotalRevenue()), normalFont));
            document.add(salesSummaryTable);
            
            // TOP SELLING PRODUCTS
            document.add(new Paragraph("2. TOP PRODUSE VÂNDUTE").setFont(titleFont).setFontSize(14).setMarginTop(20).setMarginBottom(10));
            Table topProductsTable = new Table(new float[]{3, 2, 1, 2, 1}).setWidth(UnitValue.createPercentValue(100));
            topProductsTable.addHeaderCell(createHeaderCell("Produs", headerFont));
            topProductsTable.addHeaderCell(createHeaderCell("Categorie", headerFont));
            topProductsTable.addHeaderCell(createHeaderCell("Cantitate", headerFont));
            topProductsTable.addHeaderCell(createHeaderCell("Venituri", headerFont));
            topProductsTable.addHeaderCell(createHeaderCell("Stoc", headerFont));
            for (ProductSalesDto product : report.getSalesReport().getTopSellingProducts()) {
                topProductsTable.addCell(createCell(product.getProductName(), normalFont));
                topProductsTable.addCell(createCell(product.getCategory(), normalFont));
                topProductsTable.addCell(createCell(product.getQuantitySold().toString(), normalFont));
                topProductsTable.addCell(createCell(formatCurrency(product.getRevenue()), normalFont));
                topProductsTable.addCell(createCell(product.getCurrentStock().toString(), normalFont));
            }
            document.add(topProductsTable);
            
            // STOCK SUMMARY
            document.add(new Paragraph("3. REZUMAT STOC").setFont(titleFont).setFontSize(14).setMarginTop(20).setMarginBottom(10));
            Table stockSummaryTable = new Table(2).setWidth(UnitValue.createPercentValue(100));
            stockSummaryTable.addCell(createHeaderCell("Total Produse:", headerFont));
            stockSummaryTable.addCell(createCell(report.getStockReport().getTotalProducts().toString(), normalFont));
            stockSummaryTable.addCell(createHeaderCell("Valoare Totală Stoc:", headerFont));
            stockSummaryTable.addCell(createCell(formatCurrency(report.getStockReport().getTotalStockValue()), normalFont));
            stockSummaryTable.addCell(createHeaderCell("Produse Fără Stoc:", headerFont));
            stockSummaryTable.addCell(createCell(String.valueOf(report.getStockReport().getOutOfStockProducts().size()), normalFont));
            stockSummaryTable.addCell(createHeaderCell("Produse Stoc Redus:", headerFont));
            stockSummaryTable.addCell(createCell(String.valueOf(report.getStockReport().getLowStockProducts().size()), normalFont));
            document.add(stockSummaryTable);

            document.close();
            return baos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Eroare la generarea PDF", e);
        }
    }

     public byte[] generateExcelReport(LocalDate startDate, LocalDate endDate) {
        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            
            GeneralReportDto report = generateGeneralReport(startDate, endDate);
            
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle titleStyle = createTitleStyle(workbook);
            CellStyle currencyStyle = createCurrencyStyle(workbook);
            CellStyle dateStyle = createDateStyle(workbook);
            
            // SUMMARY SHEET
            Sheet summarySheet = workbook.createSheet("Rezumat");
            int rowNum = 0;
            
            // Title
            Row titleRow = summarySheet.createRow(rowNum++);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("RAPORT GENERAL - MAGAZIN CALCULATOARE");
            titleCell.setCellStyle(titleStyle);
            summarySheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 3));
            
            // Period
            Row periodRow = summarySheet.createRow(rowNum++);
            periodRow.createCell(0).setCellValue("Perioada: " + startDate + " - " + endDate);
            rowNum++; // Empty row
            
            // Sales Summary
            Row salesHeaderRow = summarySheet.createRow(rowNum++);
            salesHeaderRow.createCell(0).setCellValue("REZUMAT VÂNZĂRI");
            salesHeaderRow.getCell(0).setCellStyle(headerStyle);
            
            Row totalSalesRow = summarySheet.createRow(rowNum++);
            totalSalesRow.createCell(0).setCellValue("Total Vânzări:");
            totalSalesRow.createCell(1).setCellValue(report.getSalesReport().getTotalSales());
            
            Row totalRevenueRow = summarySheet.createRow(rowNum++);
            totalRevenueRow.createCell(0).setCellValue("Venituri Totale:");
            Cell revenueCell = totalRevenueRow.createCell(1);
            revenueCell.setCellValue(report.getSalesReport().getTotalRevenue().doubleValue());
            revenueCell.setCellStyle(currencyStyle);
            
            rowNum++; // Empty row
            
            // Stock Summary
            Row stockHeaderRow = summarySheet.createRow(rowNum++);
            stockHeaderRow.createCell(0).setCellValue("REZUMAT STOC");
            stockHeaderRow.getCell(0).setCellStyle(headerStyle);
            
            Row totalProductsRow = summarySheet.createRow(rowNum++);
            totalProductsRow.createCell(0).setCellValue("Total Produse:");
            totalProductsRow.createCell(1).setCellValue(report.getStockReport().getTotalProducts());
            
            Row stockValueRow = summarySheet.createRow(rowNum++);
            stockValueRow.createCell(0).setCellValue("Valoare Stoc:");
            Cell stockValueCell = stockValueRow.createCell(1);
            stockValueCell.setCellValue(report.getStockReport().getTotalStockValue().doubleValue());
            stockValueCell.setCellStyle(currencyStyle);
            
            // Auto-size columns
            for (int i = 0; i < 4; i++) {
                summarySheet.autoSizeColumn(i);
            }
            
            // 2. SALES DETAILS SHEET
            Sheet salesSheet = workbook.createSheet("Vânzări Detaliate");
            createSalesDetailsSheet(salesSheet, report.getSalesReport(), headerStyle, currencyStyle);
            
            // 3. TOP PRODUCTS SHEET
            Sheet topProductsSheet = workbook.createSheet("Top Produse");
            createTopProductsSheet(topProductsSheet, report.getSalesReport().getTopSellingProducts(), headerStyle, currencyStyle);
            
            // 4. STOCK DETAILS SHEET
            Sheet stockSheet = workbook.createSheet("Detalii Stoc");
            createStockDetailsSheet(stockSheet, report.getStockReport(), headerStyle, currencyStyle);
            
            // 5. USER DETAILS SHEET
            Sheet userSheet = workbook.createSheet("Utilizatori");
            createUserDetailsSheet(userSheet, report.getUserReport(), headerStyle, dateStyle);
            
            workbook.write(baos);
            return baos.toByteArray();
            
        } catch (IOException e) {
            throw new RuntimeException("Eroare la generarea Excel", e);
        }
    }
    
    private void createSalesDetailsSheet(Sheet sheet, SalesReportDto salesReport, CellStyle headerStyle, CellStyle currencyStyle) {
        int rowNum = 0;
        
        // Headers
        Row headerRow = sheet.createRow(rowNum++);
        String[] headers = {"Data", "Nr. Vânzări", "Venituri"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        // Data
        for (DailySalesDto dailySale : salesReport.getDailySales()) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(dailySale.getDate().toString());
            row.createCell(1).setCellValue(dailySale.getSalesCount());
            Cell revenueCell = row.createCell(2);
            revenueCell.setCellValue(dailySale.getRevenue().doubleValue());
            revenueCell.setCellStyle(currencyStyle);
        }
        
        // Auto-size columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }
    
    private void createTopProductsSheet(Sheet sheet, List<ProductSalesDto> products, CellStyle headerStyle, CellStyle currencyStyle) {
        int rowNum = 0;
        
        // Headers
        Row headerRow = sheet.createRow(rowNum++);
        String[] headers = {"Produs", "Categorie", "Cantitate Vândută", "Venituri", "Stoc Curent"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        // Data
        for (ProductSalesDto product : products) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(product.getProductName());
            row.createCell(1).setCellValue(product.getCategory());
            row.createCell(2).setCellValue(product.getQuantitySold());
            Cell revenueCell = row.createCell(3);
            revenueCell.setCellValue(product.getRevenue().doubleValue());
            revenueCell.setCellStyle(currencyStyle);
            row.createCell(4).setCellValue(product.getCurrentStock());
        }
        
        // Auto-size columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }
    
    private void createStockDetailsSheet(Sheet sheet, StockReportDto stockReport, CellStyle headerStyle, CellStyle currencyStyle) {
        int rowNum = 0;
        
        // Low Stock Products Section
        Row lowStockHeader = sheet.createRow(rowNum++);
        lowStockHeader.createCell(0).setCellValue("PRODUSE CU STOC REDUS");
        lowStockHeader.getCell(0).setCellStyle(headerStyle);
        rowNum++;
        
        if (!stockReport.getLowStockProducts().isEmpty()) {
            // Headers
            Row headerRow = sheet.createRow(rowNum++);
            String[] headers = {"Produs", "Categorie", "Stoc", "Preț", "Valoare Stoc"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Data
            for (StockItemDto item : stockReport.getLowStockProducts()) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(item.getProductName());
                row.createCell(1).setCellValue(item.getCategory());
                row.createCell(2).setCellValue(item.getCurrentStock());
                Cell priceCell = row.createCell(3);
                priceCell.setCellValue(item.getPrice().doubleValue());
                priceCell.setCellStyle(currencyStyle);
                Cell valueCell = row.createCell(4);
                valueCell.setCellValue(item.getStockValue().doubleValue());
                valueCell.setCellStyle(currencyStyle);
            }
        }
        
        rowNum += 2; // Empty rows
        
        // Out of Stock Products Section
        Row outOfStockHeader = sheet.createRow(rowNum++);
        outOfStockHeader.createCell(0).setCellValue("PRODUSE FĂRĂ STOC");
        outOfStockHeader.getCell(0).setCellStyle(headerStyle);
        rowNum++;
        
        if (!stockReport.getOutOfStockProducts().isEmpty()) {
            // Headers
            Row headerRow = sheet.createRow(rowNum++);
            String[] headers = {"Produs", "Categorie", "Preț"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Data
            for (StockItemDto item : stockReport.getOutOfStockProducts()) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(item.getProductName());
                row.createCell(1).setCellValue(item.getCategory());
                Cell priceCell = row.createCell(2);
                priceCell.setCellValue(item.getPrice().doubleValue());
                priceCell.setCellStyle(currencyStyle);
            }
        }
        
        // Auto-size columns
        for (int i = 0; i < 5; i++) {
            sheet.autoSizeColumn(i);
        }
    }
    
    private void createUserDetailsSheet(Sheet sheet, UserReportDto userReport, CellStyle headerStyle, CellStyle dateStyle) {
        int rowNum = 0;
        
        // Summary
        Row summaryHeader = sheet.createRow(rowNum++);
        summaryHeader.createCell(0).setCellValue("REZUMAT UTILIZATORI");
        summaryHeader.getCell(0).setCellStyle(headerStyle);
        rowNum++;
        
        Row totalUsersRow = sheet.createRow(rowNum++);
        totalUsersRow.createCell(0).setCellValue("Total Utilizatori:");
        totalUsersRow.createCell(1).setCellValue(userReport.getTotalUsers());
        
        Row activeUsersRow = sheet.createRow(rowNum++);
        activeUsersRow.createCell(0).setCellValue("Utilizatori Activi:");
        activeUsersRow.createCell(1).setCellValue(userReport.getActiveUsers());
        
        Row newUsersRow = sheet.createRow(rowNum++);
        newUsersRow.createCell(0).setCellValue("Utilizatori Noi (luna aceasta):");
        newUsersRow.createCell(1).setCellValue(userReport.getNewUsersThisMonth());
        
        rowNum += 2; // Empty rows
        
        // Users by Role
        Row rolesHeader = sheet.createRow(rowNum++);
        rolesHeader.createCell(0).setCellValue("UTILIZATORI PE ROLURI");
        rolesHeader.getCell(0).setCellStyle(headerStyle);
        rowNum++;
        
        for (UserRoleCountDto roleCount : userReport.getUsersByRole()) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(roleCount.getRole());
            row.createCell(1).setCellValue(roleCount.getCount());
        }
        
        // Auto-size columns
        for (int i = 0; i < 4; i++) {
            sheet.autoSizeColumn(i);
        }
    }
    
    // --- PDF HELPER METHODS ---
    private com.itextpdf.layout.element.Cell createCell(String content, PdfFont font) {
        return new com.itextpdf.layout.element.Cell().add(new Paragraph(content).setFont(font));
    }
    
    private com.itextpdf.layout.element.Cell createHeaderCell(String content, PdfFont font) {
        return new com.itextpdf.layout.element.Cell()
            .add(new Paragraph(content).setFont(font))
            .setBackgroundColor(ColorConstants.LIGHT_GRAY);
    }
    
    private String formatCurrency(BigDecimal amount) {
        return String.format("RON %.2f", amount);
    }
    
    // Helper methods for Excel styles
    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }
    
    private CellStyle createTitleStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 16);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        return style;
    }
    
    private CellStyle createCurrencyStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("RON #,##0.00"));
        return style;
    }
    
    private CellStyle createDateStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("dd/mm/yyyy"));
        return style;
    }
}