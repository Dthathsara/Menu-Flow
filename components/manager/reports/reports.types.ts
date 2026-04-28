export interface ReportStat {
  label: string;
  value: string;
  helperText: string;
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
