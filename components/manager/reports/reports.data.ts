import type {
  PaymentSummaryMetric,
  ProgressMetric,
  QrUsageRow,
  ReportStat,
  SalesTrendPoint,
  StaffActivitySummaryItem,
  StaffRoleBreakdownMetric,
  TopSellingItemRow,
  WaiterPerformanceRow,
} from "./reports.types";

export const usersReportDescription =
  "Track staff service activity, waiter performance, role workload, revenue handled by users, and operational contribution across the restaurant.";

export const ordersReportDescription =
  "Track monthly orders, revenue, QR usage by table, payment performance, top-selling menu items, and peak ordering hours from one professional reporting dashboard.";

export const userReportStats: ReportStat[] = [
  {
    label: "TOTAL STAFF",
    value: "24",
    helperText: "Active staff members across restaurant operations.",
    accent: "blue",
  },
  {
    label: "WAITER ORDERS",
    value: "106",
    helperText: "Orders served by waiter staff during the selected period.",
    accent: "amber",
  },
  {
    label: "STAFF REVENUE",
    value: "Rs. 315,220",
    helperText: "Revenue handled by assigned restaurant staff.",
    accent: "purple",
  },
  {
    label: "ACTIVE SHIFTS",
    value: "18",
    helperText: "Currently tracked active or completed staff shifts.",
    accent: "green",
  },
];

export const waiterPerformanceRows: WaiterPerformanceRow[] = [
  {
    staff: "Kavindu Peris",
    role: "Waiter",
    orders: "42",
    revenue: "Rs. 96,400",
    tables: "14",
  },
  {
    staff: "Sachini Gunawardena",
    role: "Waiter",
    orders: "36",
    revenue: "Rs. 84,720",
    tables: "11",
  },
  {
    staff: "Rashmi De Alwis",
    role: "Counter",
    orders: "28",
    revenue: "Rs. 61,300",
    tables: "9",
  },
  {
    staff: "Nuwan Jayasuriya",
    role: "Chef",
    orders: "22",
    revenue: "Rs. 48,900",
    tables: "6",
  },
  {
    staff: "Ishara Fernando",
    role: "Counter",
    orders: "19",
    revenue: "Rs. 42,750",
    tables: "5",
  },
];

export const staffRoleBreakdown: StaffRoleBreakdownMetric[] = [
  { role: "Waiter", count: "12", value: 12, max: 12, tone: "blue" },
  { role: "Chef", count: "7", value: 7, max: 12, tone: "purple" },
  { role: "Counter", count: "5", value: 5, max: 12, tone: "cyan" },
];

export const staffActivitySummary: StaffActivitySummaryItem[] = [
  {
    label: "Most Active Waiter",
    value: "Kavindu Peris",
    helperText: "Handled 42 completed and active orders in the selected period.",
  },
  {
    label: "Highest Revenue Handled",
    value: "Rs. 96,400",
    helperText: "Top contributing staff revenue assigned during the reporting window.",
  },
  {
    label: "Most Tables Served",
    value: "14 tables",
    helperText: "Maximum table coverage recorded by a single staff member.",
  },
  {
    label: "Average Orders Per Waiter",
    value: "39",
    helperText: "Average order volume processed by waiter staff this cycle.",
  },
];

export const orderReportStats: ReportStat[] = [
  {
    label: "TOTAL MONTHLY ORDERS",
    value: "186",
    helperText: "Orders placed within the selected reporting period.",
    accent: "blue",
  },
  {
    label: "REVENUE",
    value: "Rs. 482,600",
    helperText: "Gross revenue generated from completed and active orders.",
    accent: "purple",
  },
  {
    label: "QR SCANS",
    value: "214",
    helperText: "Total QR scans captured across tracked tables and sessions.",
    accent: "amber",
  },
  {
    label: "PENDING PAYMENTS",
    value: "Rs. 24,176",
    helperText: "Open payment amount awaiting collection or settlement.",
    accent: "red",
  },
];

export const monthlySalesData: SalesTrendPoint[] = [
  { month: "Jan", amountLabel: "Rs. 78k", value: 78 },
  { month: "Feb", amountLabel: "Rs. 96k", value: 96 },
  { month: "Mar", amountLabel: "Rs. 89k", value: 89 },
  { month: "Apr", amountLabel: "Rs. 113k", value: 113 },
  { month: "May", amountLabel: "Rs. 106k", value: 106 },
  { month: "Jun", amountLabel: "Rs. 118k", value: 118 },
];

export const paymentSummaryData: PaymentSummaryMetric[] = [
  {
    label: "COLLECTED REVENUE",
    value: "Rs. 458,424",
    helperText: "Paid and confirmed order value collected in the selected period.",
  },
  {
    label: "TAX COLLECTED",
    value: "Rs. 22,960",
    helperText: "Tax total derived from all orders in the current report window.",
  },
  {
    label: "SERVICE CHARGES",
    value: "Rs. 18,442",
    helperText: "Service charge contribution included in overall order billing.",
  },
];

export const peakHoursData: ProgressMetric[] = [
  {
    label: "12:00 PM - 1:00 PM",
    valueLabel: "84 orders",
    value: 84,
    max: 90,
    tone: "blue",
  },
  {
    label: "7:00 PM - 8:00 PM",
    valueLabel: "73 orders",
    value: 73,
    max: 90,
    tone: "purple",
  },
  {
    label: "1:00 PM - 2:00 PM",
    valueLabel: "66 orders",
    value: 66,
    max: 90,
    tone: "cyan",
  },
  {
    label: "8:00 PM - 9:00 PM",
    valueLabel: "49 orders",
    value: 49,
    max: 90,
    tone: "orange",
  },
];

export const qrUsageRows: QrUsageRow[] = [
  { table: "T-01", scansPerDay: "18", orders: "11", conversion: "61%" },
  { table: "T-05", scansPerDay: "23", orders: "15", conversion: "65%" },
  { table: "T-08", scansPerDay: "29", orders: "19", conversion: "66%" },
  { table: "T-12", scansPerDay: "14", orders: "8", conversion: "57%" },
];

export const topSellingItems: TopSellingItemRow[] = [
  { item: "Seafood Kottu", quantity: "74", revenue: "Rs. 107,300" },
  { item: "Chicken Fried Rice", quantity: "61", revenue: "Rs. 86,540" },
  { item: "Lime Soda", quantity: "118", revenue: "Rs. 44,200" },
  { item: "Grilled Chicken Bowl", quantity: "53", revenue: "Rs. 91,870" },
];

export const orderStatusMix: ProgressMetric[] = [
  { label: "Accepted", valueLabel: "38", value: 38, max: 60, tone: "blue" },
  { label: "Preparing", valueLabel: "26", value: 26, max: 60, tone: "orange" },
  { label: "Ready", valueLabel: "12", value: 12, max: 60, tone: "purple" },
  { label: "Delivered", valueLabel: "54", value: 54, max: 60, tone: "teal" },
];
