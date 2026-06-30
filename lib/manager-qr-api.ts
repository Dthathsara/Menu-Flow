import { API_BASE_URL } from "@/lib/api-config";
import { createAuthenticatedAxios } from "@/lib/auth-session";
import type {
  GenerateQrFormValues,
  QrCodeRecord,
} from "@/components/manager/qr-codes/types";

const managerQrApi = createAuthenticatedAxios({
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

  if (typeof value === "boolean") {
    return String(value);
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

  for (const key of ["qrCode", "qr_code", "generatedQrCode", "generated_qr_code", "item", "data"]) {
    const value = data[key];

    if (isRecord(value)) {
      return value;
    }
  }

  return data;
}

function buildCustomerUrl(rawItem: ApiRecord) {
  const customerUrl = asString(
    rawItem.customerUrl ?? rawItem.customer_url ?? rawItem.qrValue ?? rawItem.qr_value,
  ).trim();
  const customerBaseUrl = (process.env.NEXT_PUBLIC_CUSTOMER_BASE_URL || "").replace(/\/$/, "");

  if (!customerUrl) {
    const tenantId = asString(rawItem.tenantId ?? rawItem.tenant_id).trim();
    const qrToken = asString(rawItem.qrToken ?? rawItem.qr_token).trim();

    if (customerBaseUrl && tenantId && qrToken) {
      const fallbackUrl = new URL("/customer", customerBaseUrl);
      fallbackUrl.searchParams.set("tenantId", tenantId);
      fallbackUrl.searchParams.set("qrToken", qrToken);
      fallbackUrl.searchParams.set("tab", "menu");

      return fallbackUrl.toString();
    }

    return "";
  }

  if (!customerBaseUrl) {
    return customerUrl;
  }

  try {
    const parsedCustomerUrl = new URL(customerUrl);

    if (["localhost", "127.0.0.1", "::1"].includes(parsedCustomerUrl.hostname)) {
      const parsedBaseUrl = new URL(customerBaseUrl);
      parsedCustomerUrl.protocol = parsedBaseUrl.protocol;
      parsedCustomerUrl.host = parsedBaseUrl.host;

      return parsedCustomerUrl.toString();
    }
  } catch {
    return customerUrl;
  }

  return customerUrl;
}

export function mapApiQrCode(rawQrCode: unknown): QrCodeRecord | null {
  if (!isRecord(rawQrCode)) {
    return null;
  }

  const id = asString(rawQrCode.id ?? rawQrCode.qrCodeId ?? rawQrCode.qr_code_id).trim();

  if (!id) {
    return null;
  }

  const customerUrl = buildCustomerUrl(rawQrCode);
  const status = asString(rawQrCode.status, asBoolean(rawQrCode.is_active ?? rawQrCode.isActive, true) ? "Active" : "Inactive");

  return {
    id,
    tenantId: asString(rawQrCode.tenantId ?? rawQrCode.tenant_id),
    tableNumber: asString(rawQrCode.tableNumber ?? rawQrCode.table_number),
    section: asString(rawQrCode.section),
    branch: asString(rawQrCode.branch ?? rawQrCode.restaurantName ?? rawQrCode.restaurant_name, "MenuFlow"),
    qrToken: asString(rawQrCode.qrToken ?? rawQrCode.qr_token),
    customerUrl,
    qrImageUrl: asString(rawQrCode.qrImageUrl ?? rawQrCode.qr_image_url),
    status,
    isActive: asBoolean(rawQrCode.isActive ?? rawQrCode.is_active, status.toLowerCase() === "active"),
    createdAt: asString(rawQrCode.createdAt ?? rawQrCode.created_at),
    updatedAt: asString(rawQrCode.updatedAt ?? rawQrCode.updated_at),
    qrValue: customerUrl,
  };
}

function mapSection(rawSection: unknown) {
  if (typeof rawSection === "string" || typeof rawSection === "number") {
    return String(rawSection).trim();
  }

  if (!isRecord(rawSection)) {
    return "";
  }

  return asString(rawSection.section ?? rawSection.name ?? rawSection.sectionName ?? rawSection.section_name).trim();
}

function mapTableNumber(rawTableNumber: unknown) {
  if (typeof rawTableNumber === "string" || typeof rawTableNumber === "number") {
    return String(rawTableNumber).trim();
  }

  if (!isRecord(rawTableNumber)) {
    return "";
  }

  return asString(
    rawTableNumber.tableNumber ??
      rawTableNumber.table_number ??
      rawTableNumber.number ??
      rawTableNumber.name,
  ).trim();
}

export async function fetchQrCodes() {
  const response = await managerQrApi.get("/generate-qr-codes");

  return unwrapList(response.data, ["qrCodes", "qr_codes", "generatedQrCodes", "items", "data"])
    .map(mapApiQrCode)
    .filter((qrCode): qrCode is QrCodeRecord => Boolean(qrCode));
}

export async function createQrCode(values: GenerateQrFormValues) {
  const response = await managerQrApi.post("/generate-qr-codes", {
    tableNumber: values.tableNumber.trim(),
    section: values.section.trim(),
  });

  return mapApiQrCode(unwrapItem(response.data));
}

export async function deleteQrCode(qrCodeId: string) {
  await managerQrApi.delete(`/generate-qr-codes/${encodeURIComponent(qrCodeId)}`);
}

export async function fetchQrSections() {
  const response = await managerQrApi.get("/generate-qr-codes/sections");
  const sections = unwrapList(response.data, ["sections", "data", "items"])
    .map(mapSection)
    .filter(Boolean);

  return Array.from(new Set(sections)).sort((a, b) => a.localeCompare(b));
}

export async function fetchQrTableNumbers() {
  const response = await managerQrApi.get("/generate-qr-codes/table-numbers");
  const tableNumbers = unwrapList(response.data, ["tableNumbers", "table_numbers", "data", "items"])
    .map(mapTableNumber)
    .filter(Boolean);

  return Array.from(new Set(tableNumbers)).sort((a, b) => a.localeCompare(b));
}
