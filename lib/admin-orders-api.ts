import { authFetch, NetworkError, SessionExpiredError } from "@/lib/auth-session";
import { API_BASE_URL } from "@/lib/api-config";
import type {
  OrderItem,
  OrderRecord,
  OrderStatusHistoryEntry,
  OrderStatusHistoryUser,
  OrdersSummary,
  OrderStatus,
  OrderStatusFilter,
  PaymentStatus,
  PaymentStatusFilter,
} from "@/components/manager/orders/types";

type ApiRecord = Record<string, unknown>;

export class AdminOrdersApiError extends Error {
  constructor(message = "Unable to load orders. Please try again.") {
    super(message);
    this.name = "AdminOrdersApiError";
  }
}

function isRecord(value: unknown): value is ApiRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = "") {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return fallback;
}

function asNullableString(value: unknown): string | null {
  return typeof value === "string" && value ? value : null;
}

function asNumber(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

function normalizeOrderStatus(value: unknown): OrderStatus {
  const status = asString(value).toLowerCase();

  if (
    status === "pending" ||
    status === "accepted" ||
    status === "preparing" ||
    status === "ready" ||
    status === "delivered"
  ) {
    return status;
  }

  return "pending";
}

function normalizePaymentStatus(value: unknown): PaymentStatus {
  const status = asString(value).toLowerCase();

  if (
    status === "paid" ||
    status === "unpaid" ||
    status === "failed" ||
    status === "refunded"
  ) {
    return status;
  }

  return "unpaid";
}

function unwrapPayload(payload: unknown) {
  if (isRecord(payload) && isRecord(payload.data)) {
    return payload.data;
  }

  return payload;
}

function getOrdersArray(payload: unknown): unknown[] {
  const data = unwrapPayload(payload);

  if (Array.isArray(data)) {
    return data;
  }

  if (!isRecord(data)) {
    return [];
  }

  for (const key of ["orders", "items", "results", "rows"]) {
    if (Array.isArray(data[key])) {
      return data[key] as unknown[];
    }
  }

  return [];
}

function getOrderRecord(payload: unknown): ApiRecord {
  const data = unwrapPayload(payload);

  if (!isRecord(data)) {
    return {};
  }

  for (const key of ["order", "customerOrder", "customer_order"]) {
    if (isRecord(data[key])) {
      return data[key] as ApiRecord;
    }
  }

  return data;
}

function mapOrderItem(payload: unknown): OrderItem {
  const item = isRecord(payload) ? payload : {};
  const quantity = asNumber(item.quantity, 0);
  const unitPrice = asNumber(item.unit_price ?? item.unitPrice, 0);

  return {
    id: asString(item.id ?? item.order_item_id ?? item.orderItemId),
    menu_item_id: asString(item.menu_item_id ?? item.menuItemId),
    name: asString(item.food_name ?? item.foodName ?? item.name, "Item"),
    serving_size: asString(item.serving_size ?? item.servingSize),
    quantity,
    unit_price: unitPrice,
    line_total: asNumber(item.line_total ?? item.lineTotal, unitPrice * quantity),
    prep_time_min: asNumber(
      item.prep_time_min ?? item.prepTimeMin ?? item.prepTime,
      0,
    ),
    note: asString(item.item_note ?? item.itemNote ?? item.note),
  };
}

function mapStatusHistoryUser(payload: unknown): OrderStatusHistoryUser | null {
  if (!isRecord(payload)) {
    return null;
  }

  const id = asString(payload.id ?? payload.userId ?? payload.user_id);
  const name = asString(
    payload.name ?? payload.fullName ?? payload.full_name ?? payload.contactPersonName ?? payload.contact_person_name,
  );
  const role = asString(payload.role);
  const email = asNullableString(payload.email);

  if (!id && !name && !role && !email) {
    return null;
  }

  return {
    id,
    name,
    role,
    email,
  };
}

function mapStatusHistoryEntry(payload: unknown): OrderStatusHistoryEntry | null {
  if (!isRecord(payload)) {
    return null;
  }

  const status = asString(
    payload.status ?? payload.orderStatus ?? payload.order_status,
  ).toLowerCase();
  const changedAt = asString(
    payload.changedAt ??
      payload.changed_at ??
      payload.createdAt ??
      payload.created_at ??
      payload.updatedAt ??
      payload.updated_at,
  );

  if (!status || !changedAt) {
    return null;
  }

  const changedBy = mapStatusHistoryUser(
    payload.changedBy ?? payload.changed_by ?? payload.user ?? payload.changedByUser ?? payload.changed_by_user,
  );

  return {
    id: asNullableString(payload.id ?? payload.historyId ?? payload.history_id),
    status,
    changedAt,
    changedById: asNullableString(
      payload.changedById ?? payload.changed_by_id ?? payload.userId ?? payload.user_id,
    ),
    changedByRole: asNullableString(
      payload.changedByRole ?? payload.changed_by_role ?? payload.role,
    ),
    changedBy,
  };
}

function getStatusHistoryArray(order: ApiRecord) {
  const rawHistory =
    order.statusHistory ??
    order.status_history ??
    order.orderStatusHistory ??
    order.order_status_history ??
    order.history;

  return Array.isArray(rawHistory) ? rawHistory : [];
}

export function mapAdminOrder(payload: unknown): OrderRecord {
  const order = getOrderRecord(payload);
  const rawItems = Array.isArray(order.items)
    ? order.items
    : Array.isArray(order.order_items)
      ? order.order_items
      : Array.isArray(order.orderItems)
        ? order.orderItems
        : [];
  const id = asString(order.id ?? order.order_id ?? order.orderId);

  return {
    id,
    order_number: asString(
      order.order_number ?? order.orderNumber ?? order.number,
      id,
    ),
    table_id: asString(order.table_id ?? order.tableId, "N/A") || "N/A",
    customer_name: asString(order.customer_name ?? order.customerName),
    customer_phone: asString(order.customer_phone ?? order.customerPhone),
    placed_at: asString(
      order.placed_at ?? order.placedAt ?? order.created_at ?? order.createdAt,
    ),
    updated_at: asString(order.updated_at ?? order.updatedAt),
    pendingAt: asNullableString(order.pending_at ?? order.pendingAt ?? order.placed_at ?? order.placedAt ?? order.created_at ?? order.createdAt),
    acceptedAt: asNullableString(order.accepted_at ?? order.acceptedAt),
    preparingAt: asNullableString(order.preparing_at ?? order.preparingAt),
    readyAt: asNullableString(order.ready_at ?? order.readyAt),
    deliveredAt: asNullableString(order.delivered_at ?? order.deliveredAt),
    order_type: asString(order.order_type ?? order.orderType),
    order_status: normalizeOrderStatus(
      order.order_status ?? order.orderStatus ?? order.status,
    ),
    payment_status: normalizePaymentStatus(
      order.payment_status ?? order.paymentStatus,
    ),
    item_note: asString(order.item_note ?? order.itemNote ?? order.note),
    subtotal: asNumber(order.subtotal ?? order.sub_total ?? order.subTotal),
    tax_amount: asNumber(order.tax_amount ?? order.taxAmount),
    service_charge_amount: asNumber(
      order.service_charge_amount ?? order.serviceChargeAmount,
    ),
    discount_amount: asNumber(order.discount_amount ?? order.discountAmount),
    total_amount: asNumber(order.total_amount ?? order.totalAmount ?? order.total),
    items: rawItems.map(mapOrderItem),
    statusHistory: getStatusHistoryArray(order)
      .map(mapStatusHistoryEntry)
      .filter((entry): entry is OrderStatusHistoryEntry => Boolean(entry)),
  };
}

function getSummary(payload: unknown, orders: OrderRecord[]): OrdersSummary {
  const data = unwrapPayload(payload);
  const summary = isRecord(data) && isRecord(data.summary) ? data.summary : {};
  const activeOrders = orders.filter(
    (order) =>
      order.order_status === "accepted" ||
      order.order_status === "pending" ||
      order.order_status === "preparing" ||
      order.order_status === "ready",
  );
  const pendingOrders = orders.filter((order) => order.payment_status === "unpaid");
  const today = new Date().toDateString();
  const deliveredToday = orders.filter(
    (order) =>
      order.order_status === "delivered" &&
      new Date(order.placed_at).toDateString() === today,
  );

  return {
    totalOrders: asNumber(
      summary.total_orders ?? summary.totalOrders,
      orders.length,
    ),
    pendingPayments: asNumber(
      summary.pending_payments ?? summary.pendingPayments,
      pendingOrders.length,
    ),
    activeOrders: asNumber(
      summary.active_orders ?? summary.activeOrders,
      activeOrders.length,
    ),
    deliveredToday: asNumber(
      summary.delivered_today ?? summary.deliveredToday,
      deliveredToday.length,
    ),
    pendingAmount: asNumber(
      summary.pending_amount ??
        summary.pendingAmount ??
        summary.pending_payment_amount ??
        summary.pendingPaymentAmount,
      pendingOrders.reduce((total, order) => total + order.total_amount, 0),
    ),
  };
}

async function readJson(response: Response) {
  const text = await response.text();
  return text ? (JSON.parse(text) as unknown) : null;
}

function mapApiError(error: unknown) {
  if (error instanceof SessionExpiredError) {
    return error;
  }

  if (error instanceof NetworkError) {
    return new AdminOrdersApiError();
  }

  if (error instanceof Error) {
    return new AdminOrdersApiError(error.message || undefined);
  }

  return new AdminOrdersApiError();
}

export async function fetchAdminOrders(filters: {
  search?: string;
  paymentStatus?: PaymentStatusFilter;
  orderStatus?: OrderStatusFilter;
}) {
  const query = new URLSearchParams();

  if (filters.search?.trim()) {
    query.set("search", filters.search.trim());
  }

  if (filters.paymentStatus && filters.paymentStatus !== "All Payments") {
    query.set("paymentStatus", filters.paymentStatus);
  }

  if (filters.orderStatus && filters.orderStatus !== "All Statuses") {
    query.set("orderStatus", filters.orderStatus);
  }

  const url = `${API_BASE_URL}/admin/orders${query.toString() ? `?${query}` : ""}`;

  try {
    const response = await authFetch(url, { cache: "no-store" });
    const data = await readJson(response);

    if (!response.ok) {
      const message =
        isRecord(data) && (data.message || data.error)
          ? String(data.message ?? data.error)
          : "Backend rejected the order status update.";
      throw new AdminOrdersApiError(message);
    }

    const orders = getOrdersArray(data).map(mapAdminOrder);
    return {
      orders,
      summary: getSummary(data, orders),
    };
  } catch (error) {
    throw mapApiError(error);
  }
}

export async function fetchAdminOrder(orderId: string) {
  try {
    const response = await authFetch(
      `${API_BASE_URL}/admin/orders/${encodeURIComponent(orderId)}`,
      { cache: "no-store" },
    );
    const data = await readJson(response);

    if (!response.ok) {
      throw new AdminOrdersApiError();
    }

    return mapAdminOrder(data);
  } catch (error) {
    throw mapApiError(error);
  }
}

export async function updateAdminOrderStatus(
  orderId: string,
  orderStatus: OrderStatus,
) {
  try {
    const response = await authFetch(
      `${API_BASE_URL}/admin/orders/${encodeURIComponent(orderId)}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ order_status: orderStatus }),
      },
    );
    const data = await readJson(response);

    if (!response.ok) {
      throw new AdminOrdersApiError();
    }

    return mapAdminOrder(data);
  } catch (error) {
    throw mapApiError(error);
  }
}
