package com.magazincomputere.magazin_api.service;

import com.magazincomputere.magazin_api.dto.report.*;
import com.magazincomputere.magazin_api.model.*;
import com.magazincomputere.magazin_api.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
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

    // Metode pentru generare PDF și Excel - placeholder-uri
    public byte[] generatePdfReport(LocalDate startDate, LocalDate endDate) {
        // TODO: Implementează generarea PDF folosind o bibliotecă precum iText sau Apache PDFBox
        // Pentru moment, returnăm un array gol
        return new byte[0];
    }

    public byte[] generateExcelReport(LocalDate startDate, LocalDate endDate) {
        // TODO: Implementează generarea Excel folosind Apache POI
        // Pentru moment, returnăm un array gol
        return new byte[0];
    }
}