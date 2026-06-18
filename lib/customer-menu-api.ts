import type {
  ContactInfo,
  CustomerOrderHistory,
  CustomerOrderHistoryItem,
  CustomerMenuData,
  MenuCategory,
  MenuItem,
  RestaurantInfo,
  ServingSize,
  Subcategory,
} from "@/types/customer";
import { getAccessToken, refreshAccessToken } from "@/lib/auth-session";
import { API_BASE_URL } from "@/lib/api-config";
import { getSafeImageSrcFromCandidates } from "@/lib/image-url";

const FALLBACK_IMAGE = "/customer/placeholder-food.svg";
const SERVING_SIZES: ServingSize[] = ["Small", "Medium", "Large"];

export interface CustomerMenuFetchParams {
  slug?: string;
  tenantId?: string;
}

export interface CustomerOrderItemPayload {
  menu_item_id: string;
  food_name: string;
  category_name: string;
  sub_category_name: string;
  serving_size: string;
  unit_price: number;
  quantity: number;
  prep_time_min: number;
  image_url: string;
  item_note?: string;
}

export interface CreateCustomerOrderPayload {
  tenant_id: string;
  customer_session_id: string;
  customer_name: string;
  customer_phone: string;
  order_type: "dine_in" | "takeaway" | "delivery";
  item_note?: string;
  items: CustomerOrderItemPayload[];
  payment: {
    status: "paid";
    card_last4: string;
  };
}

export interface CustomerOrderRecord {
  id: string;
  order_status: string;
  [key: string]: unknown;
}

type ApiRecord = Record<string, unknown>;

export class CustomerMenuApiError extends Error {
  constructor(
    message: string,
    public readonly reason: "network" | "invalid" | "empty" | "http" = "http",
  ) {
    super(message);
    this.name = "CustomerMenuApiError";
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

function asNonEmptyString(value: unknown, fallback = "") {
  const text = asString(value).trim();
  return text || fallback;
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

function asBoolean(value: unknown, fallback = true) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  return fallback;
}

function tryParseJson(text: string) {
  if (!text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function getPayloadRecord(payload: unknown): ApiRecord {
  const data = unwrapPayload(payload);

  if (isRecord(data)) {
    for (const key of ["order", "customerOrder", "customer_order"]) {
      if (isRecord(data[key])) {
        return data[key];
      }
    }

    return data;
  }

  return {};
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function unwrapPayload(payload: unknown) {
  if (isRecord(payload) && isRecord(payload.data)) {
    return payload.data;
  }

  return payload;
}

function getDeletedValue(item: ApiRecord) {
  return item.deleted_at ?? item.deletedAt ?? item.deleted ?? item.is_deleted;
}

function shouldShowPublicItem(item: ApiRecord) {
  const isAvailable = asBoolean(
    item.is_available ?? item.isAvailable ?? item.available,
    true,
  );
  const isActive = asBoolean(item.is_active ?? item.isActive ?? item.active, true);
  const deletedValue = getDeletedValue(item);
  const isDeleted =
    deletedValue === undefined || deletedValue === null
      ? false
      : typeof deletedValue === "string"
        ? deletedValue.trim().length > 0
        : Boolean(deletedValue);

  return isAvailable && isActive && !isDeleted;
}

function getImageUrl(item: ApiRecord) {
  const rawImage = item.image_url ?? item.imageUrl ?? item.image ?? null;
  const image =
    rawImage && String(rawImage).trim() !== ""
      ? String(rawImage)
      : FALLBACK_IMAGE;

  return image;
}

function buildServingPrices(item: ApiRecord) {
  const servingPrices = isRecord(item.servingPrices) ? item.servingPrices : null;
  const small = Number(
    item.small_price ??
      item.smallPrice ??
      servingPrices?.Small ??
      servingPrices?.small ??
      0,
  );
  const medium = Number(
    item.medium_price ??
      item.mediumPrice ??
      servingPrices?.Medium ??
      servingPrices?.medium ??
      0,
  );
  const large = Number(
    item.large_price ??
      item.largePrice ??
      servingPrices?.Large ??
      servingPrices?.large ??
      0,
  );

  return {
    Small: Number.isFinite(small) ? small : 0,
    Medium: Number.isFinite(medium) ? medium : 0,
    Large: Number.isFinite(large) ? large : 0,
  } satisfies Record<ServingSize, number>;
}

function mapRestaurant(rawRestaurant: unknown): RestaurantInfo {
  const restaurant: ApiRecord = isRecord(rawRestaurant) ? rawRestaurant : {};
  const hotelName = asNonEmptyString(restaurant.hotelName ?? restaurant.hotel_name);
  const name = asNonEmptyString(restaurant.name ?? hotelName, "MenuFlow");
  const businessType = asNonEmptyString(
    restaurant.businessType ?? restaurant.business_type,
    "Menu",
  );
  const location = asNonEmptyString(
    restaurant.location ?? restaurant.businessLocation ?? restaurant.business_location,
    "",
  );
  const kitchenCloseTime = asNonEmptyString(
    restaurant.kitchenCloseTime ?? restaurant.kitchen_close_time,
    "",
  );
  const kitchenOpenTime = asString(
    restaurant.kitchenOpenTime ?? restaurant.kitchen_open_time,
  );
  const explicitOpeningHours = asString(
    restaurant.openingHours ?? restaurant.opening_hours,
  );
  const openingHours =
    explicitOpeningHours ||
    (kitchenOpenTime || kitchenCloseTime
      ? `Daily ${kitchenOpenTime} - ${kitchenCloseTime}`.trim()
      : "");
  const address = asString(
    restaurant.address ?? restaurant.businessAddress ?? restaurant.business_address,
  );
  const businessEmail = asString(
    restaurant.businessEmail ?? restaurant.business_email,
  );
  const email = asString(restaurant.email);
  const phone = asString(
    restaurant.phone ??
      restaurant.contactPersonMobileNumber ??
      restaurant.contact_person_mobile_number,
  );
  const status = asNonEmptyString(
    restaurant.status,
    kitchenCloseTime ? `Kitchen open until ${kitchenCloseTime}` : "Kitchen open",
  );

  return {
    id: asString(restaurant.id ?? restaurant.tenantId ?? restaurant.tenant_id) || null,
    name,
    hotelName,
    businessType,
    location,
    address,
    email,
    businessEmail,
    restaurantImageUrl: getSafeImageSrcFromCandidates([
      restaurant.restaurantImageUrl,
      restaurant.restaurant_image_url,
      restaurant.restaurantImage,
      restaurant.restaurant_image,
      restaurant.logoUrl,
      restaurant.logo_url,
      restaurant.logo,
      restaurant.image,
      restaurant.avatar,
    ], FALLBACK_IMAGE),
    phone,
    kitchenOpenTime,
    kitchenCloseTime,
    openingHours,
    taxRate: asNumber(restaurant.taxRate ?? restaurant.tax_rate, 5),
    serviceChargeRate: asNumber(
      restaurant.serviceChargeRate ?? restaurant.service_charge_rate,
      3,
    ),
    discountRate: asNumber(
      restaurant.discountRate ?? restaurant.discount_rate,
      0,
    ),
    status,
    titlePrefix: asString(restaurant.titlePrefix ?? restaurant.title_prefix, name),
    titleAccent: asString(restaurant.titleAccent ?? restaurant.title_accent, businessType),
    tagline: asString(restaurant.tagline, "customer menu"),
    heroSummary: asString(
      restaurant.heroSummary ?? restaurant.hero_summary,
      "Browse the latest available dishes from the restaurant menu.",
    ),
    heroNote: asString(restaurant.heroNote ?? restaurant.hero_note, "Live customer menu"),
    bannerLabel: asString(
      restaurant.bannerLabel ?? restaurant.banner_label,
      "Today's Signature Menu",
    ),
    kitchenHours: status,
  };
}

function mapContact(rawContact: unknown, rawRestaurant: unknown): ContactInfo {
  const contact: ApiRecord = isRecord(rawContact) ? rawContact : {};
  const restaurant: ApiRecord = isRecord(rawRestaurant) ? rawRestaurant : {};
  const kitchenOpenTime = asString(
    restaurant.kitchenOpenTime ?? restaurant.kitchen_open_time,
  );
  const kitchenCloseTime = asString(
    restaurant.kitchenCloseTime ?? restaurant.kitchen_close_time,
  );
  const fallbackOpeningHours =
    kitchenOpenTime || kitchenCloseTime
      ? `Daily ${kitchenOpenTime} - ${kitchenCloseTime}`.trim()
      : "";

  return {
    phone: asString(
      contact.phone ??
        restaurant.phone ??
        restaurant.contactPersonMobileNumber ??
        restaurant.contact_person_mobile_number,
    ),
    email: asString(
      contact.email ??
        restaurant.businessEmail ??
        restaurant.business_email ??
        restaurant.email,
    ),
    address: asString(
      contact.address ??
        restaurant.address ??
        restaurant.businessAddress ??
        restaurant.business_address,
    ),
    openingHours: asString(
      contact.openingHours ??
        contact.opening_hours ??
        restaurant.openingHours ??
        restaurant.opening_hours,
      fallbackOpeningHours,
    ),
    reservations: asString(contact.reservations ?? restaurant.reservations),
    socials: [],
  };
}

function makeCategoryId(categoryName: string) {
  return slugify(categoryName) || "menu";
}

function makeSubcategoryId(categoryId: string, subcategoryName: string) {
  return `${categoryId}-${slugify(subcategoryName) || "items"}`;
}

function mapMenuItem(
  rawItem: unknown,
  inheritedCategoryName?: string,
  inheritedSubcategoryName?: string,
): MenuItem | null {
  if (!isRecord(rawItem) || !shouldShowPublicItem(rawItem)) {
    return null;
  }

  const id = asString(rawItem.id ?? rawItem.menu_item_id ?? rawItem.menuItemId);
  const name = asString(
    rawItem.name ?? rawItem.food_name ?? rawItem.foodName,
    "Unnamed item",
  );

  if (!id) {
    return null;
  }

  const categoryName = asString(
    rawItem.category_name ?? rawItem.categoryName,
    inheritedCategoryName || "",
  );
  const subCategoryName = asString(
    rawItem.sub_category_name ?? rawItem.subCategoryName ?? rawItem.subcategory_name,
    inheritedSubcategoryName || "",
  );
  const servingPrices = buildServingPrices(rawItem);
  const positivePrices = [
    servingPrices.Small,
    servingPrices.Medium,
    servingPrices.Large,
  ].filter((price) => price > 0);
  const basePrice = positivePrices.length ? Math.min(...positivePrices) : 0;
  const mapped = {
    id,
    name,
    description: asString(rawItem.description, ""),
    image: getImageUrl(rawItem),
    basePrice,
    servingPrices,
    prepTime: asNumber(rawItem.prep_time_min ?? rawItem.prepTimeMin ?? rawItem.prepTime, 12),
    categoryName,
    subCategoryName,
    available: asBoolean(
      rawItem.is_available ?? rawItem.isAvailable ?? rawItem.available,
      true,
    ),
  };

  console.log("Customer mapped item:", {
    name: mapped.name,
    imageStart: mapped.image?.slice?.(0, 40),
    servingPrices: mapped.servingPrices,
  });

  return mapped;
}

function normalizeSubcategory(
  rawSubcategory: unknown,
  categoryName: string,
  categoryId: string,
): Subcategory | null {
  if (!isRecord(rawSubcategory)) {
    return null;
  }

  const name = asString(
    rawSubcategory.name ??
      rawSubcategory.sub_category_name ??
      rawSubcategory.subCategoryName ??
      rawSubcategory.subcategory_name,
    "Items",
  );
  const id = asString(
    rawSubcategory.id ?? rawSubcategory.sub_category_id ?? rawSubcategory.subCategoryId,
    makeSubcategoryId(categoryId, name),
  );
  const rawItems = Array.isArray(rawSubcategory.items)
    ? rawSubcategory.items
    : Array.isArray(rawSubcategory.menuItems)
      ? rawSubcategory.menuItems
      : Array.isArray(rawSubcategory.menu_items)
        ? rawSubcategory.menu_items
        : [];
  const items = rawItems
    .map((item) => mapMenuItem(item, categoryName, name))
    .filter((item): item is MenuItem => Boolean(item));

  if (!items.length) {
    return null;
  }

  return {
    id,
    name,
    description: asString(rawSubcategory.description, `${name} selections.`),
    defaultExpanded: asBoolean(rawSubcategory.defaultExpanded, true),
    items,
  };
}

function normalizeCategory(rawCategory: unknown): MenuCategory | null {
  if (!isRecord(rawCategory)) {
    return null;
  }

  const name = asString(rawCategory.name ?? rawCategory.category_name, "Menu");
  const id = asString(rawCategory.id ?? rawCategory.category_id, makeCategoryId(name));
  const rawSubcategories = Array.isArray(rawCategory.subcategories)
    ? rawCategory.subcategories
    : Array.isArray(rawCategory.sub_categories)
      ? rawCategory.sub_categories
      : [];
  const subcategories = rawSubcategories
    .map((subcategory) => normalizeSubcategory(subcategory, name, id))
    .filter((subcategory): subcategory is Subcategory => Boolean(subcategory));
  const directItems = Array.isArray(rawCategory.items)
    ? rawCategory.items
    : Array.isArray(rawCategory.menuItems)
      ? rawCategory.menuItems
      : Array.isArray(rawCategory.menu_items)
        ? rawCategory.menu_items
        : [];
  const directMappedItems = directItems
    .map((item) => mapMenuItem(item, name, "Items"))
    .filter((item): item is MenuItem => Boolean(item));

  if (directMappedItems.length) {
    const groupedItems = new Map<string, Subcategory>();

    for (const item of directMappedItems) {
      const subcategoryName = item.subCategoryName || "Items";
      const subcategoryId = makeSubcategoryId(id, subcategoryName);
      let subcategory = groupedItems.get(subcategoryId);

      if (!subcategory) {
        subcategory = {
          id: subcategoryId,
          name: subcategoryName,
          description: `${subcategoryName} selections.`,
          defaultExpanded: true,
          items: [],
        };
        groupedItems.set(subcategoryId, subcategory);
      }

      subcategory.items.push(item);
    }

    subcategories.push(...groupedItems.values());
  }

  if (!subcategories.length) {
    return null;
  }

  return {
    id,
    name,
    accentLabel: asString(rawCategory.accentLabel ?? rawCategory.accent_label, name),
    description: asString(rawCategory.description, `${name} dishes from the current menu.`),
    subcategories,
  };
}

function flattenItemsFromPayload(payload: unknown): ApiRecord[] {
  if (Array.isArray(payload)) {
    return payload.flatMap(flattenItemsFromPayload);
  }

  if (!isRecord(payload)) {
    return [];
  }

  const directItemId = payload.id ?? payload.menu_item_id ?? payload.menuItemId;
  const directItemName = payload.name ?? payload.food_name ?? payload.foodName;
  const hasItemShape =
    directItemId !== undefined &&
    directItemName !== undefined &&
    (payload.category_name !== undefined ||
      payload.categoryName !== undefined ||
      payload.small_price !== undefined ||
      payload.medium_price !== undefined ||
      payload.large_price !== undefined);

  if (hasItemShape) {
    return [payload];
  }

  for (const key of [
    "items",
    "menuItems",
    "menu_items",
    "categories",
    "subcategories",
    "sub_categories",
    "data",
  ]) {
    const value = payload[key];

    if (Array.isArray(value)) {
      return value.flatMap(flattenItemsFromPayload);
    }

    if (isRecord(value)) {
      return flattenItemsFromPayload(value);
    }
  }

  return [];
}

function groupFlatItems(rawItems: ApiRecord[]) {
  const categories = new Map<string, MenuCategory>();

  for (const rawItem of rawItems) {
    const item = mapMenuItem(rawItem);

    if (!item) {
      continue;
    }

    const categoryName = item.categoryName || "Menu";
    const subcategoryName = item.subCategoryName || "Items";
    const categoryId = makeCategoryId(categoryName);
    const subcategoryId = makeSubcategoryId(categoryId, subcategoryName);
    let category = categories.get(categoryId);

    if (!category) {
      category = {
        id: categoryId,
        name: categoryName,
        accentLabel: categoryName,
        description: `${categoryName} dishes from the current menu.`,
        subcategories: [],
      };
      categories.set(categoryId, category);
    }

    let subcategory = category.subcategories.find(
      (entry) => entry.id === subcategoryId,
    );

    if (!subcategory) {
      subcategory = {
        id: subcategoryId,
        name: subcategoryName,
        description: `${subcategoryName} selections.`,
        defaultExpanded: true,
        items: [],
      };
      category.subcategories.push(subcategory);
    }

    subcategory.items.push(item);
  }

  return Array.from(categories.values());
}

export function filterCustomerMenuData(data: CustomerMenuData) {
  return {
    ...data,
    categories: data.categories
      .map((category) => ({
        ...category,
        subcategories: category.subcategories
          .map((subcategory) => ({
            ...subcategory,
            items: subcategory.items.filter(
              (item) =>
                item.available !== false &&
                SERVING_SIZES.some((serving) => item.servingPrices[serving] >= 0),
            ),
          }))
          .filter((subcategory) => subcategory.items.length > 0),
      }))
      .filter((category) => category.subcategories.length > 0),
  };
}

export function mapCustomerMenuData(payload: unknown): CustomerMenuData {
  const data = unwrapPayload(payload);

  if (!isRecord(data)) {
    throw new CustomerMenuApiError("Menu data is not available right now.", "invalid");
  }

  const categories = Array.isArray(data.categories)
    ? data.categories
        .map(normalizeCategory)
        .filter((category): category is MenuCategory => Boolean(category))
    : groupFlatItems(flattenItemsFromPayload(data));
  const rawRestaurant = isRecord(data.restaurant) ? data.restaurant : data;
  const restaurant = mapRestaurant(rawRestaurant);
  const contact = mapContact(data.contact, rawRestaurant);
  const menuData = filterCustomerMenuData({
    restaurant,
    contact,
    categories,
  });

  if (!menuData.categories.length) {
    throw new CustomerMenuApiError("No menu items are available right now.", "empty");
  }

  return menuData;
}

function buildCustomerMenuUrl(params?: CustomerMenuFetchParams) {
  const query = new URLSearchParams();

  if (params?.slug?.trim()) {
    query.set("slug", params.slug.trim());
  }

  if (params?.tenantId?.trim()) {
    query.set("tenantId", params.tenantId.trim());
  }

  const queryString = query.toString();
  return `${API_BASE_URL}/customer-menu${queryString ? `?${queryString}` : ""}`;
}

function buildCustomerSessionOrdersUrl(customerSessionId: string, tenantId: string) {
  const query = new URLSearchParams({
    tenantId: tenantId.trim(),
  });

  return `${API_BASE_URL}/customer-orders/session/${encodeURIComponent(
    customerSessionId,
  )}?${query.toString()}`;
}

function buildCustomerOrderUrl(orderId: string, tenantId: string) {
  const query = new URLSearchParams({
    tenantId: tenantId.trim(),
  });

  return `${API_BASE_URL}/customer-orders/${encodeURIComponent(
    orderId,
  )}?${query.toString()}`;
}

export async function fetchCustomerMenuData(params?: CustomerMenuFetchParams) {
  let response: Response;
  const headers = new Headers();
  const accessToken = getAccessToken();

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  try {
    response = await fetch(buildCustomerMenuUrl(params), {
      cache: "no-store",
      headers,
    });
  } catch {
    throw new CustomerMenuApiError(
      "Unable to load menu. Please try again.",
      "network",
    );
  }

  if (response.status === 401 && accessToken) {
    try {
      const nextAccessToken = await refreshAccessToken();
      headers.set("Authorization", `Bearer ${nextAccessToken}`);
      response = await fetch(buildCustomerMenuUrl(params), {
        cache: "no-store",
        headers,
      });
    } catch {
      throw new CustomerMenuApiError("Unable to load menu. Please try again.", "http");
    }
  }

  if (!response.ok) {
    throw new CustomerMenuApiError("Unable to load menu. Please try again.", "http");
  }

  return mapCustomerMenuData(await response.json());
}

export function mapCustomerOrderRecord(payload: unknown): CustomerOrderRecord {
  const order = getPayloadRecord(payload);
  const id = asString(order.id ?? order.order_id ?? order.orderId);

  return {
    ...order,
    id,
    order_status: asString(
      order.order_status ?? order.orderStatus ?? order.status,
      "accepted",
    ),
  };
}

function getPayloadArray(payload: unknown): unknown[] {
  const data = unwrapPayload(payload);

  if (Array.isArray(data)) {
    return data;
  }

  if (!isRecord(data)) {
    return [];
  }

  for (const key of [
    "orders",
    "customerOrders",
    "customer_orders",
    "items",
    "results",
  ]) {
    if (Array.isArray(data[key])) {
      return data[key] as unknown[];
    }
  }

  return [];
}

function mapCustomerOrderHistoryItem(payload: unknown): CustomerOrderHistoryItem {
  const item = isRecord(payload) ? payload : {};
  const quantity = asNumber(item.quantity, 0);
  const unitPrice = asNumber(item.unit_price ?? item.unitPrice, 0);

  return {
    id: asString(item.id ?? item.order_item_id ?? item.orderItemId),
    menu_item_id: asString(item.menu_item_id ?? item.menuItemId),
    food_name: asString(item.food_name ?? item.foodName ?? item.name, "Item"),
    category_name: asString(item.category_name ?? item.categoryName),
    sub_category_name: asString(
      item.sub_category_name ?? item.subCategoryName ?? item.subcategory_name,
    ),
    serving_size: asString(item.serving_size ?? item.servingSize ?? item.serving),
    unit_price: unitPrice,
    quantity,
    line_total: asNumber(
      item.line_total ?? item.lineTotal,
      unitPrice * quantity,
    ),
    prep_time_min: asNumber(
      item.prep_time_min ?? item.prepTimeMin ?? item.prepTime,
      0,
    ),
    image_url: asString(item.image_url ?? item.imageUrl ?? item.image),
    item_note: asString(item.item_note ?? item.itemNote ?? item.note),
  };
}

export function mapCustomerOrderHistory(payload: unknown): CustomerOrderHistory {
  const order = getPayloadRecord(payload);
  const id = asString(order.id ?? order.order_id ?? order.orderId);
  const payment = isRecord(order.payment) ? order.payment : {};
  const rawItems = Array.isArray(order.items)
    ? order.items
    : Array.isArray(order.order_items)
      ? order.order_items
      : Array.isArray(order.orderItems)
        ? order.orderItems
        : [];

  return {
    id,
    order_number: asString(
      order.order_number ?? order.orderNumber ?? order.number,
      id,
    ),
    customer_name: asString(order.customer_name ?? order.customerName),
    customer_phone: asString(order.customer_phone ?? order.customerPhone),
    order_type: asString(order.order_type ?? order.orderType, "dine_in"),
    order_status: asString(
      order.order_status ?? order.orderStatus ?? order.status,
      "accepted",
    ),
    payment_status: asString(
      order.payment_status ?? order.paymentStatus ?? payment.status,
      "unpaid",
    ),
    subtotal: asNumber(order.subtotal ?? order.sub_total ?? order.subTotal),
    tax_amount: asNumber(order.tax_amount ?? order.taxAmount),
    service_charge_amount: asNumber(
      order.service_charge_amount ?? order.serviceChargeAmount,
    ),
    discount_amount: asNumber(order.discount_amount ?? order.discountAmount),
    total_amount: asNumber(order.total_amount ?? order.totalAmount ?? order.total),
    placed_at: asString(
      order.placed_at ?? order.placedAt ?? order.created_at ?? order.createdAt,
    ),
    items: rawItems.map(mapCustomerOrderHistoryItem),
  };
}

function sortCustomerOrders(orders: CustomerOrderHistory[]) {
  return [...orders].sort((left, right) => {
    const leftTime = Date.parse(left.placed_at);
    const rightTime = Date.parse(right.placed_at);

    return (Number.isFinite(rightTime) ? rightTime : 0) -
      (Number.isFinite(leftTime) ? leftTime : 0);
  });
}

export async function fetchCustomerSessionOrders(
  customerSessionId: string,
  tenantId: string,
) {
  let response: Response;
  const cleanTenantId = tenantId.trim();

  if (!cleanTenantId) {
    throw new CustomerMenuApiError(
      "Unable to load your previous orders.",
      "invalid",
    );
  }

  try {
    response = await fetch(
      buildCustomerSessionOrdersUrl(customerSessionId, cleanTenantId),
      {
        cache: "no-store",
      },
    );
  } catch {
    throw new CustomerMenuApiError(
      "Unable to load your previous orders.",
      "network",
    );
  }

  if (!response.ok) {
    throw new CustomerMenuApiError(
      "Unable to load your previous orders.",
      "http",
    );
  }

  const text = await response.text();
  const data = tryParseJson(text);

  return sortCustomerOrders(getPayloadArray(data).map(mapCustomerOrderHistory));
}

export async function createCustomerOrder(payload: CreateCustomerOrderPayload) {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/customer-orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new CustomerMenuApiError(
      "Unable to create order. Please check your connection and try again.",
      "network",
    );
  }

  const text = await response.text();
  const data = tryParseJson(text);

  if (!response.ok) {
    const message =
      isRecord(data) && (data.message || data.error)
        ? String(data.message ?? data.error)
        : text.trim() || "Unable to create order. Please try again.";

    throw new CustomerMenuApiError(message, "http");
  }

  return mapCustomerOrderRecord(data);
}

export async function fetchCustomerOrder(orderId: string, tenantId: string) {
  let response: Response;
  const cleanTenantId = tenantId.trim();

  if (!cleanTenantId) {
    throw new CustomerMenuApiError(
      "Unable to refresh order status right now.",
      "invalid",
    );
  }

  try {
    response = await fetch(buildCustomerOrderUrl(orderId, cleanTenantId), {
      cache: "no-store",
    });
  } catch {
    throw new CustomerMenuApiError(
      "Unable to refresh order status right now.",
      "network",
    );
  }

  if (!response.ok) {
    throw new CustomerMenuApiError(
      "Unable to refresh order status right now.",
      "http",
    );
  }

  const text = await response.text();
  return mapCustomerOrderRecord(tryParseJson(text));
}
