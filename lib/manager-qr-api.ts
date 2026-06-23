import { createAuthenticatedAxios } from "@/lib/auth-session";
import { API_BASE_URL } from "@/lib/api-config";
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

  if (value instanceof Date) {
    return value.toISOString();
  }

  return fallback;
}

function asBoolean(value: unknown, fallback = false) {
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

  for (const key of ["qrCode", "qr_code", "generateQrCode", "item", "data"]) {
    const value = data[key];

    if (isRecord(value)) {
      return value;
    }
  }

  return data;
}

function getCustomerBaseUrl() {
  return (process.env.NEXT_PUBLIC_CUSTOMER_BASE_URL || "").replace(/\/+$/, "");
}

function isLocalCustomerUrlHostname(hostname: string) {
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return true;
  }

  if (hostname.startsWith("192.168.")) {
    return true;
  }

  if (hostname.startsWith("10.")) {
    return true;
  }

  const private172Match = /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname);

  return private172Match;
}

function normalizeCustomerUrl(value: unknown, tenantId: string, qrToken: string) {
  const rawUrl = asString(value);
  const customerBaseUrl = getCustomerBaseUrl();

  if (!rawUrl && customerBaseUrl && tenantId && qrToken) {
    const params = new URLSearchParams({ tenantId, qrToken, tab: "menu" });
    return `${customerBaseUrl}/customer?${params.toString()}`;
  }

  if (!rawUrl) {
    return "";
  }

  if (!customerBaseUrl) {
    return rawUrl;
  }

  try {
    const parsedUrl = new URL(rawUrl);
    const parsedBase = new URL(customerBaseUrl);

    if (isLocalCustomerUrlHostname(parsedUrl.hostname)) {
      parsedUrl.protocol = parsedBase.protocol;
      parsedUrl.host = parsedBase.host;
      return parsedUrl.toString();
    }
  } catch {
    return rawUrl;
  }

  return rawUrl;
}

export function mapApiQrCode(rawQrCode: unknown): QrCodeRecord | null {
  if (!isRecord(rawQrCode)) {
    return null;
  }

  const id = asString(rawQrCode.id);

  if (!id) {
    return null;
  }

  const tenantId = asString(rawQrCode.tenantId ?? rawQrCode.tenant_id);
  const qrToken = asString(rawQrCode.qrToken ?? rawQrCode.qr_token);
  const customerUrl = normalizeCustomerUrl(
    rawQrCode.customerUrl ?? rawQrCode.customer_url,
    tenantId,
    qrToken,
  );
  const isActive = asBoolean(rawQrCode.isActive ?? rawQrCode.is_active, true);

  return {
    id,
    tenantId,
    tableNumber: asString(rawQrCode.tableNumber ?? rawQrCode.table_number),
    section: asString(rawQrCode.section),
    qrToken,
    customerUrl,
    qrImageUrl: asString(rawQrCode.qrImageUrl ?? rawQrCode.qr_image_url),
    status: isActive ? "Active" : "Inactive",
    isActive,
    qrValue: customerUrl,
    createdAt: asString(rawQrCode.createdAt ?? rawQrCode.created_at),
    updatedAt: asString(rawQrCode.updatedAt ?? rawQrCode.updated_at),
  };
}

export async function fetchManagerQrCodes() {
  const response = await managerQrApi.get("/generate-qr-codes");

  return unwrapList(response.data, ["qrCodes", "qr_codes", "items", "data"])
    .map(mapApiQrCode)
    .filter((item): item is QrCodeRecord => Boolean(item));
}

export async function createManagerQrCode(values: GenerateQrFormValues) {
  const response = await managerQrApi.post("/generate-qr-codes", {
    tableNumber: values.tableNumber.trim(),
    section: values.section.trim(),
  });

  return mapApiQrCode(unwrapItem(response.data));
}

export async function deleteManagerQrCode(id: string) {
  await managerQrApi.delete(`/generate-qr-codes/${id}`);
}

export async function fetchManagerQrSections() {
  const response = await managerQrApi.get("/generate-qr-codes/sections");

  return unwrapList(response.data, ["sections", "data", "items"])
    .map((section) => asString(section).trim())
    .filter(Boolean);
}
