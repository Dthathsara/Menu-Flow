import { API_ROUTES, apiUrl } from "@/lib/api-config";
import { authJson } from "@/lib/auth-session";

export type AdminClientPackage = string;
export type AdminClientStatus = "Active" | "Pending" | "Inactive";
export type SystemStaffRole = "SUPER_ADMIN" | "ADMIN" | "SUPPORT" | "FINANCE";
export type SystemStaffStatus = "Active" | "Inactive";

export interface AdminClient {
  id: string;
  tenantId?: string;
  restaurantId?: string;
  restaurantName: string;
  ownerName: string;
  loginEmail: string;
  businessEmail: string;
  businessType: string;
  location: string;
  address: string;
  phone: string;
  packageId?: string;
  packageCode?: string;
  packageName: string;
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
  packageId?: string;
  packageCode?: string;
  packageName?: string;
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

  for (const key of ["items", "records", "clients", "users", "staffUsers", "systemStaffUsers", "packages", "data"]) {
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

function normalizeStatus<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  const str = asString(value).trim().toLowerCase();
  const matched = allowed.find((item) => item.toLowerCase() === str);
  return matched ?? fallback;
}

function normalizeDate(value: unknown): string {
  const raw = asString(value).trim();
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

function getInitials(fullName: string, email = ""): string {
  const source = fullName.trim() || email.trim();
  if (!source) return "A";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  if (parts.length === 1 && parts[0]) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return source[0]?.toUpperCase() || "A";
}

function extractPackageInfo(value: unknown): { packageId?: string; packageCode?: string; packageName: string } {
  if (isRecord(value)) {
    const pkgObj = isRecord(value.package) ? value.package : null;
    const packageId = asString(pkgObj?.id ?? value.packageId ?? value.package_id) || undefined;
    const packageCode = asString(pkgObj?.code ?? value.packageCode ?? value.package_code) || undefined;
    const rawName = asString(pkgObj?.name ?? pkgObj?.packageName ?? value.packageName ?? value.package_name ?? value.name);
    const packageName = rawName || (packageCode ? titleCaseToken(packageCode) : "");
    return {
      packageId,
      packageCode,
      packageName,
    };
  }
  const rawStr = asString(value).trim();
  return { packageName: rawStr ? titleCaseToken(rawStr) : "" };
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

  const pkgInfo = extractPackageInfo(value);
  const tenantId = asString(
    value.tenantId ??
      value.tenant_id ??
      value.restaurantId ??
      value.restaurant_id ??
      (isRecord(value.tenant) ? value.tenant.id : "") ??
      (isRecord(value.restaurant) ? value.restaurant.id : ""),
  );

  return {
    id,
    tenantId: tenantId || undefined,
    restaurantId: tenantId || undefined,
    restaurantName: asString(value.restaurantName ?? value.restaurant_name ?? value.businessName ?? value.business_name ?? value.hotelName ?? value.hotel_name),
    ownerName: asString(value.ownerName ?? value.owner_name ?? value.contactPersonName ?? value.contact_person_name ?? value.name ?? value.fullName ?? value.full_name),
    loginEmail: asString(value.loginEmail ?? value.login_email ?? value.email),
    businessEmail: asString(value.businessEmail ?? value.business_email ?? value.publicBusinessEmail ?? value.public_business_email),
    businessType: asString(value.businessType ?? value.business_type),
    location: asString(value.location ?? value.businessLocation ?? value.business_location),
    address: asString(value.address ?? value.businessAddress ?? value.business_address),
    phone: asString(value.phone ?? value.contactPersonMobileNumber ?? value.contact_person_mobile_number ?? value.contactNumber ?? value.contact_number),
    packageId: pkgInfo.packageId,
    packageCode: pkgInfo.packageCode,
    packageName: pkgInfo.packageName,
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

const inFlightSystemAdminRequests = new Map<string, Promise<unknown>>();

async function requestJson<T>(path: string, init: RequestInit = {}) {
  const method = (init.method || "GET").toUpperCase();
  const cacheKey = `${method}:${path}`;

  if (method === "GET" && inFlightSystemAdminRequests.has(cacheKey)) {
    return inFlightSystemAdminRequests.get(cacheKey) as Promise<T>;
  }

  const promise = (async () => {
    try {
      return await authJson<T>(apiUrl(path), {
        cache: "no-store",
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...init.headers,
        },
      });
    } finally {
      if (method === "GET") {
        inFlightSystemAdminRequests.delete(cacheKey);
      }
    }
  })();

  if (method === "GET") {
    inFlightSystemAdminRequests.set(cacheKey, promise);
  }

  return promise;
}

function body(value: unknown) {
  return JSON.stringify(value);
}

function buildClientPayload(input: CreateAdminClientInput | UpdateAdminClientInput) {
  const statusUpper = input.status ? input.status.toUpperCase() : undefined;
  const packageId = input.packageId?.trim() || undefined;
  const packageCode = input.packageCode?.trim() || undefined;
  const packageName = input.packageName?.trim() || undefined;

  return {
    ...(input.restaurantName !== undefined && { businessName: input.restaurantName }),
    ...(input.ownerName !== undefined && { ownerName: input.ownerName }),
    ...(input.loginEmail !== undefined && { loginEmail: input.loginEmail }),
    ...("temporaryPassword" in input && input.temporaryPassword !== undefined && { password: input.temporaryPassword }),
    ...(input.phone !== undefined && { phone: input.phone }),
    ...(input.businessType !== undefined && { businessType: input.businessType }),
    ...(input.location !== undefined && { location: input.location }),
    ...(input.address !== undefined && { address: input.address }),
    ...(input.businessEmail !== undefined && { businessEmail: input.businessEmail }),
    ...(packageId ? { packageId } : packageCode ? { packageCode } : packageName ? { packageName } : {}),
    ...(statusUpper !== undefined && { status: statusUpper }),
  };
}

function buildSystemStaffPayload(input: CreateSystemStaffUserInput | UpdateSystemStaffUserInput) {
  const statusUpper = input.status ? input.status.toUpperCase() : undefined;
  const roleUpper = input.role ? input.role.toUpperCase() : undefined;

  return {
    ...(input.fullName !== undefined && { fullName: input.fullName }),
    ...(input.email !== undefined && { email: input.email }),
    ...("password" in input && input.password !== undefined && { password: input.password }),
    ...(roleUpper !== undefined && { role: roleUpper }),
    ...(statusUpper !== undefined && { status: statusUpper }),
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

export type SystemAdminPackageStatus = "Active" | "Inactive";

export interface SystemAdminPackage {
  id: string;
  packageName: string;
  packageCode: string;
  description: string;
  price: number | null;
  priceDisplay: string;
  isCustomPrice: boolean;
  taxService: number;
  discount: number;
  billingCycle: string;
  locationLimit: number | null;
  qrTableLimit: number | null;
  status: SystemAdminPackageStatus;
  features: string[];
  featuresSummary: string;
  clients: number;
  sortOrder: number;
}

export interface CreateAdminPackageInput {
  packageName: string;
  packageCode?: string;
  description?: string;
  price?: number | null;
  isCustomPrice?: boolean;
  taxService?: number;
  discount?: number;
  billingCycle?: string;
  locationLimit?: number | null;
  qrTableLimit?: number | null;
  status?: SystemAdminPackageStatus;
  features?: string[];
  sortOrder?: number;
}

export type UpdateAdminPackageInput = Partial<CreateAdminPackageInput>;

function formatPackagePriceDisplay(price: number | null | undefined, isCustomPrice: boolean, billingCycle: string) {
  if (isCustomPrice || price === null || price === undefined || !Number.isFinite(price)) {
    return "Custom price";
  }
  const cycleSuffix = billingCycle.toLowerCase() === "yearly" ? " / year" : billingCycle.toLowerCase() === "monthly" ? " / month" : "";
  return `Rs. ${Math.round(price).toLocaleString("en-LK")}${cycleSuffix}`;
}

function parseFeatures(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => asString(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function toSystemAdminPackage(value: unknown): SystemAdminPackage | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = asString(value.id ?? value.packageId ?? value.package_id);
  const packageName = asString(value.packageName ?? value.package_name ?? value.name ?? value.label, "Unnamed Package");
  if (!id && !packageName) {
    return null;
  }

  const isCustomPrice = Boolean(
    value.isCustomPrice ?? value.is_custom_price ?? value.isCustom ?? value.customPrice ?? (value.price === null || value.price === undefined),
  );
  const rawPrice = value.price ?? value.monthlyPrice ?? value.monthly_price ?? value.amount;
  const price = typeof rawPrice === "number" && Number.isFinite(rawPrice) ? rawPrice : typeof rawPrice === "string" ? Number(rawPrice.replace(/[^\d.-]/g, "")) || null : null;
  const billingCycle = asString(value.billingCycle ?? value.billing_cycle ?? value.cycle, "Monthly");
  const rawStatus = asString(value.status ?? (value.isActive === false ? "Inactive" : "Active")).trim();
  const status: SystemAdminPackageStatus = rawStatus.toLowerCase() === "inactive" ? "Inactive" : "Active";
  const features = parseFeatures(value.features ?? value.featureList ?? value.feature_list);
  const locationLimitRaw = value.locationLimit ?? value.location_limit ?? value.maxLocations ?? value.max_locations;
  const locationLimit = typeof locationLimitRaw === "number" && locationLimitRaw > 0 ? locationLimitRaw : null;
  const qrTableLimitRaw = value.qrTableLimit ?? value.qr_table_limit ?? value.tableLimit ?? value.table_limit ?? value.maxTables ?? value.max_tables;
  const qrTableLimit = typeof qrTableLimitRaw === "number" && qrTableLimitRaw > 0 ? qrTableLimitRaw : null;
  const clients = Number(value.clients ?? value.clientCount ?? value.client_count ?? value.totalClients ?? value.total_clients ?? 0) || 0;

  return {
    id: id || packageName.toLowerCase().replace(/\s+/g, "-"),
    packageName,
    packageCode: asString(value.packageCode ?? value.package_code ?? value.code, packageName.toLowerCase().replace(/[^a-z0-9]+/g, "-")),
    description: asString(value.description ?? value.headlineDescription ?? value.headline_description),
    price: isCustomPrice ? null : price,
    priceDisplay: formatPackagePriceDisplay(price, isCustomPrice, billingCycle),
    isCustomPrice,
    taxService: Number(value.taxService ?? value.tax_service ?? value.taxServiceAmount ?? value.tax_service_amount ?? value.taxAmount ?? value.tax_amount ?? 0) || 0,
    discount: Number(value.discount ?? value.discountAmount ?? value.discount_amount ?? 0) || 0,
    billingCycle,
    locationLimit,
    qrTableLimit,
    status,
    features,
    featuresSummary: features.length > 0 ? features.join(", ") : "No features listed",
    clients,
    sortOrder: Number(value.sortOrder ?? value.sort_order ?? value.tier ?? 0) || 0,
  };
}

function buildPackagePayload(input: CreateAdminPackageInput | UpdateAdminPackageInput) {
  const payload: Record<string, unknown> = {};

  if (input.packageName !== undefined) payload.packageName = input.packageName;
  if (input.packageCode !== undefined) payload.packageCode = input.packageCode;
  if (input.description !== undefined) payload.description = input.description;
  if (input.price !== undefined) payload.price = input.price;
  if (input.isCustomPrice !== undefined) payload.isCustomPrice = input.isCustomPrice;
  if (input.taxService !== undefined) payload.taxService = input.taxService;
  if (input.discount !== undefined) payload.discount = input.discount;
  if (input.billingCycle !== undefined) payload.billingCycle = input.billingCycle;
  if (input.locationLimit !== undefined) payload.locationLimit = input.locationLimit;
  if (input.qrTableLimit !== undefined) payload.qrTableLimit = input.qrTableLimit;
  if (input.status !== undefined) payload.status = input.status;
  if (input.features !== undefined) payload.features = input.features;
  if (input.sortOrder !== undefined) payload.sortOrder = input.sortOrder;

  return payload;
}

export async function getAdminPackages(): Promise<SystemAdminPackage[]> {
  const payload = await requestJson<unknown>(API_ROUTES.systemAdmin.packages);
  return unwrapList(payload).map(toSystemAdminPackage).filter((pkg): pkg is SystemAdminPackage => Boolean(pkg));
}

export async function getAdminPackage(packageId: string): Promise<SystemAdminPackage | null> {
  const payload = await requestJson<unknown>(API_ROUTES.systemAdmin.package(packageId));
  return toSystemAdminPackage(unwrapData(payload));
}

export async function createAdminPackage(input: CreateAdminPackageInput): Promise<SystemAdminPackage | null> {
  const payload = await requestJson<unknown>(API_ROUTES.systemAdmin.packages, {
    method: "POST",
    body: body(buildPackagePayload(input)),
  });
  return toSystemAdminPackage(unwrapData(payload)) ?? (await getAdminPackages()).find((pkg) => pkg.packageName === input.packageName) ?? null;
}

export async function updateAdminPackage(packageId: string, input: UpdateAdminPackageInput): Promise<SystemAdminPackage | null> {
  const payload = await requestJson<unknown>(API_ROUTES.systemAdmin.package(packageId), {
    method: "PATCH",
    body: body(buildPackagePayload(input)),
  });
  return toSystemAdminPackage(unwrapData(payload));
}

export async function deleteAdminPackage(packageId: string): Promise<void> {
  await requestJson<unknown>(API_ROUTES.systemAdmin.package(packageId), {
    method: "DELETE",
  });
}

