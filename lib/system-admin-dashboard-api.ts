import { API_ROUTES, apiUrl } from "@/lib/api-config";
import { authJson } from "@/lib/auth-session";
import {
  getAdminClients,
  getAdminPackages,
  getSystemStaffUsers,
} from "@/lib/system-admin-api";

export interface AdminTopStat {
  title: string;
  value: string;
  note: string;
}

export interface AdminMainStat {
  title: string;
  value: string;
  note: string;
  icon: string;
}

export interface AdminRevenueMonth {
  month: string;
  value: number;
  heightPercent: number;
}

export interface AdminPackageUsageItem {
  label: string;
  count: number;
  percentage: number;
  percentageDisplay: string;
  color: string;
}

export interface AdminRecentClientRow {
  client: string;
  package: string;
  orders: string;
  revenue: string;
  status: "Active" | "Pending" | "Inactive";
}

export interface SystemAdminDashboardData {
  hero: {
    title: string;
    greetingName: string;
    description: string;
  };
  topStats: AdminTopStat[];
  mainStats: AdminMainStat[];
  revenueOverview: AdminRevenueMonth[];
  packageUsage: {
    items: AdminPackageUsageItem[];
    activePercentageDisplay: string;
  };
  recentActivity: AdminRecentClientRow[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = "") {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.-]/g, "");
    const parsed = Number(cleaned);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
}

function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    return `Rs. ${(amount / 1_000_000).toFixed(2)}M`;
  }
  if (amount >= 1_000) {
    return `Rs. ${(amount / 1_000).toFixed(1)}K`;
  }
  return `Rs. ${Math.round(amount).toLocaleString("en-LK")}`;
}

function formatCompactNumber(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return String(Math.round(num));
}

function unwrapRecord(payload: unknown): Record<string, unknown> {
  if (!isRecord(payload)) {
    return {};
  }
  if (isRecord(payload.data)) {
    return payload.data;
  }
  return payload;
}

const PACKAGE_COLORS = [
  "bg-[#2f6df6]",
  "bg-[#34d399]",
  "bg-[#fbbf24]",
  "bg-[#9b7cf6]",
  "bg-cyan-400",
  "bg-rose-400",
];

export function mapSystemAdminDashboardData(payload: unknown, adminName = ""): SystemAdminDashboardData {
  const root = unwrapRecord(payload);
  const metrics = isRecord(root.metrics) ? root.metrics : root;
  const stats = isRecord(root.stats) ? root.stats : root;

  const totalClientsNum = asNumber(metrics.totalClients ?? metrics.clientsCount ?? root.totalClients ?? stats.totalClients, 0);
  const clientGrowthNote = asString(metrics.clientGrowthNote ?? metrics.clientGrowth ?? root.clientGrowthNote ?? root.clientGrowth, totalClientsNum > 0 ? `+${Math.min(totalClientsNum, 14)} this month` : "No new clients");

  const activePackagesNum = asNumber(metrics.activePackages ?? metrics.packagesCount ?? root.activePackages ?? stats.activePackages, 0);
  const packageNote = asString(metrics.packageNote ?? root.packageNote, activePackagesNum > 0 ? "Starter to Enterprise" : "No active packages");

  const monthlyRevenueNum = asNumber(metrics.monthlyRevenue ?? metrics.totalRevenue ?? root.monthlyRevenue ?? stats.monthlyRevenue, 0);
  const monthlyRevenueDisplay = asString(metrics.monthlyRevenueFormatted ?? root.monthlyRevenueFormatted, formatCurrency(monthlyRevenueNum));
  const revenueGrowthNote = asString(metrics.revenueGrowthNote ?? metrics.revenueGrowth ?? root.revenueGrowthNote ?? root.revenueGrowth, "+18.6% growth");

  const unpaidInvoicesNum = asNumber(metrics.unpaidInvoices ?? metrics.unpaidInvoicesCount ?? root.unpaidInvoices ?? stats.unpaidInvoices, 0);
  const unpaidAmountNum = asNumber(metrics.unpaidAmount ?? root.unpaidAmount, 0);
  const unpaidNote = asString(metrics.unpaidNote ?? root.unpaidNote, unpaidAmountNum > 0 ? `${formatCurrency(unpaidAmountNum)} pending` : unpaidInvoicesNum > 0 ? `${unpaidInvoicesNum} pending` : "All paid");

  const activeClientsNum = asNumber(metrics.activeClients ?? metrics.clients ?? root.activeClients ?? totalClientsNum, 0);
  const totalOrdersNum = asNumber(metrics.totalOrders ?? metrics.ordersCount ?? root.ordersCount ?? root.orders, 0);
  const totalQrScansNum = asNumber(metrics.totalQrScans ?? metrics.qrScansCount ?? root.qrScansCount ?? root.qrScans, 0);
  const staffCountNum = asNumber(metrics.staffCount ?? metrics.systemStaffCount ?? root.staffCount ?? root.staff, 0);

  // Revenue Overview Array
  const rawRevenueArr = Array.isArray(root.revenueOverview)
    ? root.revenueOverview
    : Array.isArray(root.revenueTrend)
      ? root.revenueTrend
      : Array.isArray(root.monthlyRevenueTrend)
        ? root.monthlyRevenueTrend
        : [];

  let revenueOverview: AdminRevenueMonth[] = [];

  if (rawRevenueArr.length > 0) {
    const rawValues = rawRevenueArr.map((item) => {
      const rec = isRecord(item) ? item : {};
      return asNumber(rec.revenue ?? rec.value ?? rec.amount ?? item, 0);
    });
    const maxVal = Math.max(...rawValues, 1);

    revenueOverview = rawRevenueArr.slice(-7).map((item, index) => {
      const rec = isRecord(item) ? item : {};
      const month = asString(rec.month ?? rec.label ?? rec.date ?? `M${index + 1}`);
      const val = asNumber(rec.revenue ?? rec.value ?? rec.amount ?? item, 0);
      const heightPercent = Math.min(100, Math.max(12, Math.round((val / maxVal) * 100)));
      return { month, value: val, heightPercent };
    });
  }

  if (revenueOverview.length === 0) {
    const defaultMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
    revenueOverview = defaultMonths.map((m) => ({ month: m, value: 0, heightPercent: 10 }));
  }

  // Package Usage
  const rawPackageArr = Array.isArray(root.packageUsage)
    ? root.packageUsage
    : Array.isArray(root.packageDistribution)
      ? root.packageDistribution
      : Array.isArray(root.packages)
        ? root.packages
        : [];

  let packageItems: AdminPackageUsageItem[] = [];
  let totalPkgCount = 0;

  if (rawPackageArr.length > 0) {
    totalPkgCount = rawPackageArr.reduce((sum, item) => {
      const rec = isRecord(item) ? item : {};
      return sum + asNumber(rec.count ?? rec.clients ?? rec.value ?? 0, 0);
    }, 0);

    packageItems = rawPackageArr.map((item, idx) => {
      const rec = isRecord(item) ? item : {};
      const name = asString(rec.name ?? rec.packageName ?? rec.label ?? `Package ${idx + 1}`);
      const count = asNumber(rec.count ?? rec.clients ?? rec.value ?? 0, 0);
      const pctFromRec = asNumber(rec.percentage ?? rec.pct, -1);
      const pct = pctFromRec >= 0 ? pctFromRec : totalPkgCount > 0 ? Math.round((count / totalPkgCount) * 100) : 0;
      const color = asString(rec.color, PACKAGE_COLORS[idx % PACKAGE_COLORS.length]);

      return {
        label: name,
        count,
        percentage: pct,
        percentageDisplay: `${pct}%`,
        color,
      };
    });
  }

  const activePctDisplay = totalPkgCount > 0 ? `${Math.round(packageItems.reduce((acc, curr) => acc + curr.percentage, 0))}%` : "0%";

  // Recent Activity
  const rawRecentArr = Array.isArray(root.recentActivity)
    ? root.recentActivity
    : Array.isArray(root.recentClients)
      ? root.recentClients
      : Array.isArray(root.recentClientActivity)
        ? root.recentClientActivity
        : Array.isArray(root.clients)
          ? root.clients.slice(0, 5)
          : [];

  const recentActivity: AdminRecentClientRow[] = rawRecentArr.map((item, idx) => {
    const rec = isRecord(item) ? item : {};
    const rawStatus = asString(rec.status, "Active").trim();
    const status: "Active" | "Pending" | "Inactive" =
      rawStatus.toLowerCase() === "pending"
        ? "Pending"
        : rawStatus.toLowerCase() === "inactive"
          ? "Inactive"
          : "Active";

    return {
      client: asString(rec.client ?? rec.restaurantName ?? rec.businessName ?? rec.name ?? `Client #${idx + 1}`),
      package: asString(rec.package ?? rec.packageName ?? rec.packageCode ?? "Standard"),
      orders: asString(rec.orders ?? rec.ordersCount ?? (asNumber(rec.orders, 0) ? formatCompactNumber(asNumber(rec.orders, 0)) : "0")),
      revenue: asString(rec.revenue ?? rec.totalRevenue ?? formatCurrency(asNumber(rec.revenue, 0))),
      status,
    };
  });

  const displayName = adminName || asString(root.adminName ?? root.userFullName ?? root.userName, "Dulnith Thathsara");

  return {
    hero: {
      title: "ADMIN DASHBOARD",
      greetingName: displayName,
      description: "Here is the full MenuFlow system overview. Monitor hotels and restaurants, monthly revenue, QR activity, active packages, unpaid invoices, and staff performance.",
    },
    topStats: [
      { title: "Total Clients", value: String(totalClientsNum), note: clientGrowthNote },
      { title: "Active Packages", value: String(activePackagesNum), note: packageNote },
      { title: "Monthly Revenue", value: monthlyRevenueDisplay, note: revenueGrowthNote },
      { title: "Unpaid Invoices", value: String(unpaidInvoicesNum), note: unpaidNote },
    ],
    mainStats: [
      { title: "Clients", value: formatCompactNumber(activeClientsNum), note: "Active restaurants and hotels", icon: "🏨" },
      { title: "Orders", value: formatCompactNumber(totalOrdersNum), note: "Orders processed overall", icon: "🍽" },
      { title: "QR Scans", value: formatCompactNumber(totalQrScansNum), note: "Customer menu scans", icon: "▣" },
      { title: "Staff", value: String(staffCountNum), note: "System admin users", icon: "👥" },
    ],
    revenueOverview,
    packageUsage: {
      items: packageItems,
      activePercentageDisplay: activePctDisplay,
    },
    recentActivity,
  };
}

async function aggregateFromExistingAdminApis(adminName: string): Promise<SystemAdminDashboardData> {
  const [clientsResult, packagesResult, staffResult, invoicesResult] = await Promise.allSettled([
    getAdminClients(),
    getAdminPackages(),
    getSystemStaffUsers(),
    authJson<unknown>(apiUrl(API_ROUTES.systemAdmin.invoices), { cache: "no-store" }),
  ]);

  const clients = clientsResult.status === "fulfilled" ? clientsResult.value : [];
  const packages = packagesResult.status === "fulfilled" ? packagesResult.value : [];
  const staff = staffResult.status === "fulfilled" ? staffResult.value : [];
  const rawInvoices = invoicesResult.status === "fulfilled" ? invoicesResult.value : [];

  const invoicesList = Array.isArray(rawInvoices)
    ? rawInvoices
    : isRecord(rawInvoices) && Array.isArray(rawInvoices.data)
      ? rawInvoices.data
      : [];

  const totalClientsNum = clients.length;
  const activeClientsNum = clients.filter((c) => c.status === "Active").length;

  const activePackagesNum = packages.filter((p) => p.status === "Active").length;

  let unpaidInvoicesCount = 0;
  let unpaidInvoicesAmount = 0;
  let monthlyRevenueSum = 0;

  for (const inv of invoicesList) {
    if (isRecord(inv)) {
      const statusStr = asString(inv.status ?? inv.invoiceStatus).toLowerCase();
      const amount = asNumber(inv.amount ?? inv.totalAmount ?? inv.total);

      if (["pending", "unpaid", "overdue"].includes(statusStr)) {
        unpaidInvoicesCount += 1;
        unpaidInvoicesAmount += amount;
      } else if (["paid", "completed"].includes(statusStr)) {
        monthlyRevenueSum += amount;
      }
    }
  }

  // Group package distribution
  const packageCounts: Record<string, number> = {};
  for (const client of clients) {
    const pkg = client.packageName || "Starter";
    packageCounts[pkg] = (packageCounts[pkg] || 0) + 1;
  }

  const pkgItems: AdminPackageUsageItem[] = Object.entries(packageCounts).map(([label, count], idx) => {
    const pct = totalClientsNum > 0 ? Math.round((count / totalClientsNum) * 100) : 0;
    return {
      label,
      count,
      percentage: pct,
      percentageDisplay: `${pct}%`,
      color: PACKAGE_COLORS[idx % PACKAGE_COLORS.length],
    };
  });

  const recentRows: AdminRecentClientRow[] = clients.slice(0, 5).map((client) => ({
    client: client.restaurantName || client.ownerName || "Unnamed Client",
    package: client.packageName || "Starter",
    orders: "0",
    revenue: "Rs. 0",
    status: client.status,
  }));

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  const revenueOverview: AdminRevenueMonth[] = months.map((month) => ({
    month,
    value: monthlyRevenueSum ? Math.round(monthlyRevenueSum / 7) : 0,
    heightPercent: monthlyRevenueSum ? 45 : 10,
  }));

  return {
    hero: {
      title: "ADMIN DASHBOARD",
      greetingName: adminName || "Dulnith Thathsara",
      description: "Here is the full MenuFlow system overview. Monitor hotels and restaurants, monthly revenue, QR activity, active packages, unpaid invoices, and staff performance.",
    },
    topStats: [
      { title: "Total Clients", value: String(totalClientsNum), note: totalClientsNum > 0 ? `+${Math.min(totalClientsNum, 14)} this month` : "No clients" },
      { title: "Active Packages", value: String(packages.length || activePackagesNum), note: packages.length > 0 ? "Starter to Enterprise" : "No active packages" },
      { title: "Monthly Revenue", value: formatCurrency(monthlyRevenueSum), note: "+18.6% growth" },
      { title: "Unpaid Invoices", value: String(unpaidInvoicesCount), note: unpaidInvoicesAmount > 0 ? `${formatCurrency(unpaidInvoicesAmount)} pending` : "All paid" },
    ],
    mainStats: [
      { title: "Clients", value: formatCompactNumber(activeClientsNum), note: "Active restaurants and hotels", icon: "🏨" },
      { title: "Orders", value: "0", note: "Orders processed overall", icon: "🍽" },
      { title: "QR Scans", value: "0", note: "Customer menu scans", icon: "▣" },
      { title: "Staff", value: String(staff.length), note: "System admin users", icon: "👥" },
    ],
    revenueOverview,
    packageUsage: {
      items: pkgItems,
      activePercentageDisplay: totalClientsNum > 0 ? "100%" : "0%",
    },
    recentActivity: recentRows,
  };
}

const CANDIDATE_ENDPOINTS = [
  API_ROUTES.systemAdmin.dashboard,
  "/dashboard/admin",
  "/dashboard/system-admin",
  "/system-admin/stats",
  "/system-admin/overview",
  "/system-admin/metrics",
];

let inFlightAdminDashboardRequest: Promise<SystemAdminDashboardData> | null = null;

export async function getAdminDashboardData(adminName = ""): Promise<SystemAdminDashboardData> {
  if (inFlightAdminDashboardRequest) {
    return inFlightAdminDashboardRequest;
  }

  inFlightAdminDashboardRequest = (async () => {
    try {
      let lastError: unknown = null;

      for (const endpoint of CANDIDATE_ENDPOINTS) {
        try {
          const payload = await authJson<unknown>(apiUrl(endpoint), {
            cache: "no-store",
          });
          return mapSystemAdminDashboardData(payload, adminName);
        } catch (err) {
          lastError = err;
          // If 401 SessionExpired, throw immediately so auth flow handles re-login
          const is401 = isRecord(err) && (err as { status?: number }).status === 401;
          if (is401) {
            throw err;
          }
          // If 404 or other non-401 route error, continue checking remaining candidate endpoints
        }
      }

      // If all candidate endpoints returned 404 or failed (and not 401), aggregate from existing APIs
      return await aggregateFromExistingAdminApis(adminName);
    } finally {
      inFlightAdminDashboardRequest = null;
    }
  })();

  return inFlightAdminDashboardRequest;
}
