import { authJson } from "@/lib/auth-session";
import { API_ROUTES, apiUrl } from "@/lib/api-config";
import type {
  WaiterNotification,
  WaiterOrder,
  WaiterOrderItem,
  WaiterOrderStatus,
  WaiterPaymentStatus,
  WaiterTable,
  WaiterTableStatus,
} from "@/components/waiter/types";

type ApiRecord = Record<string, unknown>;

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

function asNumber(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function unwrapList(payload: unknown, keys: string[]) {
  const data = isRecord(payload) && isRecord(payload.data) ? payload.data : payload;

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

function unwrapRecord(payload: unknown, keys: string[]) {
  const data = isRecord(payload) && isRecord(payload.data) ? payload.data : payload;

  if (!isRecord(data)) {
    return {};
  }

  for (const key of keys) {
    if (isRecord(data[key])) {
      return data[key] as ApiRecord;
    }
  }

  return data;
}

function getStoredWaiterScope() {
  if (typeof window === "undefined") {
    return { restaurantId: "", branchId: "", tenantId: "", waiterId: "", waiterName: "" };
  }

  try {
    const user = JSON.parse(window.localStorage.getItem("user") || "null");
    const record = isRecord(user) ? user : {};

    return {
      waiterId: asString(record.id ?? record.userId ?? record.user_id ?? record.waiterId ?? record.waiter_id).trim(),
      waiterName: asString(record.name ?? record.fullName ?? record.full_name).trim(),
      restaurantId: asString(
        record.restaurantId ??
          record.restaurant_id ??
          record.tenantId ??
          record.tenant_id,
      ).trim(),
      branchId: asString(record.branchId ?? record.branch_id).trim(),
      tenantId: asString(
        record.tenantId ??
          record.tenant_id ??
          record.restaurantId ??
          record.restaurant_id,
      ).trim(),
    };
  } catch {
    return { restaurantId: "", branchId: "", tenantId: "", waiterId: "", waiterName: "" };
  }
}

export function getStoredWaiterIdentity() {
  const scope = getStoredWaiterScope();
  return { waiterId: scope.waiterId, waiterName: scope.waiterName };
}

function waiterScopedUrl(path: string) {
  const scope = getStoredWaiterScope();
  const query = new URLSearchParams();

  if (scope.restaurantId) {
    query.set("restaurantId", scope.restaurantId);
  }

  if (scope.branchId) {
    query.set("branchId", scope.branchId);
  }

  if (scope.tenantId) {
    query.set("tenantId", scope.tenantId);
  }

  const queryString = query.toString();
  return apiUrl(`${path}${queryString ? `?${queryString}` : ""}`);
}

function normalizeOrderStatus(value: unknown): WaiterOrderStatus {
  const status = asString(value).toLowerCase();

  if (status === "pending" || status === "accepted" || status === "preparing" || status === "ready" || status === "delivered") {
    return status;
  }

  if (status === "served") {
    return "delivered";
  }

  return "pending";
}

function normalizePaymentStatus(value: unknown): WaiterPaymentStatus {
  const status = asString(value).toLowerCase();

  if (status === "paid" || status === "unpaid" || status === "pending" || status === "failed") {
    return status;
  }

  return "unpaid";
}

function normalizeTableStatus(value: unknown): WaiterTableStatus {
  const status = asString(value).toLowerCase();

  if (
    status === "available" ||
    status === "occupied" ||
    status === "preparing" ||
    status === "ready" ||
    status === "reserved"
  ) {
    return status;
  }

  return "available";
}

function mapOrderItem(payload: unknown): WaiterOrderItem {
  const item = isRecord(payload) ? payload : {};

  return {
    name: asString(item.name ?? item.foodName ?? item.food_name, "Item"),
    quantity: asNumber(item.quantity, 1),
    note: asString(item.note ?? item.itemNote ?? item.item_note),
  };
}

function mapChefSummary(payload: unknown) {
  const chef = isRecord(payload) ? payload : null;

  if (!chef) {
    return null;
  }

  const id = asString(chef.id ?? chef.chefId ?? chef.chef_id);
  const name = asString(chef.name ?? chef.fullName ?? chef.full_name ?? chef.email);

  if (!id && !name) {
    return null;
  }

  return {
    id,
    name,
    email: asString(chef.email),
  };
}

export function mapWaiterOrder(payload: unknown): WaiterOrder {
  const order = isRecord(payload) ? payload : {};
  const id = asString(order.id ?? order.orderId ?? order.order_id);
  const items = Array.isArray(order.items)
    ? order.items
    : Array.isArray(order.orderItems)
      ? order.orderItems
      : Array.isArray(order.order_items)
        ? order.order_items
        : [];

  return {
    id,
    orderNumber: asString(order.orderNumber ?? order.order_number ?? order.number, id),
    table: asString(order.table ?? order.tableNumber ?? order.table_id, "Table"),
    customer: asString(order.customer ?? order.customerName ?? order.customer_name, "Guest"),
    items: items.map(mapOrderItem),
    notes: asString(order.notes ?? order.note ?? order.item_note),
    status: normalizeOrderStatus(order.status ?? order.orderStatus ?? order.order_status),
    time: asString(order.time ?? order.placedAt ?? order.placed_at ?? order.createdAt ?? order.created_at),
    paymentStatus: normalizePaymentStatus(order.paymentStatus ?? order.payment_status),
    waiterId: asString(
      order.waiterId ??
        order.waiter_id ??
        order.acceptedByWaiterId ??
        order.accepted_by_waiter_id ??
        order.acceptedBy ??
        order.accepted_by ??
        order.assignedWaiterId ??
        order.assigned_waiter_id,
    ),
    waiterName: asString(
      order.waiterName ??
        order.waiter_name ??
        order.acceptedByName ??
        order.accepted_by_name ??
        order.assignedWaiterName ??
        order.assigned_waiter_name,
    ),
    assignedChefId: asString(order.assignedChefId ?? order.assigned_chef_id) || null,
    assignedChef: mapChefSummary(order.assignedChef ?? order.assigned_chef),
    preparingAt: asString(order.preparingAt ?? order.preparing_at) || null,
    readyAt: asString(order.readyAt ?? order.ready_at) || null,
    deliveredAt: asString(order.deliveredAt ?? order.delivered_at) || null,
  };
}

export function mapWaiterTable(payload: unknown): WaiterTable {
  const table = isRecord(payload) ? payload : {};
  const currentOrder = unwrapRecord(table.currentOrder ?? table.current_order, []);
  const tableNumber = asString(
    table.tableNumber ?? table.table_number ?? table.name ?? table.id,
  );
  const id = asString(table.id ?? table.tableId ?? table.table_id, tableNumber);

  return {
    id,
    name: asString(table.name ?? tableNumber, id || "Table"),
    seats: asNumber(table.seats ?? table.capacity, 4),
    status: normalizeTableStatus(table.status ?? table.currentStatus ?? table.current_status),
    currentOrderId: asString(
      table.currentOrderId ??
        table.current_order_id ??
        table.orderId ??
        table.order_id ??
        currentOrder.id,
    ),
    customer: asString(
      table.customer ??
        table.customerName ??
        table.customer_name ??
        currentOrder.customer_name ??
        currentOrder.customerName,
    ),
  };
}

export function mapWaiterNotification(payload: unknown): WaiterNotification {
  const notification = isRecord(payload) ? payload : {};
  const id = asString(notification.id ?? notification.notificationId ?? notification.notification_id);

  return {
    id,
    title: asString(notification.title, "Notification"),
    message: asString(notification.message ?? notification.body),
    time: asString(notification.time ?? notification.createdAt ?? notification.created_at),
    read: Boolean(notification.read ?? notification.isRead ?? notification.is_read),
  };
}

export async function fetchWaiterOrders() {
  const payload = await authJson<unknown>(waiterScopedUrl(API_ROUTES.waiter.orders), { cache: "no-store" });
  return unwrapList(payload, ["orders", "items", "rows"]).map(mapWaiterOrder);
}

export async function fetchWaiterMyOrders() {
  const payload = await authJson<unknown>(waiterScopedUrl(API_ROUTES.waiter.myOrders), { cache: "no-store" });
  return unwrapList(payload, ["orders", "items", "rows"]).map(mapWaiterOrder);
}

export async function fetchWaiterTables() {
  const payload = await authJson<unknown>(waiterScopedUrl(API_ROUTES.waiter.tables), { cache: "no-store" });
  return unwrapList(payload, ["tables", "items", "rows"]).map(mapWaiterTable);
}

export async function fetchWaiterNotifications() {
  const payload = await authJson<unknown>(waiterScopedUrl(API_ROUTES.waiter.notifications), { cache: "no-store" });
  return unwrapList(payload, ["notifications", "items", "rows"]).map(mapWaiterNotification);
}

export async function updateWaiterOrderStatus(orderId: string, status: WaiterOrderStatus) {
  const scope = getStoredWaiterScope();
  const payload = await authJson<unknown>(
    waiterScopedUrl(API_ROUTES.waiter.orderStatus(orderId)),
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order_status: status,
        orderStatus: status,
      }),
    },
  );

  const mapped = mapWaiterOrder(isRecord(payload) && isRecord(payload.data) ? payload.data : payload);
  return status === "accepted" && !mapped.waiterId
    ? { ...mapped, waiterId: scope.waiterId, waiterName: scope.waiterName }
    : mapped;
}
