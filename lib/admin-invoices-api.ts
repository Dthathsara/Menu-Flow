/**
 * @file admin-invoices-api.ts
 * @description Production-grade API client module for System Admin Invoices.
 * Communicates with NestJS `@Controller('admin_invoice')` endpoints (`/api/v1/admin_invoice`).
 */

import { API_ROUTES, apiUrl } from "@/lib/api-config";
import { authFetch, getAccessToken } from "@/lib/auth-session";
import { getApiErrorMessage } from "@/lib/error-handler";
import type {
  AdminInvoice,
  AdminInvoiceListResponse,
  AdminInvoiceManager,
  AdminInvoiceStats,
  CreateAdminInvoicePayload,
  UpdateAdminInvoicePayload,
} from "@/components/admin/invoices/invoice.types";
import { createInvoiceSchema, updateInvoiceSchema } from "@/components/admin/invoices/invoice.schema";
import {
  formatExactCurrency,
  normalizeInvoiceStatus,
  parseAmount,
} from "@/components/admin/invoices/invoice.helpers";

/**
 * Retrieves stored authentication Bearer token.
 * Falls back to session token helper.
 */
export function getStoredAuthToken(): string {
  return getAccessToken() || "";
}

/**
 * Low-level authenticated fetch wrapper.
 * Automatically attaches Authorization header, `Content-Type: application/json`,
 * parses JSON, and throws standardized error messages via `getApiErrorMessage`.
 *
 * @param input - Request path or URL.
 * @param init - Request options (method, headers, body, etc.).
 * @returns Parsed response JSON object.
 * @throws Error if network request fails or response.ok is false.
 */
const inFlightCustomAuthFetchRequests = new Map<string, Promise<unknown>>();

export async function customAuthFetch<T = unknown>(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<T> {
  const method = (init.method || "GET").toUpperCase();
  const urlString = typeof input === "string" ? input : input.toString();
  const cacheKey = `${method}:${urlString}`;

  if (method === "GET" && inFlightCustomAuthFetchRequests.has(cacheKey)) {
    return inFlightCustomAuthFetchRequests.get(cacheKey) as Promise<T>;
  }

  const promise = (async () => {
    try {
      const headers = new Headers(init.headers);
      const token = getStoredAuthToken();

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }

      let response: Response;
      try {
        response = await authFetch(input, {
          ...init,
          headers,
        });
      } catch (error) {
        throw new Error(getApiErrorMessage(error, "Unable to connect to backend server."));
      }

      const contentType = response.headers.get("content-type");
      let data: unknown;

      if (contentType && contentType.includes("application/json")) {
        try {
          data = await response.json();
        } catch {
          data = null;
        }
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw new Error(getApiErrorMessage(data || response, `HTTP ${response.status} Request failed.`));
      }

      return data as T;
    } finally {
      if (method === "GET") {
        inFlightCustomAuthFetchRequests.delete(cacheKey);
      }
    }
  })();

  if (method === "GET") {
    inFlightCustomAuthFetchRequests.set(cacheKey, promise);
  }

  return promise;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
}

function unwrapData(value: unknown): unknown {
  if (!isRecord(value)) return value;
  if ("data" in value && value.data !== undefined) return value.data;
  return value;
}

function unwrapList(value: unknown): unknown[] {
  const unwrapped = unwrapData(value);
  if (Array.isArray(unwrapped)) return unwrapped;
  if (!isRecord(unwrapped)) return [];
  for (const key of ["items", "records", "invoices", "data", "results", "rows"]) {
    const candidate = unwrapped[key];
    if (Array.isArray(candidate)) return candidate;
  }
  return [];
}

/**
 * Normalizes a backend invoice payload into a strict `AdminInvoice` record.
 *
 * @param value - Raw backend record object.
 * @returns Fully normalized `AdminInvoice` object or null if invalid.
 */
export function normalizeAdminInvoice(value: unknown): AdminInvoice | null {
  if (!isRecord(value)) return null;

  const id = asString(value.id ?? value.invoiceId ?? value.invoice_id).trim();
  if (!id) return null;

  const rawInvoiceId = asString(value.invoiceId ?? value.invoice_id ?? value.number ?? value.code ?? id);

  const clientObj = isRecord(value.client)
    ? value.client
    : isRecord(value.restaurant)
      ? value.restaurant
      : isRecord(value.account)
        ? value.account
        : isRecord(value.user)
          ? value.user
          : null;

  const clientId = asString(
    value.clientId ??
      value.client_id ??
      clientObj?.id ??
      clientObj?.clientId ??
      clientObj?.userId,
  );

  const clientName = asString(
    clientObj?.restaurantName ??
      clientObj?.restaurant_name ??
      clientObj?.businessName ??
      clientObj?.name ??
      value.clientName ??
      value.client_name ??
      value.client ??
      "Client",
  );

  const managerObj = isRecord(value.manager)
    ? value.manager
    : isRecord(value.user) && isRecord(clientObj)
      ? clientObj
      : isRecord(value.managerUser)
        ? value.managerUser
        : clientObj;

  const managerName = asString(
    managerObj?.name ??
      managerObj?.ownerName ??
      managerObj?.owner_name ??
      managerObj?.fullName ??
      managerObj?.full_name ??
      value.ownerName ??
      value.managerName,
  );

  const managerEmail = asString(managerObj?.email ?? managerObj?.loginEmail ?? value.email);

  const manager: AdminInvoiceManager | null = managerName || managerEmail
    ? {
        id: asString(managerObj?.id ?? clientId),
        name: managerName || clientName,
        email: managerEmail,
        phone: asString(managerObj?.phone ?? managerObj?.mobileNumber),
      }
    : null;

  const rawAmount = value.amount ?? value.totalAmount ?? value.total_amount ?? value.total ?? 0;
  const numAmount = parseAmount(rawAmount);

  const dueDate = asString(
    value.dueDate ?? value.due_date ?? value.date ?? new Date().toISOString().split("T")[0],
  );

  const billingDate = asString(
    value.billingDate ?? value.billing_date ?? value.issuedAt ?? value.issued_at ?? value.createdAt ?? value.created_at ?? dueDate,
  );

  const createdAt = asString(value.createdAt ?? value.created_at ?? new Date().toISOString());
  const updatedAt = asString(value.updatedAt ?? value.updated_at ?? createdAt);

  return {
    id,
    invoiceId: rawInvoiceId,
    clientId,
    clientName,
    manager,
    amount: numAmount,
    dueDate,
    billingDate,
    status: normalizeInvoiceStatus(value.status),
    planName: asString(value.planName ?? value.plan_name ?? value.packageName ?? value.package_name) || undefined,
    packageId: asString(value.packageId ?? value.package_id) || undefined,
    billingCycle: asString(value.billingCycle ?? value.billing_cycle) || undefined,
    createdAt,
    updatedAt,
  };
}

/**
 * Calculates dashboard aggregate statistics from an array of invoices.
 *
 * @param invoices - List of normalized admin invoices.
 * @returns Computed `AdminInvoiceStats` metrics.
 */
export function computeAdminInvoiceStats(invoices: AdminInvoice[]): AdminInvoiceStats {
  let monthlyTotalAmount = 0;
  let totalPaidAmount = 0;
  let totalPaidCount = 0;
  let totalPendingAmount = 0;
  let totalPendingCount = 0;

  for (const inv of invoices) {
    monthlyTotalAmount += inv.amount;
    if (inv.status === "Paid") {
      totalPaidAmount += inv.amount;
      totalPaidCount++;
    } else if (inv.status === "Pending") {
      totalPendingAmount += inv.amount;
      totalPendingCount++;
    }
  }

  return {
    monthlyTotalAmount,
    totalPaidAmount,
    totalPaidCount,
    totalPendingAmount,
    totalPendingCount,
  };
}

/**
 * Fetches all invoices from GET `/api/v1/admin_invoice`.
 * Supports optional `search` and `status` query parameters.
 *
 * @param params - Optional query filters `{ search?: string; status?: string }`.
 * @returns Promise resolving to `AdminInvoiceListResponse`.
 * @throws Error if network fails or endpoint returns non-ok response.
 */
export async function fetchAdminInvoices(params?: {
  search?: string;
  status?: string;
}): Promise<AdminInvoiceListResponse> {
  const query = new URLSearchParams();
  if (params?.search?.trim()) query.set("search", params.search.trim());
  if (params?.status && params.status !== "All Status") query.set("status", params.status);

  const path = `${API_ROUTES.systemAdmin.invoices}${query.toString() ? `?${query.toString()}` : ""}`;
  const responseData = await customAuthFetch<unknown>(apiUrl(path));

  const list = unwrapList(responseData)
    .map(normalizeAdminInvoice)
    .filter((inv): inv is AdminInvoice => Boolean(inv));

  let stats: AdminInvoiceStats;
  if (isRecord(responseData) && isRecord(responseData.stats)) {
    const rawStats = responseData.stats as Record<string, unknown>;
    stats = {
      monthlyTotalAmount: parseAmount(rawStats.monthlyTotalAmount ?? rawStats.monthly_total_amount ?? rawStats.totalAmount),
      totalPaidAmount: parseAmount(rawStats.totalPaidAmount ?? rawStats.total_paid_amount ?? rawStats.paidAmount),
      totalPaidCount: Number(rawStats.totalPaidCount ?? rawStats.total_paid_count ?? rawStats.paidCount) || 0,
      totalPendingAmount: parseAmount(rawStats.totalPendingAmount ?? rawStats.total_pending_amount ?? rawStats.pendingAmount),
      totalPendingCount: Number(rawStats.totalPendingCount ?? rawStats.total_pending_count ?? rawStats.pendingCount) || 0,
    };
  } else {
    stats = computeAdminInvoiceStats(list);
  }

  return {
    invoices: list,
    stats,
    total: list.length,
  };
}

/**
 * Fetches a single invoice by ID from GET `/api/v1/admin_invoice/:id`.
 *
 * @param id - Primary database UUID or invoice ID.
 * @returns Promise resolving to `AdminInvoice`.
 * @throws Error if invoice is not found or request fails.
 */
export async function fetchAdminInvoiceById(id: string): Promise<AdminInvoice> {
  if (!id || !id.trim()) {
    throw new Error("Invoice ID parameter is required.");
  }

  const path = API_ROUTES.systemAdmin.invoiceById(id);
  const responseData = await customAuthFetch<unknown>(apiUrl(path));
  const record = normalizeAdminInvoice(unwrapData(responseData));

  if (!record) {
    throw new Error(`Invoice with ID "${id}" could not be found.`);
  }

  return record;
}

/**
 * Creates a new invoice database record via POST `/api/v1/admin_invoice`.
 * Validates payload against `createInvoiceSchema` prior to sending.
 *
 * @param payload - `CreateAdminInvoicePayload` object.
 * @returns Promise resolving to newly created `AdminInvoice`.
 * @throws Error if client validation fails or backend rejects payload.
 */
export async function createAdminInvoice(
  payload: CreateAdminInvoicePayload,
): Promise<AdminInvoice> {
  const validatedPayload = createInvoiceSchema.parse(payload);

  const path = API_ROUTES.systemAdmin.invoices;
  const responseData = await customAuthFetch<unknown>(apiUrl(path), {
    method: "POST",
    body: JSON.stringify(validatedPayload),
  });

  const record = normalizeAdminInvoice(unwrapData(responseData));
  if (!record) {
    const refreshed = await fetchAdminInvoices();
    const createdMatch = refreshed.invoices.find((item) => item.invoiceId === validatedPayload.invoiceId);
    if (createdMatch) {
      return createdMatch;
    }
    throw new Error("Invoice was created, but response object structure was unrecognized.");
  }

  return record;
}

/**
 * Updates an existing invoice via PATCH `/api/v1/admin_invoice/:id`.
 * Validates payload against `updateInvoiceSchema` prior to sending.
 *
 * @param id - Database primary key UUID of target invoice.
 * @param payload - Partial `UpdateAdminInvoicePayload` object.
 * @returns Promise resolving to updated `AdminInvoice`.
 * @throws Error if client validation fails or request fails.
 */
export async function updateAdminInvoice(
  id: string,
  payload: UpdateAdminInvoicePayload,
): Promise<AdminInvoice> {
  if (!id || !id.trim()) {
    throw new Error("Invoice ID is required for update operation.");
  }

  const validatedPayload = updateInvoiceSchema.parse(payload);

  const path = API_ROUTES.systemAdmin.invoiceById(id);
  const responseData = await customAuthFetch<unknown>(apiUrl(path), {
    method: "PATCH",
    body: JSON.stringify(validatedPayload),
  });

  const record = normalizeAdminInvoice(unwrapData(responseData));
  if (!record) {
    const refreshed = await fetchAdminInvoices();
    const updatedMatch = refreshed.invoices.find((item) => item.id === id || item.invoiceId === id);
    if (updatedMatch) {
      return updatedMatch;
    }
    throw new Error("Invoice was updated, but response object structure was unrecognized.");
  }

  return record;
}

/**
 * Deletes an invoice record via DELETE `/api/v1/admin_invoice/:id`.
 * Performs soft-deletion on backend.
 *
 * @param id - Database primary key UUID of target invoice.
 * @returns Promise resolving to void upon success.
 * @throws Error if deletion fails or backend returns error response.
 */
export async function deleteAdminInvoice(id: string): Promise<void> {
  if (!id || !id.trim()) {
    throw new Error("Invoice ID is required for delete operation.");
  }

  const path = API_ROUTES.systemAdmin.invoiceById(id);
  await customAuthFetch<unknown>(apiUrl(path), {
    method: "DELETE",
  });
}

export { fetchAdminInvoices as getAdminInvoices };
