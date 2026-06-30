import { API_BASE_URL } from "@/lib/api-config";
import {
  ApiResponseError,
  authFetch,
  NetworkError,
  SessionExpiredError,
} from "@/lib/auth-session";
import type {
  BillingPageData,
  BillingStatsResponse,
  BillMethod,
  BillMethodFilter,
  BillRecord,
  BillStatus,
  CashierSummaryMetric,
  CreateBillFormValues,
  PaymentMethodSummary,
  ReceiptLineItem,
  RefundReason,
} from "@/components/manager/billing/billing.types";
import { formatCurrency } from "@/components/manager/billing/billing.helpers";

type ApiRecord = Record<string, unknown>;

export class ManagerBillingApiError extends Error {
  constructor(message = "Unable to load billing data. Please try again.") {
    super(message);
    this.name = "ManagerBillingApiError";
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

function unwrapList(payload: unknown): unknown[] {
  const data = unwrapPayload(payload);
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
    return new ManagerBillingApiError(
      "Unable to connect to the server. Please make sure the backend is running.",
    );
  }

  if (error instanceof ApiResponseError) {
    return new ManagerBillingApiError(
      extractApiMessage(error.response.data) || error.message || fallback,
    );
  }

  if (error instanceof ManagerBillingApiError) {
    return error;
  }

  if (error instanceof Error) {
    return new ManagerBillingApiError(error.message || fallback);
  }

  return new ManagerBillingApiError(fallback);
}

async function requestBilling(path: string, init: RequestInit = {}) {
  try {
    const response = await authFetch(`${API_BASE_URL}${path}`, {
      cache: "no-store",
      ...init,
      headers: init.headers,
    });
    const data = await readJson(response);

    if (!response.ok) {
      throw new ApiResponseError(
        extractApiMessage(data) || "Billing request failed.",
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

function normalizeStatus(value: unknown): BillStatus {
  const status = asString(value).toLowerCase();

  if (status === "paid") {
    return "Paid";
  }

  if (status === "refunded") {
    return "Refunded";
  }

  return "Pending";
}

function normalizeMethod(value: unknown): BillMethod {
  const method = asString(value).toLowerCase();

  if (method === "cash") {
    return "Cash";
  }

  if (method === "card") {
    return "Card";
  }

  if (method === "online") {
    return "Online";
  }

  if (method === "pending" || method === "unpaid" || method === "not paid" || !method) {
    return "Pending";
  }

  return "Other";
}

function mapReceiptItem(payload: unknown, index: number): ReceiptLineItem {
  const item = isRecord(payload) ? payload : {};
  const quantity = asNumber(item.quantity ?? item.qty, 1);
  const total = asNumber(item.total ?? item.lineTotal ?? item.line_total);

  return {
    id: asString(item.id, `receipt-item-${index}`),
    name: asString(item.name ?? item.item ?? item.menuItem ?? item.menu_item, "Item"),
    quantity,
    total,
  };
}

export function mapBillingBill(payload: unknown): BillRecord {
  const bill = isRecord(payload) ? payload : {};
  const receipt = isRecord(bill.receipt) ? bill.receipt : {};
  const id = asString(bill.id ?? bill.billId ?? bill.bill_id, `bill-${Date.now()}`);
  const billId = asString(bill.billId ?? bill.bill_id ?? bill.number, id);
  const tableNumber = asString(bill.tableNumber ?? bill.table_number ?? bill.table, "N/A");
  const waiterName = asString(bill.waiterName ?? bill.waiter_name ?? bill.waiter, "Unassigned");
  const total = asNumber(
    bill.totalAmount ?? bill.total_amount ?? bill.total ?? receipt.totalAmount ?? receipt.total_amount ?? receipt.total,
  );
  const items = unwrapList(receipt.items ?? bill.items).map(mapReceiptItem);
  const taxAmount = asNumber(
    receipt.taxAmount ?? receipt.tax_amount ?? bill.taxAmount ?? bill.tax_amount,
  );
  const serviceCharge = asNumber(
    receipt.serviceChargeAmount ??
      receipt.service_charge_amount ??
      receipt.serviceCharge ??
      receipt.service_charge ??
      bill.serviceChargeAmount ??
      bill.service_charge_amount ??
      bill.serviceCharge ??
      bill.service_charge,
  );
  const rawSubtotal = asNumber(receipt.subtotal ?? bill.subtotal);
  const subtotal =
    rawSubtotal > 0 || total <= 0
      ? rawSubtotal
      : Math.max(total - taxAmount - serviceCharge, 0);
  const createdAt = asString(bill.createdAt ?? bill.created_at ?? receipt.issuedOn ?? receipt.issued_on, new Date().toISOString());

  return {
    id,
    billId,
    tableNumber,
    waiterName,
    itemsCount: asNumber(bill.itemsCount ?? bill.items_count, items.length),
    total,
    method: normalizeMethod(bill.method ?? bill.paymentMethod ?? bill.payment_method),
    status: normalizeStatus(bill.status),
    createdAt,
    refundReason: asString(bill.refundReason ?? bill.refund_reason) as RefundReason | undefined,
    receipt: {
      restaurantName: asString(receipt.restaurantName ?? receipt.restaurant_name, "MenuFlow Restaurant"),
      branchName: asString(receipt.branchName ?? receipt.branch_name, "Restaurant Branch"),
      billId,
      tableNumber,
      waiterName,
      issuedOn: asString(receipt.issuedOn ?? receipt.issued_on, createdAt),
      items,
      subtotal,
      taxAmount,
      serviceCharge,
      total,
    },
  };
}

function mapStats(payload: unknown): BillingStatsResponse {
  const stats = isRecord(payload) ? payload : {};

  return {
    todayRevenue: asNumber(stats.todayRevenue ?? stats.today_revenue),
    pendingTables: asNumber(stats.pendingTables ?? stats.pending_tables),
    billsGenerated: asNumber(stats.billsGenerated ?? stats.bills_generated),
    waiterServed: asNumber(stats.waiterServed ?? stats.waiter_served),
    avgBillValue: asNumber(stats.avgBillValue ?? stats.avg_bill_value),
  };
}

function mapCashierSummary(payload: unknown): CashierSummaryMetric[] {
  const summary = isRecord(payload) ? payload : {};

  return [
    {
      label: "COLLECTED TODAY",
      value: formatCurrency(asNumber(summary.collectedToday ?? summary.collected_today)),
      helper: "Confirmed payments from QR table bills.",
    },
    {
      label: "PENDING COLLECTION",
      value: formatCurrency(asNumber(summary.pendingCollection ?? summary.pending_collection)),
      helper: "Bills not fully settled yet.",
    },
    {
      label: "TAX + SERVICE",
      value: formatCurrency(asNumber(summary.taxAndService ?? summary.tax_and_service)),
      helper: "Tax and service contribution included in billing.",
    },
  ];
}

function mapPaymentMethod(payload: unknown): PaymentMethodSummary {
  const method = isRecord(payload) ? payload : {};
  const normalizedMethod = normalizeMethod(method.method ?? method.paymentMethod ?? method.payment_method);

  return {
    method: normalizedMethod,
    label: asString(method.label ?? method.method, normalizedMethod),
    description: asString(method.description, "Payment collection"),
    amount: asNumber(method.amount),
    count: asNumber(method.count ?? method.billCount ?? method.bill_count, 0),
    percent: asNumber(method.percent ?? method.percentage),
    accentClassName: asString(
      method.accentClassName ?? method.accent_class_name,
      getPaymentMethodAccentClassName(normalizedMethod),
    ),
  };
}

function getPaymentMethodAccentClassName(method: BillMethod) {
  if (method === "Cash") {
    return "from-emerald-500 to-teal-400";
  }

  if (method === "Card") {
    return "from-blue-500 to-sky-400";
  }

  if (method === "Online") {
    return "from-violet-500 to-fuchsia-400";
  }

  if (method === "Pending") {
    return "from-amber-500 to-orange-400";
  }

  return "from-slate-500 to-slate-400";
}

function dedupePaymentMethods(methods: PaymentMethodSummary[]) {
  const grouped = new Map<BillMethod, PaymentMethodSummary>();

  for (const method of methods) {
    const existing = grouped.get(method.method);

    if (!existing) {
      grouped.set(method.method, { ...method });
      continue;
    }

    grouped.set(method.method, {
      ...existing,
      amount: existing.amount + method.amount,
      count: (existing.count ?? 0) + (method.count ?? 0),
      percent: existing.percent + method.percent,
    });
  }

  const merged = Array.from(grouped.values());
  const totalAmount = merged.reduce((sum, method) => sum + method.amount, 0);

  return merged.map((method) => ({
    ...method,
    label: method.method,
    percent:
      totalAmount > 0
        ? Math.round((method.amount / totalAmount) * 100)
        : Math.min(Math.round(method.percent), 100),
  }));
}

function mapBillingData(payload: unknown): BillingPageData {
  const data = unwrapPayload(payload);
  const record = isRecord(data) ? data : {};

  return {
    stats: mapStats(record.stats),
    bills: unwrapList(record.bills).map(mapBillingBill),
    cashierSummary: mapCashierSummary(record.cashierSummary ?? record.cashier_summary),
    pendingCollectionQueue: unwrapList(
      record.pendingCollectionQueue ?? record.pending_collection_queue,
    ).map(mapBillingBill),
    paymentMethods: dedupePaymentMethods(
      unwrapList(record.paymentMethods ?? record.payment_methods).map(mapPaymentMethod),
    ),
  };
}

function buildQuery(filters?: {
  search?: string;
  status?: string;
  method?: string;
}) {
  const query = new URLSearchParams();

  if (filters?.search?.trim()) {
    query.set("search", filters.search.trim());
  }

  if (filters?.status && filters.status !== "All Status") {
    query.set("status", filters.status);
  }

  if (filters?.method && filters.method !== "All Methods") {
    query.set("method", filters.method);
  }

  return query.toString();
}

export async function fetchBilling(filters?: {
  search?: string;
  status?: string;
  method?: string;
}): Promise<BillingPageData> {
  const query = buildQuery(filters);
  return mapBillingData(await requestBilling(`/billing${query ? `?${query}` : ""}`));
}

export async function fetchBillingExport(): Promise<BillingPageData> {
  return mapBillingData(await requestBilling("/billing/export"));
}

export async function createBillingBill(values: CreateBillFormValues): Promise<BillRecord> {
  const payload = await requestBilling("/billing", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tableNumber: values.tableNumber.trim(),
      waiterName: values.waiterName.trim(),
      totalAmount: Number(values.totalAmount),
      status: values.status,
    }),
  });

  return mapBillingBill(unwrapPayload(payload));
}

export async function payBillingBill(id: string, method: Exclude<BillMethodFilter, "All Methods">): Promise<void> {
  await requestBilling(`/billing/${encodeURIComponent(id)}/pay`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ method }),
  });
}

export async function refundBillingBill(id: string, reason: RefundReason): Promise<void> {
  await requestBilling(`/billing/${encodeURIComponent(id)}/refund`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refundReason: reason }),
  });
}
