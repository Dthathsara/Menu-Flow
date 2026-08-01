import { API_BASE_URL } from "@/lib/api-config";
import {
  ApiResponseError,
  authFetch,
  NetworkError,
  SessionExpiredError,
} from "@/lib/auth-session";
import type {
  UserReportActivitySummary,
  UserReportFilters,
  UserReportPerformanceRow,
  UserReportResponse,
  UserReportRoleBreakdownMetric,
  UsersReportStatsData,
} from "@/components/manager/reports/reports.types";

type ApiRecord = Record<string, unknown>;

export class ManagerUserReportsApiError extends Error {
  constructor(message = "Unable to load users report. Please try again.") {
    super(message);
    this.name = "ManagerUserReportsApiError";
  }
}

let userReportsSyncPromise: Promise<void> | null = null;
let userReportsSyncCompleted = false;

function isRecord(value: unknown): value is ApiRecord {
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

function asNumber(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^\d.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

function unwrapPayload(payload: unknown) {
  if (isRecord(payload) && "data" in payload) {
    return payload.data;
  }

  return payload;
}

function unwrapList(payload: unknown, keys: string[]) {
  const data = unwrapPayload(payload);

  if (Array.isArray(data)) {
    return data;
  }

  if (!isRecord(data)) {
    return [];
  }

  for (const key of keys) {
    if (Array.isArray(data[key])) {
      return data[key] as unknown[];
    }
  }

  return [];
}

async function readJson(response: Response) {
  const text = await response.text();
  return text ? (JSON.parse(text) as unknown) : null;
}

function extractApiMessage(payload: unknown): string {
  if (typeof payload === "string") {
    return payload;
  }

  if (Array.isArray(payload)) {
    return payload.map(extractApiMessage).filter(Boolean).join("\n");
  }

  if (!isRecord(payload)) {
    return "";
  }

  return (
    extractApiMessage(payload.message) ||
    extractApiMessage(payload.error) ||
    extractApiMessage(payload.errors)
  );
}

function mapApiError(error: unknown, fallback?: string) {
  if (error instanceof SessionExpiredError) {
    return error;
  }

  if (error instanceof NetworkError) {
    return new ManagerUserReportsApiError(
      "Unable to connect to the server. Please make sure the backend is running.",
    );
  }

  if (error instanceof ApiResponseError) {
    return new ManagerUserReportsApiError(
      extractApiMessage(error.response.data) || error.message || fallback,
    );
  }

  if (error instanceof ManagerUserReportsApiError) {
    return error;
  }

  if (error instanceof Error) {
    return new ManagerUserReportsApiError(error.message || fallback);
  }

  return new ManagerUserReportsApiError(fallback);
}

function isAlreadyExistingReportSyncError(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";
  const normalized = message.toLowerCase();

  return (
    (normalized.includes("already") && normalized.includes("report")) ||
    normalized.includes("unique constraint") ||
    normalized.includes("p2002")
  );
}

async function requestUserReport(path: string, init: RequestInit = {}) {
  try {
    const response = await authFetch(`${API_BASE_URL}${path}`, {
      cache: "no-store",
      ...init,
      headers: init.headers,
    });
    const data = await readJson(response);

    if (!response.ok) {
      throw new ApiResponseError(
        extractApiMessage(data) || "Users report request failed.",
        response,
        data,
        `${API_BASE_URL}${path}`,
      );
    }

    return data;
  } catch (error) {
    throw mapApiError(error);
  }
}

function buildQuery(filters?: { search?: string; role?: string; period?: string }) {
  const query = new URLSearchParams();

  if (filters?.search?.trim()) {
    query.set("search", filters.search.trim());
  }

  if (filters?.role && filters.role !== "all") {
    query.set("role", filters.role);
  }

  if (filters?.period && filters.period !== "all") {
    query.set("period", filters.period);
  }

  return query.toString();
}

function formatCurrency(value: number) {
  return `Rs. ${value.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })}`;
}

function mapStats(payload: unknown): UsersReportStatsData {
  const stats = isRecord(payload) ? payload : {};

  return {
    totalStaff: asNumber(stats.totalStaff ?? stats.total_staff),
    waiterOrders: asNumber(stats.waiterOrders ?? stats.waiter_orders),
    staffRevenue: asNumber(stats.staffRevenue ?? stats.staff_revenue),
    activeShifts: asNumber(stats.activeShifts ?? stats.active_shifts),
  };
}

function mapRow(payload: unknown): UserReportPerformanceRow {
  const row = isRecord(payload) ? payload : {};
  const revenue = asNumber(row.revenue ?? row.staffRevenue ?? row.staff_revenue);
  const id = asString(row.id ?? row.reportId ?? row.report_id);

  return {
    id: id || asString(row.staffMemberId ?? row.staff_member_id ?? row.staff, "row"),
    staffMemberId:
      asString(row.staffMemberId ?? row.staff_member_id).trim() || null,
    staff: asString(row.staff ?? row.staffName ?? row.staff_name, "Unknown staff"),
    role: asString(row.role, "Staff"),
    orders: asNumber(row.orders ?? row.orderCount ?? row.order_count),
    revenue,
    revenueLabel: asString(row.revenueLabel ?? row.revenue_label, formatCurrency(revenue)),
    tables: asNumber(row.tables ?? row.tableCount ?? row.table_count),
    periodKey: asString(row.periodKey ?? row.period_key ?? row.period, "all"),
    periodLabel: asString(row.periodLabel ?? row.period_label ?? row.period, "All Periods"),
  };
}

function mapActivity(payload: unknown): UserReportActivitySummary {
  const activity = isRecord(payload) ? payload : {};

  function mapItem(key: string, fallbackValue: string) {
    const item = isRecord(activity[key]) ? activity[key] : {};

    return {
      value: asString(item.value, fallbackValue),
      helperText: asString(item.helperText ?? item.helper_text),
    };
  }

  return {
    mostActiveWaiter: mapItem("mostActiveWaiter", "No data"),
    highestRevenueHandled: mapItem("highestRevenueHandled", "Rs. 0"),
    mostTablesServed: mapItem("mostTablesServed", "0 tables"),
    averageOrdersPerWaiter: mapItem("averageOrdersPerWaiter", "0"),
  };
}

function mapRoleBreakdown(payload: unknown): UserReportRoleBreakdownMetric {
  const item = isRecord(payload) ? payload : {};
  const count = asNumber(item.count);
  const value = asNumber(item.value, count);

  return {
    role: asString(item.role, "Staff"),
    count,
    value,
    max: Math.max(asNumber(item.max, value), 1),
  };
}

function mapFilters(payload: unknown, rows: UserReportPerformanceRow[]): UserReportFilters {
  const filters = isRecord(payload) ? payload : {};
  const roles = Array.isArray(filters.roles)
    ? filters.roles.map((role) => asString(role).trim()).filter(Boolean)
    : rows.map((row) => row.role).filter(Boolean);
  const periods = Array.isArray(filters.periods)
    ? filters.periods.map((period) => {
        const item = isRecord(period) ? period : {};
        return {
          key: asString(item.key ?? item.value),
          label: asString(item.label ?? item.key ?? item.value),
        };
      }).filter((period) => period.key && period.label)
    : Array.from(
        new Map(
          rows.map((row) => [
            row.periodKey,
            { key: row.periodKey, label: row.periodLabel },
          ]),
        ).values(),
      );

  return {
    roles: Array.from(new Set(roles)).sort((a, b) => a.localeCompare(b)),
    periods,
  };
}

function mapReport(payload: unknown): UserReportResponse {
  const data = unwrapPayload(payload);
  const record = isRecord(data) ? data : {};
  const rows = unwrapList(record.rows ?? record.performanceRows ?? record.performance_rows, [
    "rows",
    "items",
    "results",
  ]).map(mapRow);
  const waiterPerformance = unwrapList(
    record.waiterPerformance ?? record.waiter_performance,
    ["waiterPerformance", "waiter_performance", "rows", "items"],
  ).map(mapRow);

  return {
    stats: mapStats(record.stats ?? record.summary),
    rows,
    waiterPerformance,
    activitySummary: mapActivity(record.activitySummary ?? record.activity_summary),
    roleBreakdown: unwrapList(record.roleBreakdown ?? record.role_breakdown, [
      "roleBreakdown",
      "role_breakdown",
      "items",
    ]).map(mapRoleBreakdown),
    filters: mapFilters(record.filters, rows),
  };
}

export async function fetchUserReport(filters?: {
  search?: string;
  role?: string;
  period?: string;
}): Promise<UserReportResponse> {
  const query = buildQuery(filters);
  return mapReport(await requestUserReport(`/reports/users${query ? `?${query}` : ""}`));
}

export async function fetchUserReportFilters(): Promise<UserReportFilters> {
  const payload = unwrapPayload(await requestUserReport("/reports/users/filters"));
  return mapFilters(payload, []);
}

export async function syncUserReports(options: { force?: boolean } = {}): Promise<void> {
  if (userReportsSyncCompleted && !options.force) {
    return;
  }

  if (userReportsSyncPromise) {
    return userReportsSyncPromise;
  }

  const syncPromise = requestUserReport("/reports/users/sync", { method: "POST" })
    .then(() => {
      userReportsSyncCompleted = true;
    })
    .catch((error) => {
      if (isAlreadyExistingReportSyncError(error)) {
        userReportsSyncCompleted = true;
        return;
      }

      throw error;
    })
    .finally(() => {
      if (userReportsSyncPromise === syncPromise) {
        userReportsSyncPromise = null;
      }
    });

  userReportsSyncPromise = syncPromise;
  return syncPromise;
}

export async function fetchUserReportExport(filters?: {
  search?: string;
  role?: string;
  period?: string;
}): Promise<UserReportResponse> {
  const query = buildQuery(filters);
  return mapReport(await requestUserReport(`/reports/users/export${query ? `?${query}` : ""}`));
}
