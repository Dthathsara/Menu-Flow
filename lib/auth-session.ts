import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { API_BASE_URL } from "@/lib/api-config";
import { getSafeImageSrcFromCandidates } from "@/lib/image-url";

const LAST_ACTIVITY_KEY = "menuflow:lastActivityAt";
const INACTIVITY_LIMIT_MS = 30 * 60 * 1000;
const PROACTIVE_REFRESH_MS = 22 * 60 * 1000;
const ACTIVITY_EVENTS = ["mousemove", "keydown", "click", "scroll", "touchstart"];

let initialized = false;
let refreshPromise: Promise<string> | null = null;

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
  response: {
    status: number;
    data: unknown;
  };

  request: RequestInfo | URL;

  constructor(message: string, response: Response, data: unknown, request: RequestInfo | URL) {
    super(message);
    this.name = "ApiResponseError";
    this.response = {
      status: response.status,
      data,
    };
    this.request = request;
  }
}

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

function authString(value: unknown, fallback = "") {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return fallback;
}

export function normalizeAuthUser(user: unknown) {
  if (!user) {
    return null;
  }

  const rawUser = user as Record<string, unknown>;

  return {
    id: authString(rawUser.id),
    email: authString(rawUser.email),
    businessEmail: authString(rawUser.businessEmail ?? rawUser.business_email),
    role: authString(rawUser.role, "MANAGER"),
    tenantId: authString(rawUser.tenantId ?? rawUser.tenant_id),
    hotelName: authString(rawUser.hotelName ?? rawUser.hotel_name),
    contactPersonName:
      authString(rawUser.contactPersonName ?? rawUser.contact_person_name),
    contactPersonMobileNumber:
      authString(rawUser.contactPersonMobileNumber ?? rawUser.contact_person_mobile_number),
    businessType: authString(rawUser.businessType ?? rawUser.business_type),
    businessLocation: authString(rawUser.businessLocation ?? rawUser.business_location),
    businessAddress: authString(rawUser.businessAddress ?? rawUser.business_address),
    kitchenOpenTime: authString(rawUser.kitchenOpenTime ?? rawUser.kitchen_open_time),
    kitchenCloseTime: authString(rawUser.kitchenCloseTime ?? rawUser.kitchen_close_time),
    taxRate: Number(rawUser.taxRate ?? rawUser.tax_rate ?? 5),
    serviceChargeRate: Number(rawUser.serviceChargeRate ?? rawUser.service_charge_rate ?? 3),
    discountRate: rawUser.discountRate ?? rawUser.discount_rate ?? null,
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

function getRefreshToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem("refreshToken") || "";
}

function storeAuthResponse(data: unknown) {
  if (typeof window === "undefined" || !data || typeof data !== "object") {
    return "";
  }

  const record = data as Record<string, unknown>;
  const accessToken =
    typeof record.accessToken === "string"
      ? record.accessToken
      : typeof record.access_token === "string"
        ? record.access_token
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

  if (record.user && typeof record.user === "object") {
    const user = normalizeAuthUser(record.user);
    window.localStorage.setItem("user", JSON.stringify(user));
    window.dispatchEvent(
      new CustomEvent("menuflow:user-updated", { detail: user }),
    );
  }

  return accessToken;
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
    .post(`${API_BASE_URL}/auth/refresh`, { refreshToken })
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
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message =
      data && typeof data === "object"
        ? String(
            (data as Record<string, unknown>).message ??
              (data as Record<string, unknown>).error ??
              "Request failed.",
          )
        : "Request failed.";

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
