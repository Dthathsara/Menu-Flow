import { API_BASE_URL } from "@/lib/api-config";
import {
  ApiResponseError,
  authFetch,
  NetworkError,
  SessionExpiredError,
} from "@/lib/auth-session";
import type {
  StaffFilters,
  StaffFormValues,
  StaffRecord,
  StaffRole,
  StaffStatus,
  StaffSummaryCounts,
} from "@/components/manager/users/types";

type ApiRecord = Record<string, unknown>;

export class ManagerStaffApiError extends Error {
  constructor(message = "Unable to load staff members. Please try again.") {
    super(message);
    this.name = "ManagerStaffApiError";
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
    const parsed = Number(value);
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

function unwrapList(payload: unknown) {
  const data = unwrapPayload(payload);

  if (Array.isArray(data)) {
    return data;
  }

  if (!isRecord(data)) {
    return [];
  }

  for (const key of ["staffMembers", "staff_members", "staff", "items", "results", "rows"]) {
    if (Array.isArray(data[key])) {
      return data[key] as unknown[];
    }
  }

  return [];
}

function unwrapItem(payload: unknown) {
  const data = unwrapPayload(payload);

  if (!isRecord(data)) {
    return data;
  }

  for (const key of ["staffMember", "staff_member", "staff", "member", "item"]) {
    if (isRecord(data[key])) {
      return data[key];
    }
  }

  return data;
}

function normalizeRole(value: unknown): StaffRole {
  return asString(value).trim();
}

function normalizeStatus(value: unknown): StaffStatus {
  const status = asString(value).trim().toLowerCase().replace(/[_-]/g, " ");

  if (status === "inactive") {
    return "Inactive";
  }

  if (status === "on leave" || status === "leave") {
    return "On Leave";
  }

  return "Active";
}

function extractNestedUser(record: ApiRecord) {
  return isRecord(record.user) ? record.user : {};
}

export function mapBackendStaffMember(payload: unknown): StaffRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const user = extractNestedUser(payload);
  const id = asString(payload.id ?? payload.staffId ?? payload.staff_id).trim();

  if (!id) {
    return null;
  }

  const fullName = asString(
    payload.fullName ??
      payload.full_name ??
      payload.name ??
      user.fullName ??
      user.full_name ??
      user.name,
  ).trim();
  const createdAt = asString(payload.createdAt ?? payload.created_at);
  const updatedAt = asString(payload.updatedAt ?? payload.updated_at);

  return {
    id,
    userId: asString(payload.userId ?? payload.user_id ?? user.id) || undefined,
    tenantId: asString(payload.tenantId ?? payload.tenant_id) || undefined,
    fullName,
    role: normalizeRole(payload.role),
    operationalAccess: asString(
      payload.operationalAccess ??
        payload.operational_access ??
        payload.access ??
        payload.permissions,
    ).trim() || null,
    email: asString(payload.email ?? user.email).trim().toLowerCase(),
    phone: asString(payload.phone ?? payload.mobile ?? user.phone ?? user.mobile).trim(),
    nicNumber: asString(payload.nicNumber ?? payload.nic_number ?? payload.nic).trim(),
    address: asString(payload.address).trim(),
    status: normalizeStatus(payload.status),
    lastActive: asString(
      payload.lastActive ??
        payload.last_active ??
        payload.lastLoginAt ??
        payload.last_login_at,
      updatedAt || createdAt,
    ),
    createdAt: createdAt || undefined,
    updatedAt: updatedAt || undefined,
  };
}

function buildStaffPayload(values: StaffFormValues) {
  const password = values.password?.trim();
  const payload: ApiRecord = {
    fullName: values.fullName.trim(),
    role: values.role,
    email: values.email.trim().toLowerCase(),
    phone: values.phone.trim(),
    nicNumber: values.nicNumber.trim(),
    address: values.address.trim(),
    status: values.status,
    operationalAccess: values.operationalAccess.trim(),
  };

  if (password) {
    payload.password = password;
  }

  return payload;
}

function buildQuery(filters?: StaffFilters) {
  const query = new URLSearchParams();

  if (filters?.query.trim()) {
    query.set("search", filters.query.trim());
  }

  if (filters?.role && filters.role !== "All Roles") {
    query.set("role", filters.role);
  }

  if (filters?.status && filters.status !== "All Statuses") {
    query.set("status", filters.status);
  }

  return query.toString();
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
    return new ManagerStaffApiError(
      "Unable to connect to the server. Please make sure the backend is running.",
    );
  }

  if (error instanceof ApiResponseError) {
    return new ManagerStaffApiError(
      extractApiMessage(error.response.data) || error.message || fallback,
    );
  }

  if (error instanceof ManagerStaffApiError) {
    return error;
  }

  if (error instanceof Error) {
    return new ManagerStaffApiError(error.message || fallback);
  }

  return new ManagerStaffApiError(fallback);
}

async function requestStaff(path: string, init: RequestInit = {}) {
  try {
    const response = await authFetch(`${API_BASE_URL}${path}`, {
      cache: "no-store",
      ...init,
      headers: init.headers,
    });
    const data = await readJson(response);

    if (!response.ok) {
      throw new ApiResponseError(
        extractApiMessage(data) || "Staff request failed.",
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

export async function fetchStaffMembers(filters?: StaffFilters): Promise<StaffRecord[]> {
  const query = buildQuery(filters);
  const payload = await requestStaff(`/staff-members${query ? `?${query}` : ""}`);

  return unwrapList(payload)
    .map(mapBackendStaffMember)
    .filter((record): record is StaffRecord => Boolean(record));
}

export async function fetchWaiterStaffMembers(): Promise<StaffRecord[]> {
  try {
    const payload = await requestStaff("/staff-members/waiters");
    const waiters = unwrapList(payload)
      .map(mapBackendStaffMember)
      .filter((record): record is StaffRecord => Boolean(record))
      .filter((record) => record.role.trim().toLowerCase() === "waiter");

    if (waiters.length) {
      return waiters;
    }
  } catch (error) {
    if (error instanceof SessionExpiredError) {
      throw error;
    }
  }

  const staff = await fetchStaffMembers();
  return staff.filter((record) => record.role.trim().toLowerCase() === "waiter");
}

export async function fetchStaffSummary(): Promise<StaffSummaryCounts> {
  const payload = unwrapPayload(await requestStaff("/staff-members/summary"));
  const summary = isRecord(payload) && isRecord(payload.summary) ? payload.summary : payload;
  const record = isRecord(summary) ? summary : {};

  return {
    totalUsers: asNumber(record.totalUsers ?? record.total_users ?? record.total ?? record.count),
    kitchenStaff: asNumber(record.kitchenStaff ?? record.kitchen_staff ?? record.chefs),
    serviceStaff: asNumber(record.serviceStaff ?? record.service_staff ?? record.service),
    activeToday: asNumber(record.activeToday ?? record.active_today ?? record.active),
  };
}

export async function fetchStaffRoles(): Promise<string[]> {
  const payload = await requestStaff("/staff-members/roles");
  const roles = unwrapList(payload)
    .map((role) => asString(role).trim())
    .filter(Boolean);

  if (roles.length) {
    return Array.from(new Set(roles)).sort((a, b) => a.localeCompare(b));
  }

  const data = unwrapPayload(payload);
  if (isRecord(data) && Array.isArray(data.roles)) {
    return Array.from(
      new Set(data.roles.map((role) => asString(role).trim()).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b));
  }

  return [];
}

export async function createStaffMember(values: StaffFormValues): Promise<StaffRecord> {
  const payload = await requestStaff("/staff-members", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildStaffPayload(values)),
  });
  const staff = mapBackendStaffMember(unwrapItem(payload));

  if (!staff) {
    throw new ManagerStaffApiError("Staff member was saved, but the response was invalid.");
  }

  return staff;
}

export async function updateStaffMember(
  id: string,
  values: StaffFormValues,
): Promise<StaffRecord> {
  const payload = await requestStaff(`/staff-members/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildStaffPayload(values)),
  });
  const staff = mapBackendStaffMember(unwrapItem(payload));

  if (!staff) {
    throw new ManagerStaffApiError("Staff member was updated, but the response was invalid.");
  }

  return staff;
}

export async function deleteStaffMember(id: string): Promise<void> {
  await requestStaff(`/staff-members/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
