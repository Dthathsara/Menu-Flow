import { API_ROUTES, apiUrl } from "@/lib/api-config";
import { authJson } from "@/lib/auth-session";

type ApiRecord = Record<string, unknown>;

export type DashboardAvailability<T> = {
  available: boolean;
  value: T;
  reason?: string;
};

export type OrderStatusKey =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready"
  | "delivered";

export interface ManagerDashboardSummary {
  managerName: string;
  restaurantName: string;
  branchName: string | null;
  greeting: string;
}

export interface ManagerDashboardMetrics {
  liveOrders: number;
  qrScansToday: number;
  kitchenLoadPercent: number | null;
  customerRating: number | null;
  revenueToday: number;
  totalOrdersToday: number;
  averagePreparationMinutes: number;
  activeQrSessions: number;
}

export interface OrderStatusOverview {
  total: number;
  rows: Array<{
    key: OrderStatusKey;
    label: string;
    count: number;
    percentage: number;
  }>;
}

export interface RevenueTrendPoint {
  date: string;
  label: string;
  revenue: number;
  orders: number;
}

export interface TopSellingItem {
  menuItemId: string | null;
  rank: number;
  name: string;
  quantitySold: number;
  revenue: number;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  tableNumber: string | null;
  customerName: string;
  itemCount: number;
  total: number;
  status: string;
  createdAt: string;
}

export interface QrPerformance {
  available: boolean;
  scansToday: number;
  peakScanWindow: string | null;
  topScannedCategory: string | null;
  activeSessions: number;
  totalRecordedScans: number;
  reason?: string;
}

export interface ManagerNotification {
  type: string;
  title: string;
  description: string;
  createdAt: string;
  entityId: string;
}

export interface BranchSnapshot {
  activeStaff: number;
  kitchenEfficiency: number | null;
  diningCapacityUsed: number | null;
  complaintsLogged: DashboardAvailability<number | null>;
}

export interface ManagerDashboardData {
  summary: ManagerDashboardSummary;
  metrics: ManagerDashboardMetrics;
  orderStatus: OrderStatusOverview;
  revenueTrend: RevenueTrendPoint[];
  topSellingItems: TopSellingItem[];
  recentOrders: RecentOrder[];
  qrPerformance: QrPerformance;
  notifications: ManagerNotification[];
  branchSnapshot: BranchSnapshot;
}

function isRecord(value: unknown): value is ApiRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asRecord(value: unknown): ApiRecord {
  return isRecord(value) ? value : {};
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

function asNullableString(value: unknown): string | null {
  const text = asString(value).trim();
  return text ? text : null;
}

function asNumber(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = asNumber(value, Number.NaN);
  return Number.isFinite(parsed) ? parsed : null;
}

function unwrapRecord(payload: unknown) {
  if (!isRecord(payload)) {
    return {};
  }

  return isRecord(payload.data) ? payload.data : payload;
}

function getLocalGreeting(date = new Date()) {
  const hour = date.getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
}

function mapOrderStatus(status: ApiRecord): OrderStatusOverview {
  const labels: Array<{ key: OrderStatusKey; label: string }> = [
    { key: "pending", label: "Pending" },
    { key: "accepted", label: "Accepted" },
    { key: "preparing", label: "Preparing" },
    { key: "ready", label: "Ready" },
    { key: "delivered", label: "Delivered" },
  ];
  const counts = labels.map((row) => ({
    ...row,
    count: asNumber(status[row.key]),
  }));
  const total = counts.reduce((sum, row) => sum + row.count, 0);

  return {
    total,
    rows: counts.map((row) => ({
      ...row,
      percentage: total ? Math.round((row.count / total) * 100) : 0,
    })),
  };
}

function mapRevenueTrend(value: unknown): RevenueTrendPoint[] {
  return Array.isArray(value)
    ? value.map((item) => {
        const row = asRecord(item);

        return {
          date: asString(row.date),
          label: asString(row.label, asString(row.date)),
          revenue: asNumber(row.revenue),
          orders: asNumber(row.orders),
        };
      })
    : [];
}

function mapTopSellingItems(value: unknown): TopSellingItem[] {
  return Array.isArray(value)
    ? value.map((item, index) => {
        const row = asRecord(item);

        return {
          menuItemId: asNullableString(row.menuItemId),
          rank: index + 1,
          name: asString(row.name, "Unknown item"),
          quantitySold: asNumber(row.quantitySold),
          revenue: asNumber(row.revenue),
        };
      })
    : [];
}

function mapRecentOrders(value: unknown): RecentOrder[] {
  return Array.isArray(value)
    ? value.map((item) => {
        const row = asRecord(item);
        const id = asString(row.id);

        return {
          id,
          orderNumber: asString(row.orderNumber, id),
          tableNumber: asNullableString(row.tableNumber),
          customerName: asString(row.customerName, "Guest"),
          itemCount: asNumber(row.itemCount),
          total: asNumber(row.total),
          status: asString(row.status, "pending"),
          createdAt: asString(row.createdAt),
        };
      })
    : [];
}

function mapNotifications(value: unknown): ManagerNotification[] {
  return Array.isArray(value)
    ? value.map((item) => {
        const row = asRecord(item);

        return {
          type: asString(row.type, "activity"),
          title: asString(row.title, "Dashboard activity"),
          description: asString(row.description),
          createdAt: asString(row.createdAt),
          entityId: asString(row.entityId),
        };
      })
    : [];
}

export function mapManagerDashboard(payload: unknown): ManagerDashboardData {
  const root = unwrapRecord(payload);
  const profile = asRecord(root.profile);
  const metrics = asRecord(root.metrics);
  const qrPerformance = asRecord(root.qrPerformance);
  const branchSnapshot = asRecord(root.branchSnapshot);
  const complaints = asRecord(branchSnapshot.complaintsLogged);

  return {
    summary: {
      managerName: asString(profile.managerName, "Manager"),
      restaurantName: asString(profile.restaurantName, "Restaurant"),
      branchName: asNullableString(profile.branchName),
      greeting: getLocalGreeting(),
    },
    metrics: {
      liveOrders: asNumber(metrics.liveOrders),
      qrScansToday: asNumber(metrics.qrScansToday),
      kitchenLoadPercent: asNullableNumber(metrics.kitchenLoadPercent),
      customerRating: asNullableNumber(metrics.customerRating),
      revenueToday: asNumber(metrics.revenueToday),
      totalOrdersToday: asNumber(metrics.totalOrdersToday),
      averagePreparationMinutes: asNumber(metrics.averagePreparationMinutes),
      activeQrSessions: asNumber(metrics.activeQrSessions),
    },
    orderStatus: mapOrderStatus(asRecord(root.orderStatus)),
    revenueTrend: mapRevenueTrend(root.revenueTrend),
    topSellingItems: mapTopSellingItems(root.topSellingItems),
    recentOrders: mapRecentOrders(root.recentOrders),
    qrPerformance: {
      available: Boolean(qrPerformance.available),
      scansToday: asNumber(qrPerformance.scansToday),
      peakScanWindow: asNullableString(qrPerformance.peakScanWindow),
      topScannedCategory: asNullableString(qrPerformance.topScannedCategory),
      activeSessions: asNumber(qrPerformance.activeSessions),
      totalRecordedScans: asNumber(qrPerformance.totalRecordedScans),
      reason: asNullableString(qrPerformance.reason) ?? undefined,
    },
    notifications: mapNotifications(root.notifications),
    branchSnapshot: {
      activeStaff: asNumber(branchSnapshot.activeStaff),
      kitchenEfficiency: asNullableNumber(branchSnapshot.kitchenEfficiency),
      diningCapacityUsed: asNullableNumber(branchSnapshot.diningCapacityUsed),
      complaintsLogged: {
        available: Boolean(complaints.available),
        value: asNullableNumber(complaints.value),
        reason: asNullableString(complaints.reason) ?? undefined,
      },
    },
  };
}

export async function fetchManagerDashboard(date?: string) {
  const path = date
    ? `${API_ROUTES.managerDashboard.overview}?date=${encodeURIComponent(date)}`
    : API_ROUTES.managerDashboard.overview;
  const payload = await authJson<unknown>(apiUrl(path), { cache: "no-store" });

  return mapManagerDashboard(payload);
}
