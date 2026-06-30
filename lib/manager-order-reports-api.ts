import { API_BASE_URL } from "@/lib/api-config";
import {
  ApiResponseError,
  authFetch,
  NetworkError,
  SessionExpiredError,
} from "@/lib/auth-session";
import type {
  OrdersReportPaymentSummary,
  OrdersReportPeriod,
  OrdersReportProgressMetric,
  OrdersReportQrUsageRow,
  OrdersReportResponse,
  OrdersReportSalesPoint,
  OrdersReportStatsData,
  OrdersReportTopSellingItem,
  ProgressMetric,
} from "@/components/manager/reports/reports.types";

type ApiRecord = Record<string, unknown>;

export class ManagerOrderReportsApiError extends Error {
  constructor(message = "Unable to load orders report. Please try again.") {
    super(message);
    this.name = "ManagerOrderReportsApiError";
  }
}

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

function asList(value: unknown): unknown[] {
  const data = unwrapPayload(value);
  return Array.isArray(data) ? data : [];
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
    return new ManagerOrderReportsApiError(
      "Unable to connect to the server. Please make sure the backend is running.",
    );
  }

  if (error instanceof ApiResponseError) {
    return new ManagerOrderReportsApiError(
      extractApiMessage(error.response.data) || error.message || fallback,
    );
  }

  if (error instanceof ManagerOrderReportsApiError) {
    return error;
  }

  if (error instanceof Error) {
    return new ManagerOrderReportsApiError(error.message || fallback);
  }

  return new ManagerOrderReportsApiError(fallback);
}

async function requestOrderReport(path: string, init: RequestInit = {}) {
  try {
    const response = await authFetch(`${API_BASE_URL}${path}`, {
      cache: "no-store",
      ...init,
      headers: init.headers,
    });
    const data = await readJson(response);

    if (!response.ok) {
      throw new ApiResponseError(
        extractApiMessage(data) || "Orders report request failed.",
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

function formatCurrency(value: number) {
  return `Rs. ${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function mapPeriod(payload: unknown): OrdersReportPeriod {
  const period = isRecord(payload) ? payload : {};

  return {
    key: asString(period.key, "current"),
    label: asString(period.label ?? period.name, "Current Period"),
    from: asString(period.from ?? period.startDate ?? period.start_date),
    to: asString(period.to ?? period.endDate ?? period.end_date),
  };
}

function mapStats(payload: unknown): OrdersReportStatsData {
  const stats = isRecord(payload) ? payload : {};

  return {
    totalMonthlyOrders: asNumber(stats.totalMonthlyOrders ?? stats.total_monthly_orders),
    revenue: asNumber(stats.revenue),
    qrScans: asNumber(stats.qrScans ?? stats.qr_scans),
    pendingPayments: asNumber(stats.pendingPayments ?? stats.pending_payments),
  };
}

function mapPaymentSummary(payload: unknown): OrdersReportPaymentSummary {
  const summary = isRecord(payload) ? payload : {};

  return {
    collectedRevenue: asNumber(summary.collectedRevenue ?? summary.collected_revenue),
    taxCollected: asNumber(summary.taxCollected ?? summary.tax_collected),
    serviceCharges: asNumber(summary.serviceCharges ?? summary.service_charges),
  };
}

function mapSalesPoint(payload: unknown): OrdersReportSalesPoint {
  const point = isRecord(payload) ? payload : {};
  const value = asNumber(point.value ?? point.amount ?? point.revenue);

  return {
    label: asString(point.label ?? point.month ?? point.date, "Period"),
    amountLabel: asString(point.amountLabel ?? point.amount_label, formatCurrency(value)),
    value,
  };
}

function mapTone(value: unknown, fallback: ProgressMetric["tone"]): ProgressMetric["tone"] {
  const tone = asString(value);

  if (tone === "blue" || tone === "purple" || tone === "cyan" || tone === "orange" || tone === "teal") {
    return tone;
  }

  return fallback;
}

function mapProgressMetric(payload: unknown, fallbackTone: ProgressMetric["tone"]): OrdersReportProgressMetric {
  const item = isRecord(payload) ? payload : {};
  const value = asNumber(item.value ?? item.count ?? item.orders);

  return {
    label: asString(item.label ?? item.hour ?? item.status, "No data"),
    valueLabel: asString(item.valueLabel ?? item.value_label, String(value)),
    value,
    max: Math.max(asNumber(item.max, value), 1),
    tone: mapTone(item.tone, fallbackTone),
  };
}

function mapQrUsage(payload: unknown): OrdersReportQrUsageRow {
  const row = isRecord(payload) ? payload : {};
  const scans = asNumber(row.scansPerDay ?? row.scans_per_day ?? row.scans);
  const orders = asNumber(row.orders ?? row.orderCount ?? row.order_count);
  const conversion = asNumber(row.conversion);

  return {
    table: asString(row.table ?? row.tableNumber ?? row.table_number, "Table"),
    scansPerDay: scans,
    orders,
    conversion: asString(
      row.conversionLabel ?? row.conversion_label,
      row.conversion === undefined ? "0%" : `${conversion}%`,
    ),
  };
}

function mapTopSellingItem(payload: unknown): OrdersReportTopSellingItem {
  const row = isRecord(payload) ? payload : {};
  const revenue = asNumber(row.revenue);

  return {
    item: asString(row.item ?? row.name ?? row.menuItem ?? row.menu_item, "Item"),
    quantity: asNumber(row.quantity ?? row.qty),
    revenue,
    revenueLabel: asString(row.revenueLabel ?? row.revenue_label, formatCurrency(revenue)),
  };
}

function mapReport(payload: unknown): OrdersReportResponse {
  const data = unwrapPayload(payload);
  const record = isRecord(data) ? data : {};

  return {
    period: mapPeriod(record.period),
    stats: mapStats(record.stats),
    paymentSummary: mapPaymentSummary(record.paymentSummary ?? record.payment_summary),
    salesOverview: asList(record.salesOverview ?? record.sales_overview).map(mapSalesPoint),
    peakHours: asList(record.peakHours ?? record.peak_hours).map((item) => mapProgressMetric(item, "blue")),
    qrUsage: asList(record.qrUsage ?? record.qr_usage).map(mapQrUsage),
    topSellingItems: asList(record.topSellingItems ?? record.top_selling_items).map(mapTopSellingItem),
    orderStatusMix: asList(record.orderStatusMix ?? record.order_status_mix).map((item) => mapProgressMetric(item, "teal")),
  };
}

export async function fetchOrdersReport(): Promise<OrdersReportResponse> {
  return mapReport(await requestOrderReport("/reports/orders"));
}

export async function syncOrdersReport(): Promise<void> {
  await requestOrderReport("/reports/orders/sync", { method: "POST" });
}

export async function fetchOrdersReportExport(): Promise<OrdersReportResponse> {
  return mapReport(await requestOrderReport("/reports/orders/export"));
}
