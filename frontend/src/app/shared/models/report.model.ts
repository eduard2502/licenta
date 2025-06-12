export interface SalesReport {
  totalSales: number;
  totalRevenue: number;
  periodStart: Date;
  periodEnd: Date;
  dailySales: DailySales[];
  topSellingProducts: ProductSales[];
  categorySales: CategorySales[];
}

export interface DailySales {
  date: string;
  salesCount: number;
  revenue: number;
}

export interface ProductSales {
  productId: number;
  productName: string;
  category: string;
  quantitySold: number;
  revenue: number;
  currentStock: number;
}

export interface CategorySales {
  category: string;
  quantitySold: number;
  revenue: number;
}

export interface StockReport {
  totalProducts: number;
  totalStockValue: number;
  lowStockProducts: StockItem[];
  outOfStockProducts: StockItem[];
  categoryStock: CategoryStock[];
}

export interface StockItem {
  productId: number;
  productName: string;
  category: string;
  currentStock: number;
  price: number;
  stockValue: number;
}

export interface CategoryStock {
  category: string;
  totalProducts: number;
  totalStock: number;
  stockValue: number;
}

export interface UserReport {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  usersByRole: UserRoleCount[];
  recentRegistrations: UserInfo[];
}

export interface UserRoleCount {
  role: string;
  count: number;
}

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  registrationDate: Date;
  lastLoginDate: Date;
  isActive: boolean;
}

export interface GeneralReport {
  generatedAt: Date;
  reportPeriod: ReportPeriod;
  salesReport: SalesReport;
  stockReport: StockReport;
  userReport: UserReport;
}

export interface ReportPeriod {
  startDate: Date;
  endDate: Date;
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
}