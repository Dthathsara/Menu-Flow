import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { API_ROUTES, apiUrl } from "@/lib/api-config";
import { getSafeImageSrcFromCandidates } from "@/lib/image-url";

const LAST_ACTIVITY_KEY = "menuflow:lastActivityAt";
const INACTIVITY_LIMIT_MS = 30 * 60 * 1000;
const PROACTIVE_REFRESH_MS = 22 * 60 * 1000;
const ACTIVITY_EVENTS = ["mousemove", "keydown", "click", "scroll", "touchstart"];

let initialized = false;
let refreshPromise: Promise<string> | null = null;

export type AuthRole = "manager" | "waiter" | "chef";

export class SessionExpiredError extends Error {
  constructor(message = "Your session has expired. Please log in again.") {
    super(message);
    this.name = "SessionExpiredError";
  }
}

export class NetworkError extends Error {
  constructor(
    message = "Unable to connect to the server. Please make sure the backend is running.",
  ) {
    super(message);
    this.name = "NetworkError";
  }
}

export class ApiResponseError extends Error {
  status: number;

  data: unknown;

  response: {
    status: number;
    data: unknown;
  };

  request: RequestInfo | URL;

  constructor(message: string, response: Response, data: unknown, request: RequestInfo | URL) {
    super(message);
    this.name = "ApiResponseError";
    this.status = response.status;
    this.data = data;
    this.response = {
      status: response.status,
      data,
    };
    this.request = request;
  }
}

const SAFE_STATUS_MESSAGES: Record<number, string> = {
  400: "Please check the information and try again.",
  401: "Your session has expired. Please log in again.",
  403: "You do not have permission to perform this action.",
  404: "The requested item was not found.",
  409: "This order was already claimed by another chef.",
  422: "Some information is invalid. Please check the form and try again.",
  429: "Too many requests. Please wait a moment and try again.",
  500: "Something went wrong on our side. Please try again later.",
};

function getNow() {
  return Date.now();
}

function getStoredLastActivity() {
  if (typeof window === "undefined") {
    return getNow();
  }

  const value = Number(window.localStorage.getItem(LAST_ACTIVITY_KEY));
  return Number.isFinite(value) && value > 0 ? value : getNow();
}

function markActivity() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LAST_ACTIVITY_KEY, String(getNow()));
}

function isSessionActive() {
  return getNow() - getStoredLastActivity() <= INACTIVITY_LIMIT_MS;
}

function clearStoredSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem("accessToken");
  window.localStorage.removeItem("refreshToken");
  window.localStorage.removeItem("user");
}

export function clearAuthSession() {
  clearStoredSession();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function authString(value: unknown, fallback = "") {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return fallback;
}

function normalizeApiErrorText(value: string) {
  const normalized = value.replace(/\s+/g, " ").trim();
  const lower = normalized.toLowerCase();

  if (
    !normalized ||
    normalized === "[object Object]" ||
    /cannot\s+(get|post|put|patch|delete)\s+\/api\//i.test(normalized) ||
    (normalized.startsWith("{") && normalized.endsWith("}")) ||
    (normalized.startsWith("[") && normalized.endsWith("]")) ||
    lower.includes('"statuscode"') ||
    lower.includes('"timestamp"') ||
    lower.includes("prisma") ||
    lower.includes("invocation") ||
    lower.includes("does not exist in the current database")
  ) {
    return "";
  }

  return normalized;
}

function extractSafeApiMessage(value: unknown): string {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return normalizeApiErrorText(value);
  }

  if (value instanceof Error) {
    return normalizeApiErrorText(value.message);
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => extractSafeApiMessage(item))
      .filter(Boolean)
      .join("\n");
  }

  if (!isRecord(value)) {
    return "";
  }

  return (
    extractSafeApiMessage(value.message) ||
    extractSafeApiMessage(value.error) ||
    extractSafeApiMessage(value.errors)
  );
}

function getSafeApiStatusMessage(status: number) {
  return SAFE_STATUS_MESSAGES[status] ?? "Request failed. Please try again.";
}

export function normalizeAuthRole(value: unknown): AuthRole | "" {
  const role = authString(value).trim().toLowerCase();

  if (role === "manager" || role === "waiter" || role === "chef") {
    return role;
  }

  return "";
}

export function getDashboardPathForRole(role: unknown) {
  const normalizedRole = normalizeAuthRole(role);

  if (normalizedRole === "manager") {
    return "/manager/dashboard";
  }

  if (normalizedRole === "waiter") {
    return "/waiter/dashboard";
  }

  if (normalizedRole === "chef") {
    return "/chef/dashboard";
  }

  return "";
}

export function normalizeAuthUser(user: unknown) {
  if (!user) {
    return null;
  }

  const rawUser = isRecord(user) ? user : {};

  return {
    id: authString(rawUser.id),
    userId: authString(rawUser.userId ?? rawUser.user_id ?? rawUser.id),
    managerId: authString(rawUser.managerId ?? rawUser.manager_id ?? rawUser.createdByManagerId ?? rawUser.created_by_manager_id),
    name: authString(rawUser.name ?? rawUser.fullName ?? rawUser.full_name ?? rawUser.contactPersonName ?? rawUser.contact_person_name),
    email: authString(rawUser.email),
    businessEmail: authString(rawUser.businessEmail ?? rawUser.business_email),
    role: authString(rawUser.role),
    tenantId: authString(
      rawUser.tenantId ??
        rawUser.tenant_id ??
        rawUser.restaurantId ??
        rawUser.restaurant_id ??
        rawUser.hotelId ??
        rawUser.hotel_id,
    ),
    restaurantId: authString(
      rawUser.restaurantId ??
        rawUser.restaurant_id ??
        rawUser.tenantId ??
        rawUser.tenant_id ??
        rawUser.hotelId ??
        rawUser.hotel_id,
    ),
    branchId: authString(rawUser.branchId ?? rawUser.branch_id),
    restaurantName: authString(
      rawUser.restaurantName ?? rawUser.restaurant_name ?? rawUser.hotelName ?? rawUser.hotel_name,
    ),
    hotelName: authString(rawUser.hotelName ?? rawUser.hotel_name),
    contactPersonName:
      authString(
        rawUser.contactPersonName ??
          rawUser.contact_person_name ??
          rawUser.name ??
          rawUser.fullName ??
          rawUser.full_name,
      ),
    contactPersonMobileNumber:
      authString(
        rawUser.contactPersonMobileNumber ??
          rawUser.contact_person_mobile_number ??
          rawUser.phone ??
          rawUser.contactNumber ??
          rawUser.contact_number,
      ),
    businessType: authString(rawUser.businessType ?? rawUser.business_type),
    location: authString(
      rawUser.location ?? rawUser.businessLocation ?? rawUser.business_location,
    ),
    address: authString(
      rawUser.address ?? rawUser.businessAddress ?? rawUser.business_address,
    ),
    openingTime: authString(
      rawUser.openingTime ??
        rawUser.opening_time ??
        rawUser.kitchenOpenTime ??
        rawUser.kitchen_open_time,
    ),
    closingTime: authString(
      rawUser.closingTime ??
        rawUser.closing_time ??
        rawUser.kitchenCloseTime ??
        rawUser.kitchen_close_time,
    ),
    taxPercentage: Number(
      rawUser.taxPercentage ?? rawUser.tax_percentage ?? rawUser.taxRate ?? rawUser.tax_rate ?? 5,
    ),
    serviceChargePercentage: Number(
      rawUser.serviceChargePercentage ??
        rawUser.service_charge_percentage ??
        rawUser.serviceChargeRate ??
        rawUser.service_charge_rate ??
        3,
    ),
    discountPercentage:
      rawUser.discountPercentage ??
      rawUser.discount_percentage ??
      rawUser.discountRate ??
      rawUser.discount_rate ??
      null,
    restaurantImageUrl: getSafeImageSrcFromCandidates([
      rawUser.restaurantImageUrl,
      rawUser.restaurant_image_url,
      rawUser.restaurantImage,
      rawUser.restaurant_image,
      rawUser.logoUrl,
      rawUser.logo_url,
      rawUser.logo,
      rawUser.image,
      rawUser.avatar,
    ]),
  };
}

function getAuthPayloadRecord(data: unknown) {
  if (!isRecord(data)) {
    return {};
  }

  if (isRecord(data.data)) {
    return {
      ...data,
      ...data.data,
    };
  }

  return data;
}

function getAuthUserSource(record: Record<string, unknown>) {
  if (isRecord(record.user)) {
    return record.user;
  }

  if (isRecord(record.authUser)) {
    return record.authUser;
  }

  if (isRecord(record.profile)) {
    return record.profile;
  }

  if (record.role) {
    return record;
  }

  return null;
}

function getRefreshToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem("refreshToken") || "";
}

export function storeAuthResponse(data: unknown) {
  if (typeof window === "undefined" || !data || typeof data !== "object") {
    return "";
  }

  const record = getAuthPayloadRecord(data);
  const accessToken =
    typeof record.accessToken === "string"
      ? record.accessToken
      : typeof record.access_token === "string"
        ? record.access_token
        : typeof record.token === "string"
          ? record.token
          : "";
  const refreshToken =
    typeof record.refreshToken === "string"
      ? record.refreshToken
      : typeof record.refresh_token === "string"
        ? record.refresh_token
        : "";

  if (accessToken) {
    window.localStorage.setItem("accessToken", accessToken);
  }

  if (refreshToken) {
    window.localStorage.setItem("refreshToken", refreshToken);
  }

  const userSource = getAuthUserSource(record);

  if (userSource) {
    const user = normalizeAuthUser(userSource);
    window.localStorage.setItem("user", JSON.stringify(user));
    window.dispatchEvent(
      new CustomEvent("menuflow:user-updated", { detail: user }),
    );
  }

  return accessToken;
}

export function getStoredAuthUser() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return normalizeAuthUser(JSON.parse(window.localStorage.getItem("user") || "null"));
  } catch {
    return null;
  }
}

export function getStoredAuthRole() {
  return normalizeAuthRole(getStoredAuthUser()?.role);
}

export function getAccessToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem("accessToken") || "";
}

export function signOutForExpiredSession() {
  clearStoredSession();
  throw new SessionExpiredError();
}

export async function refreshAccessToken() {
  if (typeof window === "undefined") {
    throw new SessionExpiredError();
  }

  if (!isSessionActive()) {
    signOutForExpiredSession();
  }

  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    signOutForExpiredSession();
  }

  refreshPromise = axios
    .post(apiUrl(API_ROUTES.auth.refresh), { refreshToken })
    .then((response) => {
      const accessToken = storeAuthResponse(response.data);

      if (!accessToken) {
        throw new SessionExpiredError();
      }

      return accessToken;
    })
    .catch((error) => {
      clearStoredSession();

      if (error instanceof SessionExpiredError) {
        throw error;
      }

      throw new SessionExpiredError();
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

export function initializeSessionActivity() {
  if (typeof window === "undefined" || initialized) {
    return;
  }

  initialized = true;
  markActivity();

  for (const eventName of ACTIVITY_EVENTS) {
    window.addEventListener(eventName, markActivity, { passive: true });
  }

  window.setInterval(() => {
    if (!getAccessToken() || !getRefreshToken() || !isSessionActive()) {
      return;
    }

    void refreshAccessToken().catch(() => {
      clearStoredSession();
    });
  }, PROACTIVE_REFRESH_MS);
}

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  if (!isSessionActive()) {
    signOutForExpiredSession();
  }

  const headers = new Headers(init.headers);
  const accessToken = getAccessToken();

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  let response: Response;

  try {
    response = await fetch(input, {
      ...init,
      headers,
      credentials: init.credentials ?? "include",
    });
  } catch {
    throw new NetworkError();
  }

  if (response.status !== 401) {
    return response;
  }

  const nextAccessToken = await refreshAccessToken();
  headers.set("Authorization", `Bearer ${nextAccessToken}`);
  try {
    response = await fetch(input, {
      ...init,
      headers,
      credentials: init.credentials ?? "include",
    });
  } catch {
    throw new NetworkError();
  }

  if (response.status === 401) {
    signOutForExpiredSession();
  }

  return response;
}

export async function authJson<T>(input: RequestInfo | URL, init: RequestInit = {}) {
  const response = await authFetch(input, init);
  const text = await response.text();
  let data: unknown = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message = extractSafeApiMessage(data) || getSafeApiStatusMessage(response.status);

    throw new ApiResponseError(message, response, data, input);
  }

  return data as T;
}

export function createAuthenticatedAxios(config?: AxiosRequestConfig): AxiosInstance {
  const instance = axios.create(config);

  instance.interceptors.request.use((requestConfig: InternalAxiosRequestConfig) => {
    if (typeof window === "undefined") {
      return requestConfig;
    }

    if (!isSessionActive()) {
      signOutForExpiredSession();
    }

    const token = getAccessToken();

    if (!token) {
      throw new SessionExpiredError("Please log in again.");
    }

    requestConfig.headers.Authorization = `Bearer ${token}`;
    return requestConfig;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as
        | (AxiosRequestConfig & { _menuflowRetried?: boolean })
        | undefined;

      if (
        error.response?.status !== 401 ||
        !originalRequest ||
        originalRequest._menuflowRetried
      ) {
        throw error;
      }

      originalRequest._menuflowRetried = true;
      const nextAccessToken = await refreshAccessToken();
      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${nextAccessToken}`,
      };

      return instance(originalRequest);
    },
  );

  return instance;
}
