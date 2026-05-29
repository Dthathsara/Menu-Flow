import type {
  ContactInfo,
  CustomerMenuData,
  MenuCategory,
  MenuItem,
  RestaurantInfo,
  ServingSize,
  Subcategory,
} from "@/types/customer";
import { getAccessToken, refreshAccessToken } from "@/lib/auth-session";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
const FALLBACK_IMAGE = "/customer/placeholder-food.svg";
const SERVING_SIZES: ServingSize[] = ["Small", "Medium", "Large"];

export interface CustomerMenuFetchParams {
  slug?: string;
  tenantId?: string;
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
  const name = asNonEmptyString(restaurant.name, "MenuFlow");
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
  const status = asNonEmptyString(
    restaurant.status,
    kitchenCloseTime ? `Kitchen open until ${kitchenCloseTime}` : "Kitchen open",
  );

  return {
    id: asString(restaurant.id) || null,
    name,
    businessType,
    kitchenCloseTime,
    status,
    titlePrefix: asString(restaurant.titlePrefix ?? restaurant.title_prefix, name),
    titleAccent: asString(restaurant.titleAccent ?? restaurant.title_accent, businessType),
    tagline: asString(restaurant.tagline, "customer menu"),
    location,
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

  return {
    phone: asString(contact.phone ?? restaurant.phone),
    email: asString(contact.email ?? restaurant.email),
    address: asString(contact.address ?? restaurant.address),
    openingHours: asString(
      contact.openingHours ?? contact.opening_hours ?? restaurant.openingHours,
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
      const subcategory =
        groupedItems.get(subcategoryId) ??
        ({
          id: subcategoryId,
          name: subcategoryName,
          description: `${subcategoryName} selections.`,
          defaultExpanded: true,
          items: [],
        } satisfies Subcategory);

      subcategory.items.push(item);
      groupedItems.set(subcategoryId, subcategory);
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
    const category =
      categories.get(categoryId) ??
      ({
        id: categoryId,
        name: categoryName,
        accentLabel: categoryName,
        description: `${categoryName} dishes from the current menu.`,
        subcategories: [],
      } satisfies MenuCategory);
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
    categories.set(categoryId, category);
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
  const restaurant = mapRestaurant(data.restaurant);
  const contact = mapContact(data.contact, data.restaurant);
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
