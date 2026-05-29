import { createAuthenticatedAxios } from "@/lib/auth-session";

import type {
  MenuCategory,
  MenuItemFormValues,
  MenuItemRecord,
} from "@/components/manager/manage-menu/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

export const MENU_API_ENDPOINTS = {
  menuItems: `${API_BASE_URL}/menu-items`,
  categories: `${API_BASE_URL}/menu-items/categories`,
};

const managerMenuApi = createAuthenticatedAxios({
  baseURL: API_BASE_URL,
});

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

function unwrapList(data: unknown, keys: string[]) {
  if (Array.isArray(data)) {
    return data;
  }

  if (!isRecord(data)) {
    return [];
  }

  for (const key of keys) {
    const value = data[key];
    if (Array.isArray(value)) {
      return value;
    }
  }

  if (isRecord(data.data)) {
    return unwrapList(data.data, keys);
  }

  return [];
}

function unwrapItem(data: unknown) {
  if (!isRecord(data)) {
    return data;
  }

  for (const key of ["menuItem", "menu_item", "item", "category", "data"]) {
    const value = data[key];
    if (isRecord(value)) {
      return value;
    }
  }

  return data;
}

export function mapApiCategory(rawCategory: unknown): MenuCategory | null {
  if (typeof rawCategory === "string") {
    const name = rawCategory.trim();

    return name ? { id: name, name } : null;
  }

  if (!isRecord(rawCategory)) {
    return null;
  }

  const name = asString(
    rawCategory.name ?? rawCategory.category_name ?? rawCategory.categoryName ?? rawCategory.title,
  );

  if (!name.trim()) {
    return null;
  }

  return {
    id: name,
    name,
  };
}

export function mapApiMenuItem(rawItem: unknown): MenuItemRecord | null {
  if (!isRecord(rawItem)) {
    return null;
  }

  const id = asString(rawItem.id);

  if (!id) {
    return null;
  }

  const deletedAt = rawItem.deleted_at;

  return {
    id,
    tenantId: asString(rawItem.tenant_id),
    name: asString(rawItem.name),
    categoryName: asString(rawItem.category_name),
    subCategoryName: asString(rawItem.sub_category_name) || null,
    description: asString(rawItem.description),
    smallPrice: Number(rawItem.small_price ?? 0),
    mediumPrice: Number(rawItem.medium_price ?? 0),
    largePrice: Number(rawItem.large_price ?? 0),
    prepTime: Number(rawItem.prep_time_min ?? 12),
    available: Boolean(rawItem.is_available),
    active: Boolean(rawItem.is_active),
    sortOrder: Number(rawItem.sort_order ?? 0),
    createdAt: asString(rawItem.created_at),
    updatedAt: asString(rawItem.updated_at),
    deletedAt: typeof deletedAt === "string" ? deletedAt : null,
    image: asString(rawItem.image_url ?? rawItem.imageUrl ?? rawItem.image),
  };
}

function buildMenuItemPayload(values: MenuItemFormValues) {
  const imageUrl = values.image.trim();

  return {
    name: values.name.trim(),
    category_name: values.categoryName.trim(),
    sub_category_name: values.subCategoryName.trim(),
    description: values.description.trim(),
    image_url: imageUrl,
    prep_time_min: Number(values.prepTime),
    is_available: values.available,
    small_price: Number(values.smallPrice),
    medium_price: Number(values.mediumPrice),
    large_price: Number(values.largePrice),
  };
}

export async function fetchMenuCategories() {
  const response = await managerMenuApi.get("/menu-items/categories");

  return unwrapList(response.data, ["categories", "data", "items"])
    .map(mapApiCategory)
    .filter((category): category is MenuCategory => Boolean(category));
}

export async function fetchMenuItems() {
  const response = await managerMenuApi.get("/menu-items");

  return unwrapList(response.data, ["menuItems", "menu_items", "items", "data"])
    .map(mapApiMenuItem)
    .filter((item): item is MenuItemRecord => Boolean(item));
}

export async function createMenuItem(values: MenuItemFormValues) {
  const response = await managerMenuApi.post("/menu-items", buildMenuItemPayload(values));

  return mapApiMenuItem(unwrapItem(response.data)) ?? null;
}

export async function updateMenuItem(itemId: string, values: MenuItemFormValues) {
  const response = await managerMenuApi.patch(
    `/menu-items/${itemId}`,
    buildMenuItemPayload(values),
  );

  return mapApiMenuItem(unwrapItem(response.data)) ?? null;
}

export async function deleteMenuItem(itemId: string) {
  await managerMenuApi.delete(`/menu-items/${itemId}`);
}
