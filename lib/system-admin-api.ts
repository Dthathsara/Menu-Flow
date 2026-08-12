import { API_ROUTES, apiUrl } from "@/lib/api-config";
import { authJson } from "@/lib/auth-session";

export type AdminClientPackage = "Starter" | "Business" | "Pro" | "Enterprise";
export type AdminClientStatus = "Active" | "Pending" | "Inactive";
export type SystemStaffRole = "SUPER_ADMIN" | "ADMIN" | "SUPPORT" | "FINANCE";
export type SystemStaffStatus = "Active" | "Inactive";

export interface AdminClient {
  id: string;
  restaurantName: string;
  ownerName: string;
  loginEmail: string;
  businessEmail: string;
  businessType: string;
  location: string;
  address: string;
  phone: string;
  packageName: AdminClientPackage;
  status: AdminClientStatus;
  createdAt: string;
}

export interface CreateAdminClientInput {
  restaurantName: string;
  ownerName: string;
  loginEmail: string;
  temporaryPassword: string;
  phone: string;
  businessType: string;
  location: string;
  address: string;
  businessEmail: string;
  packageName: AdminClientPackage;
  status: AdminClientStatus;
}

export type UpdateAdminClientInput = Partial<Omit<CreateAdminClientInput, "temporaryPassword">>;

export interface SystemStaffUser {
  id: string;
  fullName: string;
  email: string;
  role: SystemStaffRole;
  lastLogin: string;
  status: SystemStaffStatus;
  createdAt: string;
}

export interface CreateSystemStaffUserInput {
  fullName: string;
  email: string;
  password: string;
  role: SystemStaffRole;
  status: SystemStaffStatus;
}

export type UpdateSystemStaffUserInput = Partial<Omit<CreateSystemStaffUserInput, "password">>;

export interface SystemAdminProfile {
  id: string;
  fullName: string;
  email: string;
  role: SystemStaffRole;
  initials: string;
}

export interface UpdateSystemAdminProfileInput {
  fullName: string;
  email: string;
}

export interface ChangeSystemAdminPasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

const SYSTEM_STAFF_ROLES: SystemStaffRole[] = ["SUPER_ADMIN", "ADMIN", "SUPPORT", "FINANCE"];

function isRecord(value: unknown): value is Record<string, unknown> {
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

function unwrapData(value: unknown): unknown {
  if (!isRecord(value)) {
    return value;
  }

  if (Array.isArray(value.data)) {
    return value.data;
  }

  if (isRecord(value.data)) {
    return value.data;
  }

  return value;
}

function unwrapList(value: unknown): unknown[] {
  const unwrapped = unwrapData(value);

  if (Array.isArray(unwrapped)) {
    return unwrapped;
  }

  if (!isRecord(unwrapped)) {
    return [];
  }

  for (const key of ["items", "records", "clients", "users", "staffUsers", "systemStaffUsers"]) {
    const candidate = unwrapped[key];

    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
}

function titleCaseToken(value: string) {
  const normalized = value.trim().toLowerCase();
  return normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : "";
}

export function formatSystemStaffRole(role: SystemStaffRole | string) {
  return role
    .split("_")
    .map(titleCaseToken)
    .filter(Boolean)
    .join(" ");
}

export function normalizeSystemStaffRole(value: unknown): SystemStaffRole {
  const normalized = asString(value, "ADMIN").trim().toUpperCase().replace(/[\s-]+/g, "_");
  return SYSTEM_STAFF_ROLES.includes(normalized as SystemStaffRole)
    ? (normalized as SystemStaffRole)
    : "ADMIN";
}

function normalizePackage(value: unknown): AdminClientPackage {
  const normalized = titleCaseToken(asString(value, "Starter"));
  if (normalized === "Business" || normalized === "Pro" || normalized === "Enterprise") {
    return normalized;
  }
  return "Starter";
}

function normalizeStatus<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  const normalized = titleCaseToken(asString(value, fallback));
  return allowed.includes(normalized as T) ? (normalized as T) : fallback;
}

function normalizeDate(value: unknown) {
  const raw = asString(value);
  if (!raw) {
    return "";
  }

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return raw;
  }

  return date.toLocaleDateString([], {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function getInitials(name: string, email: string) {
  const source = name.trim() || email.trim();
  const initials = source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "A";
}

function toAdminClient(value: unknown): AdminClient | null {
  if (!isRecord(value)) {
    return null;
  }

  const role = asString(value.role).trim().toUpperCase();
  if (role && !["MANAGER", "CLIENT_ADMIN"].includes(role)) {
    return null;
  }

  const id = asString(value.id ?? value.userId ?? value.user_id);
  if (!id) {
    return null;
  }

  return {
    id,
    restaurantName: asString(value.restaurantName ?? value.restaurant_name ?? value.businessName ?? value.business_name ?? value.hotelName ?? value.hotel_name),
    ownerName: asString(value.ownerName ?? value.owner_name ?? value.contactPersonName ?? value.contact_person_name ?? value.name ?? value.fullName ?? value.full_name),
    loginEmail: asString(value.loginEmail ?? value.login_email ?? value.email),
    businessEmail: asString(value.businessEmail ?? value.business_email ?? value.publicBusinessEmail ?? value.public_business_email),
    businessType: asString(value.businessType ?? value.business_type),
    location: asString(value.location ?? value.businessLocation ?? value.business_location),
    address: asString(value.address ?? value.businessAddress ?? value.business_address),
    phone: asString(value.phone ?? value.contactPersonMobileNumber ?? value.contact_person_mobile_number ?? value.contactNumber ?? value.contact_number),
    packageName: normalizePackage(value.packageName ?? value.package_name ?? value.package ?? value.plan),
    status: normalizeStatus(value.status ?? value.accountStatus ?? value.account_status ?? (value.isActive === false ? "Inactive" : "Active"), ["Active", "Pending", "Inactive"], "Active"),
    createdAt: normalizeDate(value.createdAt ?? value.created_at),
  };
}

function toSystemStaffUser(value: unknown): SystemStaffUser | null {
  if (!isRecord(value)) {
    return null;
  }

  const role = normalizeSystemStaffRole(value.role);
  const rawRole = asString(value.role).trim().toUpperCase().replace(/[\s-]+/g, "_");
  if (rawRole && !SYSTEM_STAFF_ROLES.includes(rawRole as SystemStaffRole)) {
    return null;
  }

  const id = asString(value.id ?? value.userId ?? value.user_id);
  if (!id) {
    return null;
  }

  return {
    id,
    fullName: asString(value.fullName ?? value.full_name ?? value.name ?? value.contactPersonName ?? value.contact_person_name),
    email: asString(value.email),
    role,
    lastLogin: normalizeDate(value.lastLogin ?? value.last_login ?? value.lastLoginAt ?? value.last_login_at) || "Never",
    status: normalizeStatus(value.status ?? (value.isActive === false ? "Inactive" : "Active"), ["Active", "Inactive"], "Active"),
    createdAt: normalizeDate(value.createdAt ?? value.created_at),
  };
}

function toSystemAdminProfile(value: unknown): SystemAdminProfile {
  const record = isRecord(unwrapData(value)) ? unwrapData(value) as Record<string, unknown> : {};
  const fullName = asString(record.fullName ?? record.full_name ?? record.name ?? record.contactPersonName ?? record.contact_person_name, "System Admin");
  const email = asString(record.email, "admin@gmail.com");
  const role = normalizeSystemStaffRole(record.role);

  return {
    id: asString(record.id ?? record.userId ?? record.user_id),
    fullName,
    email,
    role,
    initials: asString(record.initials, getInitials(fullName, email)),
  };
}

async function requestJson<T>(path: string, init: RequestInit = {}) {
  return authJson<T>(apiUrl(path), {
    cache: "no-store",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
}

function body(value: unknown) {
  return JSON.stringify(value);
}

function buildClientPayload(input: CreateAdminClientInput | UpdateAdminClientInput) {
  return {
    ...(input.restaurantName !== undefined && { restaurantName: input.restaurantName }),
    ...(input.ownerName !== undefined && { contactPersonName: input.ownerName }),
    ...(input.loginEmail !== undefined && { email: input.loginEmail }),
    ...("temporaryPassword" in input && input.temporaryPassword !== undefined && { password: input.temporaryPassword }),
    ...(input.phone !== undefined && { contactPersonMobileNumber: input.phone }),
    ...(input.businessType !== undefined && { businessType: input.businessType }),
    ...(input.location !== undefined && { location: input.location }),
    ...(input.address !== undefined && { address: input.address }),
    ...(input.businessEmail !== undefined && { businessEmail: input.businessEmail }),
    ...(input.packageName !== undefined && { packageName: input.packageName }),
    ...(input.status !== undefined && { status: input.status }),
  };
}

function buildSystemStaffPayload(input: CreateSystemStaffUserInput | UpdateSystemStaffUserInput) {
  return {
    ...(input.fullName !== undefined && { fullName: input.fullName }),
    ...(input.email !== undefined && { email: input.email }),
    ...("password" in input && input.password !== undefined && { password: input.password }),
    ...(input.role !== undefined && { role: input.role }),
    ...(input.status !== undefined && { status: input.status }),
  };
}

export async function getAdminClients() {
  const payload = await requestJson<unknown>(API_ROUTES.systemAdmin.clients);
  return unwrapList(payload).map(toAdminClient).filter((client): client is AdminClient => Boolean(client));
}

export async function createAdminClient(input: CreateAdminClientInput) {
  const payload = await requestJson<unknown>(API_ROUTES.systemAdmin.clients, {
    method: "POST",
    body: body(buildClientPayload(input)),
  });
  return toAdminClient(unwrapData(payload)) ?? (await getAdminClients()).find((client) => client.loginEmail === input.loginEmail) ?? null;
}

export async function updateAdminClient(clientId: string, input: UpdateAdminClientInput) {
  const payload = await requestJson<unknown>(API_ROUTES.systemAdmin.client(clientId), {
    method: "PATCH",
    body: body(buildClientPayload(input)),
  });
  return toAdminClient(unwrapData(payload));
}

export async function deleteAdminClient(clientId: string) {
  await requestJson<unknown>(API_ROUTES.systemAdmin.client(clientId), {
    method: "DELETE",
  });
}

export async function getSystemStaffUsers() {
  const payload = await requestJson<unknown>(API_ROUTES.systemAdmin.users);
  return unwrapList(payload).map(toSystemStaffUser).filter((user): user is SystemStaffUser => Boolean(user));
}

export async function createSystemStaffUser(input: CreateSystemStaffUserInput) {
  const payload = await requestJson<unknown>(API_ROUTES.systemAdmin.users, {
    method: "POST",
    body: body(buildSystemStaffPayload(input)),
  });
  return toSystemStaffUser(unwrapData(payload)) ?? (await getSystemStaffUsers()).find((user) => user.email === input.email) ?? null;
}

export async function updateSystemStaffUser(userId: string, input: UpdateSystemStaffUserInput) {
  const payload = await requestJson<unknown>(API_ROUTES.systemAdmin.user(userId), {
    method: "PATCH",
    body: body(buildSystemStaffPayload(input)),
  });
  return toSystemStaffUser(unwrapData(payload));
}

export async function deleteSystemStaffUser(userId: string) {
  await requestJson<unknown>(API_ROUTES.systemAdmin.user(userId), {
    method: "DELETE",
  });
}

export async function getSystemAdminProfile() {
  const payload = await requestJson<unknown>(API_ROUTES.systemAdmin.me);
  return toSystemAdminProfile(payload);
}

export async function updateSystemAdminProfile(input: UpdateSystemAdminProfileInput) {
  const payload = await requestJson<unknown>(API_ROUTES.systemAdmin.profile, {
    method: "PATCH",
    body: body({
      fullName: input.fullName,
      contactPersonName: input.fullName,
      email: input.email,
    }),
  });
  return toSystemAdminProfile(payload);
}

export async function changeSystemAdminPassword(input: ChangeSystemAdminPasswordInput) {
  await requestJson<unknown>(API_ROUTES.systemAdmin.changePassword, {
    method: "PATCH",
    body: body({
      currentPassword: input.currentPassword,
      oldPassword: input.currentPassword,
      newPassword: input.newPassword,
      confirmNewPassword: input.confirmNewPassword,
    }),
  });
}

export async function logoutSystemAdmin() {
  await requestJson<unknown>(API_ROUTES.auth.logout, {
    method: "POST",
  });
}
