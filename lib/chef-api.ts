import { API_ROUTES, apiUrl } from "@/lib/api-config";
import {
  authJson,
  clearAuthSession,
  getStoredAuthUser,
  normalizeAuthUser,
} from "@/lib/auth-session";
import { getImageUrl } from "@/lib/image-url";
import type {
  ChefDashboardSummary,
  ChefMenuCategory,
  ChefMenuItem,
  ChefOrder,
  ChefOrderItem,
  ChefOrderStatus,
  ChefProfile,
  ChefTable,
  ChefTableStatus,
} from "@/components/chef/types";

type ApiRecord = Record<string, unknown>;

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

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function firstNumber(values: unknown[], fallback = 0) {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") {
      return asNumber(value, fallback);
    }
  }

  return fallback;
}

function unwrapData(payload: unknown) {
  return isRecord(payload) && isRecord(payload.data) ? payload.data : payload;
}

function unwrapList(payload: unknown, keys: string[]) {
  const data = unwrapData(payload);

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
  const data = unwrapData(payload);

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

function getChefScope() {
  const user = getStoredAuthUser();

  return {
    chefId: user?.id?.trim() ?? "",
    chefName: user?.contactPersonName?.trim() || user?.email?.trim() || "",
    restaurantId: user?.restaurantId?.trim() ?? "",
    branchId: user?.branchId?.trim() ?? "",
    tenantId: user?.tenantId?.trim() ?? "",
  };
}

export function getStoredChefTenantId() {
  const scope = getChefScope();
  return scope.tenantId || scope.restaurantId;
}

export function getStoredChefIdentity() {
  const scope = getChefScope();
  return { chefId: scope.chefId, chefName: scope.chefName };
}

function chefUrl(path: string) {
  return apiUrl(path);
}

function normalizeChefOrderStatus(value: unknown): ChefOrderStatus {
  const status = asString(value).toLowerCase();

  if (status === "accepted" || status === "preparing" || status === "ready" || status === "delivered") {
    return status;
  }

  return "accepted";
}

function normalizeChefTableStatus(value: unknown): ChefTableStatus {
  const status = asString(value).toLowerCase();

  if (status === "available" || status === "occupied" || status === "preparing" || status === "ready" || status === "reserved") {
    return status;
  }

  return "available";
}

function mapChefOrderItem(payload: unknown): ChefOrderItem {
  const item = isRecord(payload) ? payload : {};

  return {
    id: asString(item.id ?? item.itemId ?? item.item_id ?? item.name),
    name: asString(item.name ?? item.foodName ?? item.food_name ?? item.menuItemName ?? item.menu_item_name, "Item"),
    quantity: asNumber(item.quantity, 1),
    note: asString(item.note ?? item.itemNote ?? item.item_note),
    size: asString(item.size ?? item.servingSize ?? item.serving_size),
  };
}

export function mapChefOrder(payload: unknown): ChefOrder {
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
    table: asString(order.table ?? order.tableNumber ?? order.table_number ?? order.table_id, "Table"),
    customer: asString(order.customer ?? order.customerName ?? order.customer_name, "Guest"),
    items: items.map(mapChefOrderItem),
    notes: asString(order.notes ?? order.note ?? order.item_note),
    status: normalizeChefOrderStatus(order.status ?? order.orderStatus ?? order.order_status),
    time: asString(order.time ?? order.placedAt ?? order.placed_at ?? order.createdAt ?? order.created_at),
    acceptedAt: asString(order.acceptedAt ?? order.accepted_at ?? order.createdAt ?? order.created_at),
    updatedAt: asString(order.updatedAt ?? order.updated_at),
    chefId: asString(order.chefId ?? order.chef_id ?? order.assignedChefId ?? order.assigned_chef_id),
    chefName: asString(order.chefName ?? order.chef_name ?? order.assignedChefName ?? order.assigned_chef_name),
  };
}

export function mapChefTable(payload: unknown): ChefTable {
  const table = isRecord(payload) ? payload : {};
  const tableNumber = asString(table.tableNumber ?? table.table_number ?? table.name ?? table.id);
  const id = asString(table.id ?? table.tableId ?? table.table_id, tableNumber);

  return {
    id,
    name: asString(table.name ?? tableNumber, id || "Table"),
    seats: asNumber(table.seats ?? table.capacity, 4),
    status: normalizeChefTableStatus(table.status ?? table.currentStatus ?? table.current_status),
    section: asString(table.section ?? table.area ?? table.location),
  };
}

function mapTopItem(payload: unknown) {
  const item = isRecord(payload) ? payload : {};
  const name = asString(item.name ?? item.foodName ?? item.food_name ?? item.menuItemName ?? item.menu_item_name, "Item");

  return {
    id: asString(item.id ?? item.menuItemId ?? item.menu_item_id ?? name),
    name,
    quantity: asNumber(item.quantity ?? item.totalQuantity ?? item.total_quantity),
  };
}

export function mapChefDashboardSummary(payload: unknown): ChefDashboardSummary {
  const summary = unwrapRecord(payload, ["summary", "dashboard"]);
  const statusCounts = unwrapRecord(summary.statusCounts ?? summary.status_counts, []);
  const hourlyActivity = unwrapList(summary.hourlyActivity ?? summary.hourly_activity, ["hourlyActivity", "hourly_activity"]);
  const topItems = unwrapList(summary.topItems ?? summary.top_items ?? summary.topOrderedItems ?? summary.top_ordered_items, ["topItems", "top_items", "items"]);
  const recentOrders = unwrapList(
    summary.recentKitchenOrders ?? summary.recent_kitchen_orders ?? summary.recentOrders ?? summary.recent_orders,
    ["recentKitchenOrders", "recent_kitchen_orders", "recentOrders", "recent_orders", "orders"],
  );

  return {
    acceptedOrdersToday: firstNumber([
      summary.acceptedOrdersToday,
      summary.accepted_orders_today,
      summary.todaysAccepted,
      summary.todays_accepted,
      summary.todayAccepted,
      summary.today_accepted,
      summary.acceptedCount,
      summary.accepted_count,
    ]),
    myPreparingOrders: firstNumber([
      summary.myPreparingOrders,
      summary.my_preparing_orders,
      summary.myPreparing,
      summary.my_preparing,
      summary.preparingCount,
      summary.preparing_count,
    ]),
    readyOrders: firstNumber([
      summary.readyOrders,
      summary.ready_orders,
      summary.readyCount,
      summary.ready_count,
    ]),
    completedToday: firstNumber([
      summary.completedToday,
      summary.completed_today,
      summary.deliveredToday,
      summary.delivered_today,
      summary.completedCount,
      summary.completed_count,
      summary.deliveredCount,
      summary.delivered_count,
    ]),
    averagePreparationTimeMinutes: firstNumber([
      summary.averagePreparationTimeMinutes,
      summary.average_preparation_time_minutes,
      summary.averagePreparationMinutes,
      summary.average_preparation_minutes,
      summary.avgPrepTime,
      summary.avg_prep_time,
      summary.avgPrepMinutes,
      summary.avg_prep_minutes,
    ]),
    statusCounts: {
      accepted: firstNumber([statusCounts.accepted, summary.acceptedCount, summary.accepted_count]),
      preparing: firstNumber([statusCounts.preparing, summary.preparingCount, summary.preparing_count]),
      ready: firstNumber([statusCounts.ready, summary.readyCount, summary.ready_count]),
      delivered: firstNumber([statusCounts.delivered, summary.deliveredCount, summary.delivered_count]),
    },
    recentOrders: recentOrders.map(mapChefOrder),
    hourlyActivity: hourlyActivity.map((item) => {
      const record = isRecord(item) ? item : {};
      return {
        hour: asString(record.hour ?? record.label ?? record.time),
        count: firstNumber([record.count, record.total, record.orders, record.orderCount, record.order_count]),
      };
    }),
    topItems: topItems.map(mapTopItem),
  };
}

export function mapChefProfile(payload: unknown): ChefProfile {
  const record = unwrapRecord(payload, ["user", "profile", "chef"]);
  const normalized = normalizeAuthUser(record) ?? normalizeAuthUser(getStoredAuthUser()) ?? null;

  return {
    id: asString(record.id ?? normalized?.id),
    name: asString(record.name ?? record.fullName ?? record.full_name ?? record.contactPersonName ?? normalized?.contactPersonName),
    email: asString(record.email ?? normalized?.email),
    phone: asString(record.phone ?? record.contactNumber ?? record.contact_number ?? record.contactPersonMobileNumber ?? normalized?.contactPersonMobileNumber),
    role: asString(record.role ?? normalized?.role, "chef"),
    restaurantId: asString(record.restaurantId ?? record.restaurant_id ?? normalized?.restaurantId),
    tenantId: asString(record.tenantId ?? record.tenant_id ?? normalized?.tenantId),
  };
}

function mapChefMenuItem(payload: unknown): ChefMenuItem {
  const item = isRecord(payload) ? payload : {};
  const imageUrl = getImageUrl(
    asString(item.imageUrl ?? item.image_url ?? item.image ?? item.itemImage ?? item.menuImage),
  );

  return {
    id: asString(item.id ?? item.menuItemId ?? item.menu_item_id ?? item.name),
    name: asString(item.name ?? item.foodName ?? item.food_name, "Item"),
    categoryName: asString(item.categoryName ?? item.category_name ?? item.category, "Menu"),
    subCategoryName: asString(item.subCategoryName ?? item.sub_category_name ?? item.subcategory),
    description: asString(item.description),
    imageUrl,
    smallPrice: asNumber(item.smallPrice ?? item.small_price),
    mediumPrice: asNumber(item.mediumPrice ?? item.medium_price),
    largePrice: asNumber(item.largePrice ?? item.large_price),
    available: Boolean(item.available ?? item.isAvailable ?? item.is_available),
    active: item.active === undefined && item.is_active === undefined ? true : Boolean(item.active ?? item.is_active),
    prepTime: asNumber(item.prepTime ?? item.prep_time_min, 12),
  };
}

export function mapChefMenu(payload: unknown): ChefMenuCategory[] {
  const items = unwrapList(payload, ["menuItems", "menu_items", "items", "rows"]).map(mapChefMenuItem);
  const categories = new Map<string, ChefMenuItem[]>();

  for (const item of items) {
    const categoryName = item.categoryName || "Menu";
    categories.set(categoryName, [...(categories.get(categoryName) ?? []), item]);
  }

  return Array.from(categories, ([name, categoryItems]) => ({
    name,
    items: categoryItems,
  }));
}

async function updateChefOrderStatus(orderId: string, status: ChefOrderStatus) {
  const identity = getStoredChefIdentity();
  const backendStatus = status.toUpperCase();
  const payload = await authJson<unknown>(chefUrl(API_ROUTES.chef.orderStatus(orderId)), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderStatus: backendStatus,
      order_status: backendStatus,
    }),
  });
  const mapped = mapChefOrder(unwrapRecord(payload, ["order", "data"]));

  return {
    ...mapped,
    status,
    chefId: mapped.chefId || identity.chefId,
    chefName: mapped.chefName || identity.chefName,
  };
}

export async function fetchChefDashboardSummary() {
  const payload = await authJson<unknown>(chefUrl(API_ROUTES.chef.dashboardSummary), { cache: "no-store" });
  return mapChefDashboardSummary(payload);
}

export async function fetchChefAcceptedOrders() {
  const payload = await authJson<unknown>(chefUrl(API_ROUTES.chef.orders), { cache: "no-store" });
  return unwrapList(payload, ["orders", "items", "rows"])
    .map(mapChefOrder)
    .filter((order) => order.status === "accepted");
}

export async function fetchChefMyOrders() {
  const payload = await authJson<unknown>(chefUrl(API_ROUTES.chef.myOrders), { cache: "no-store" });
  const identity = getStoredChefIdentity();

  return unwrapList(payload, ["orders", "items", "rows"])
    .map(mapChefOrder)
    .filter((order) => {
      if (identity.chefId && order.chefId) {
        return order.chefId === identity.chefId;
      }

      if (identity.chefName && order.chefName) {
        return order.chefName.trim().toLowerCase() === identity.chefName.trim().toLowerCase();
      }

      return true;
    });
}

export async function fetchChefAvailableTables() {
  const payload = await authJson<unknown>(chefUrl(API_ROUTES.chef.availableTables), { cache: "no-store" });
  return unwrapList(payload, ["tables", "items", "rows"])
    .map(mapChefTable)
    .filter((table) => table.status === "available");
}

export async function startChefOrderPreparing(orderId: string) {
  return updateChefOrderStatus(orderId, "preparing");
}

export async function moveChefOrderToReady(orderId: string) {
  return updateChefOrderStatus(orderId, "ready");
}

export async function moveChefOrderToDelivered(orderId: string) {
  return updateChefOrderStatus(orderId, "delivered");
}

export async function fetchChefProfile() {
  const payload = await authJson<unknown>(chefUrl(API_ROUTES.chef.profile), { cache: "no-store" });
  return mapChefProfile(payload);
}

export async function updateChefProfile(values: {
  name?: string;
  phone?: string;
}) {
  const payload = await authJson<unknown>(chefUrl(API_ROUTES.chef.profile), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });

  return mapChefProfile(payload);
}

export async function changeChefPassword(values: { currentPassword: string; newPassword: string }) {
  await authJson<unknown>(chefUrl(API_ROUTES.chef.changePassword), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
}

export async function fetchChefRestaurantMenu() {
  const payload = await authJson<unknown>(chefUrl("/chef/menu"), { cache: "no-store" });
  return mapChefMenu(payload);
}

export async function logoutChefSession() {
  try {
    await authJson<unknown>(apiUrl(API_ROUTES.auth.logout), { method: "POST" });
  } finally {
    clearAuthSession();
  }
}
