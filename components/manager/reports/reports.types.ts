import type { SummaryCardAccent } from "@/components/common/SummaryCard";

export interface ReportStat {
  label: string;
  value: string;
  helperText: string;
  accent: SummaryCardAccent;
}

export type ReportTab = "users" | "orders";

export interface SalesTrendPoint {
  month: string;
  amountLabel: string;
  value: number;
}

export interface PaymentSummaryMetric {
  label: string;
  value: string;
  helperText: string;
}

export type ReportStaffRole = "Waiter" | "Counter" | "Chef";

export interface WaiterPerformanceRow {
  staff: string;
  role: ReportStaffRole;
  orders: string;
  revenue: string;
  tables: string;
}

export interface StaffRoleBreakdownMetric {
  role: Exclude<ReportStaffRole, "Counter"> | "Counter";
  count: string;
  value: number;
  max: number;
  tone: ProgressMetric["tone"];
}

export interface StaffActivitySummaryItem {
  label: string;
  value: string;
  helperText: string;
}

export interface ProgressMetric {
  label: string;
  valueLabel: string;
  value: number;
  max: number;
  tone: "blue" | "purple" | "cyan" | "orange" | "teal";
}

export interface QrUsageRow {
  table: string;
  scansPerDay: string;
  orders: string;
  conversion: string;
}

export interface TopSellingItemRow {
  item: string;
  quantity: string;
  revenue: string;
}

export interface UsersReportStatsData {
  totalStaff: number;
  waiterOrders: number;
  staffRevenue: number;
  activeShifts: number;
}

export interface UserReportPerformanceRow {
  id: string;
  staffMemberId: string | null;
  staff: string;
  role: string;
  orders: number;
  revenue: number;
  revenueLabel: string;
  tables: number;
  periodKey: string;
  periodLabel: string;
}

export interface UserReportActivitySummary {
  mostActiveWaiter: {
    value: string;
    helperText: string;
  };
  highestRevenueHandled: {
    value: string;
    helperText: string;
  };
  mostTablesServed: {
    value: string;
    helperText: string;
  };
  averageOrdersPerWaiter: {
    value: string;
    helperText: string;
  };
}

export interface UserReportRoleBreakdownMetric {
  role: string;
  count: number;
  value: number;
  max: number;
}

export interface UserReportFilters {
  roles: string[];
  periods: Array<{
    key: string;
    label: string;
  }>;
}

export interface UserReportResponse {
  stats: UsersReportStatsData;
  rows: UserReportPerformanceRow[];
  waiterPerformance: UserReportPerformanceRow[];
  activitySummary: UserReportActivitySummary;
  roleBreakdown: UserReportRoleBreakdownMetric[];
  filters: UserReportFilters;
}

export interface OrdersReportPeriod {
  key: string;
  label: string;
  from: string;
  to: string;
}

export interface OrdersReportStatsData {
  totalMonthlyOrders: number;
  revenue: number;
  qrScans: number;
  pendingPayments: number;
}

export interface OrdersReportPaymentSummary {
  collectedRevenue: number;
  taxCollected: number;
  serviceCharges: number;
}

export interface OrdersReportSalesPoint {
  label: string;
  amountLabel: string;
  value: number;
}

export interface OrdersReportProgressMetric {
  label: string;
  valueLabel: string;
  value: number;
  max: number;
  tone: ProgressMetric["tone"];
}

export interface OrdersReportQrUsageRow {
  table: string;
  scansPerDay: number;
  orders: number;
  conversion: string;
}

export interface OrdersReportTopSellingItem {
  item: string;
  quantity: number;
  revenue: number;
  revenueLabel: string;
}

export interface OrdersReportResponse {
  period: OrdersReportPeriod;
  stats: OrdersReportStatsData;
  paymentSummary: OrdersReportPaymentSummary;
  salesOverview: OrdersReportSalesPoint[];
  peakHours: OrdersReportProgressMetric[];
  qrUsage: OrdersReportQrUsageRow[];
  topSellingItems: OrdersReportTopSellingItem[];
  orderStatusMix: OrdersReportProgressMetric[];
}
