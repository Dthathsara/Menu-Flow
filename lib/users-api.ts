import {
  ApiResponseError,
  NetworkError,
  SessionExpiredError,
  authJson,
} from "@/lib/auth-session";
import { apiUrl } from "@/lib/api-config";
import { getSafeImageSrcFromCandidates } from "@/lib/image-url";
import type { RestaurantProfile } from "@/components/manager/settings/settings.types";

const RESTAURANT_PROFILE_URL = apiUrl("/users/me/restaurant-profile");
const RESTAURANT_IMAGE_URL = apiUrl("/users/me/restaurant-image");
const RESTAURANT_PROFILE_CACHE_KEY = "menuflow:restaurantProfile";
export const RESTAURANT_IMAGE_FORM_FIELD_NAME = "image";
export const RESTAURANT_IMAGE_MAX_SIZE_BYTES = 5 * 1024 * 1024;
export const RESTAURANT_IMAGE_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

type ApiRecord = Record<string, unknown>;
type RestaurantProfilePayload = {
  restaurantName?: string;
  location?: string;
  address?: string;
  openingTime?: string;
  closingTime?: string;
  phone?: string;
  website?: string;
  description?: string;
  taxPercentage?: number;
  serviceChargePercentage?: number;
  discountPercentage?: number;
};

const RESTAURANT_PROFILE_ERROR_MESSAGES: Record<number, string> = {
  400: "Some restaurant profile fields are invalid.",
  401: "Your session has expired. Please sign in again.",
  403: "You do not have permission to update this restaurant.",
  413: "The selected image is too large.",
  415: "Unsupported image format.",
  429: "Too many requests. Please wait and try again.",
  500: "Unable to save the restaurant profile right now.",
};

export class RestaurantProfileValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RestaurantProfileValidationError";
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

function addTrimmedText<T extends object, K extends keyof T>(
  payload: T,
  key: K,
  value: string,
  transform?: (value: string) => string,
) {
  const trimmed = value.trim();

  if (!trimmed) {
    return;
  }

  payload[key] = (transform ? transform(trimmed) : trimmed) as T[K];
}

function hasTextChanged(value: string, originalValue?: string) {
  if (originalValue === undefined) {
    return true;
  }

  return value.trim() !== originalValue.trim();
}

function addChangedTrimmedText<T extends object, K extends keyof T>(
  payload: T,
  key: K,
  value: string,
  originalValue?: string,
  transform?: (value: string) => string,
) {
  if (!hasTextChanged(value, originalValue)) {
    return;
  }

  addTrimmedText(payload, key, value, transform);
}

function normalizeTimeInput(value: string, label: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  const normalized = trimmed.replace(/\./g, " ").replace(/\s+/g, " ");
  const twentyFourHourMatch = normalized.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);

  if (twentyFourHourMatch) {
    return `${twentyFourHourMatch[1].padStart(2, "0")}:${twentyFourHourMatch[2]}`;
  }

  const amPmMatch = normalized.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);

  if (amPmMatch) {
    const hour = Number(amPmMatch[1]);
    const minute = Number(amPmMatch[2] ?? "0");

    if (hour >= 1 && hour <= 12 && minute >= 0 && minute <= 59) {
      const hour24 =
        amPmMatch[3].toLowerCase() === "pm"
          ? hour === 12
            ? 12
            : hour + 12
          : hour === 12
            ? 0
            : hour;

      return `${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    }
  }

  throw new RestaurantProfileValidationError(
    `${label} must be a valid time such as 08:00 or 8:00 AM.`,
  );
}

function parsePercentageInput(value: string, label: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  const parsed = Number(trimmed);

  if (!Number.isFinite(parsed)) {
    throw new RestaurantProfileValidationError(`${label} must be a number.`);
  }

  if (parsed < 0 || parsed > 100) {
    throw new RestaurantProfileValidationError(`${label} must be between 0 and 100.`);
  }

  return parsed;
}

function hasPercentageChanged(value: string, originalValue?: string) {
  if (originalValue === undefined) {
    return true;
  }

  return value.trim() !== originalValue.trim();
}

function isDevelopmentMode() {
  return process.env.NODE_ENV !== "production";
}

function logRestaurantProfileApiFailure(
  endpoint: string,
  error: unknown,
  payloadFieldNames: string[],
) {
  if (!isDevelopmentMode()) {
    return;
  }

  if (error instanceof ApiResponseError) {
    console.error("Restaurant profile request failed", {
      endpoint,
      status: error.status,
      responseBody: error.data,
      payloadFieldNames,
    });
    return;
  }

  console.error("Restaurant profile request failed", {
    endpoint,
    status: null,
    responseBody: error instanceof Error ? error.message : error,
    payloadFieldNames,
  });
}

export function getRestaurantProfileSaveErrorMessage(error: unknown) {
  if (error instanceof RestaurantProfileValidationError) {
    return error.message;
  }

  if (error instanceof SessionExpiredError) {
    return RESTAURANT_PROFILE_ERROR_MESSAGES[401];
  }

  if (error instanceof NetworkError) {
    return "Unable to connect to the server. Please make sure the backend is running.";
  }

  if (error instanceof ApiResponseError) {
    if (error.status === 400 && hasBackendValidationMessages(error.data)) {
      return "Some restaurant profile fields are invalid.";
    }

    return (
      RESTAURANT_PROFILE_ERROR_MESSAGES[error.status] ??
      "Unable to save the restaurant profile right now."
    );
  }

  return "Unable to save the restaurant profile right now.";
}

export function validateRestaurantImageFile(file: File) {
  if (!RESTAURANT_IMAGE_ALLOWED_TYPES.includes(file.type as typeof RESTAURANT_IMAGE_ALLOWED_TYPES[number])) {
    return "Unsupported image format.";
  }

  if (file.size > RESTAURANT_IMAGE_MAX_SIZE_BYTES) {
    return "The selected image is too large.";
  }

  return "";
}

export function buildRestaurantProfilePayload(
  profile: RestaurantProfile,
  originalProfile?: RestaurantProfile,
): RestaurantProfilePayload {
  const payload: RestaurantProfilePayload = {};
  const openingTime = normalizeTimeInput(profile.openingTime, "Opening time");
  const closingTime = normalizeTimeInput(profile.closingTime, "Closing time");
  const taxPercentage = parsePercentageInput(profile.taxPercentage, "Tax percentage");
  const serviceChargePercentage = parsePercentageInput(
    profile.serviceChargePercentage,
    "Service charge percentage",
  );
  const discountPercentage = parsePercentageInput(
    profile.discountPercentage,
    "Discount percentage",
  );

  addChangedTrimmedText(
    payload,
    "restaurantName",
    profile.restaurantName,
    originalProfile?.restaurantName,
  );
  addChangedTrimmedText(payload, "location", profile.location, originalProfile?.location);
  addChangedTrimmedText(payload, "address", profile.address, originalProfile?.address);
  addChangedTrimmedText(
    payload,
    "description",
    profile.description,
    originalProfile?.description,
  );
  addChangedTrimmedText(payload, "phone", profile.phone, originalProfile?.phone);
  addChangedTrimmedText(payload, "website", profile.website, originalProfile?.website);

  if (
    openingTime !== undefined &&
    hasTextChanged(profile.openingTime, originalProfile?.openingTime)
  ) {
    payload.openingTime = openingTime;
  }

  if (
    closingTime !== undefined &&
    hasTextChanged(profile.closingTime, originalProfile?.closingTime)
  ) {
    payload.closingTime = closingTime;
  }

  if (
    taxPercentage !== undefined &&
    hasPercentageChanged(profile.taxPercentage, originalProfile?.taxPercentage)
  ) {
    payload.taxPercentage = taxPercentage;
  }

  if (
    serviceChargePercentage !== undefined &&
    hasPercentageChanged(
      profile.serviceChargePercentage,
      originalProfile?.serviceChargePercentage,
    )
  ) {
    payload.serviceChargePercentage = serviceChargePercentage;
  }

  if (
    discountPercentage !== undefined &&
    hasPercentageChanged(profile.discountPercentage, originalProfile?.discountPercentage)
  ) {
    payload.discountPercentage = discountPercentage;
  }

  return payload;
}

function unwrapUserProfile(payload: unknown): ApiRecord {
  const data = isRecord(payload) && isRecord(payload.data) ? payload.data : payload;

  if (!isRecord(data)) {
    return {};
  }

  if (isRecord(data.profile)) {
    return data.profile;
  }

  if (isRecord(data.restaurantProfile)) {
    return data.restaurantProfile;
  }

  if (isRecord(data.user)) {
    return data.user;
  }

  return data;
}

export function mapRestaurantProfile(payload: unknown): RestaurantProfile {
  const user = unwrapUserProfile(payload);

  return {
    restaurantName: asString(
      user.restaurantName ?? user.restaurant_name ?? user.hotelName ?? user.hotel_name,
    ),
    businessEmail: asString(user.businessEmail ?? user.business_email),
    phone: asString(
      user.phone ??
        user.businessPhone ??
        user.business_phone ??
        user.contactPersonMobileNumber ??
        user.contact_person_mobile_number,
    ),
    website: asString(user.website ?? user.businessWebsite ?? user.business_website),
    description: asString(
      user.description ?? user.businessDescription ?? user.business_description,
    ),
    businessType: asString(user.businessType ?? user.business_type),
    location: asString(user.location ?? user.businessLocation ?? user.business_location),
    address: asString(user.address ?? user.businessAddress ?? user.business_address),
    openingTime: asString(
      user.openingTime ?? user.opening_time ?? user.kitchenOpenTime ?? user.kitchen_open_time,
    ),
    closingTime: asString(
      user.closingTime ?? user.closing_time ?? user.kitchenCloseTime ?? user.kitchen_close_time,
    ),
    taxPercentage: asString(
      user.taxPercentage ?? user.tax_percentage ?? user.taxRate ?? user.tax_rate,
      "5",
    ),
    serviceChargePercentage: asString(
      user.serviceChargePercentage ??
        user.service_charge_percentage ??
        user.serviceChargeRate ??
        user.service_charge_rate,
      "3",
    ),
    discountPercentage:
      user.discountPercentage === undefined || user.discountPercentage === null
        ? asString(user.discount_percentage ?? user.discountRate ?? user.discount_rate)
        : asString(user.discountPercentage),
    restaurantImageUrl: getSafeImageSrcFromCandidates([
      user.imageUrl,
      user.image_url,
      user.restaurantImageUrl,
      user.restaurant_image_url,
      user.restaurantImage,
      user.restaurant_image,
      user.logoUrl,
      user.logo_url,
      user.logo,
      user.image,
      user.avatar,
    ]),
  };
}

export function getCachedRestaurantProfile() {
  if (typeof window === "undefined") {
    return null;
  }

  const cachedProfile = window.localStorage.getItem(RESTAURANT_PROFILE_CACHE_KEY);

  if (cachedProfile) {
    try {
      return mapRestaurantProfile(JSON.parse(cachedProfile));
    } catch {
      window.localStorage.removeItem(RESTAURANT_PROFILE_CACHE_KEY);
    }
  }

  const storedUser = window.localStorage.getItem("user");

  if (!storedUser) {
    return null;
  }

  try {
    return mapRestaurantProfile(JSON.parse(storedUser));
  } catch {
    return null;
  }
}

export function cacheRestaurantProfile(profile: RestaurantProfile) {
  if (typeof window === "undefined") {
    return profile;
  }

  window.localStorage.setItem(RESTAURANT_PROFILE_CACHE_KEY, JSON.stringify(profile));

  const storedUser = window.localStorage.getItem("user");
  let storedUserObject: Record<string, unknown> = {};

  if (storedUser) {
    try {
      storedUserObject = JSON.parse(storedUser) as Record<string, unknown>;
    } catch {
      storedUserObject = {};
    }
  }

  const nextUser = {
    ...storedUserObject,
    ...profile,
  };

  window.localStorage.setItem("user", JSON.stringify(nextUser));

  return nextUser;
}

export async function fetchRestaurantProfile() {
  const response = await authJson<unknown>(RESTAURANT_PROFILE_URL);
  return mapRestaurantProfile(response);
}

export async function updateRestaurantProfile(
  profile: RestaurantProfile,
  originalProfile?: RestaurantProfile,
) {
  const payload = buildRestaurantProfilePayload(profile, originalProfile);
  let response: unknown;

  if (Object.keys(payload).length === 0) {
    return originalProfile ?? profile;
  }

  try {
    response = await authJson<unknown>(RESTAURANT_PROFILE_URL, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    logRestaurantProfileApiFailure(
      RESTAURANT_PROFILE_URL,
      error,
      Object.keys(payload),
    );
    throw error;
  }

  const record = unwrapUserProfile(response);
  const hasProfileData = [
    "hotelName",
    "hotel_name",
    "restaurantName",
    "restaurant_name",
    "businessEmail",
    "business_email",
    "businessType",
    "business_type",
    "businessPhone",
    "business_phone",
    "phone",
    "website",
    "businessWebsite",
    "business_website",
    "description",
    "businessDescription",
    "business_description",
    "businessLocation",
    "business_location",
    "location",
    "businessAddress",
    "business_address",
    "address",
    "openingTime",
    "opening_time",
    "closingTime",
    "closing_time",
    "taxPercentage",
    "tax_percentage",
    "serviceChargePercentage",
    "service_charge_percentage",
    "discountPercentage",
    "discount_percentage",
    "restaurantImageUrl",
    "restaurant_image_url",
    "restaurantImage",
    "restaurant_image",
  ].some((key) => record[key] !== undefined);

  return hasProfileData ? mapRestaurantProfile(response) : profile;
}

export async function uploadRestaurantImage(file: File) {
  const validationMessage = validateRestaurantImageFile(file);

  if (validationMessage) {
    throw new RestaurantProfileValidationError(validationMessage);
  }

  const payload = new FormData();
  payload.append(RESTAURANT_IMAGE_FORM_FIELD_NAME, file);

  let response: unknown;

  try {
    response = await authJson<unknown>(RESTAURANT_IMAGE_URL, {
      method: "PATCH",
      body: payload,
    });
  } catch (error) {
    logRestaurantProfileApiFailure(
      RESTAURANT_IMAGE_URL,
      error,
      [RESTAURANT_IMAGE_FORM_FIELD_NAME],
    );
    throw error;
  }

  return mapRestaurantProfile(response);
}

function hasBackendValidationMessages(value: unknown): boolean {
  if (!value) {
    return false;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (!isRecord(value)) {
    return false;
  }

  const message = value.message;

  if (Array.isArray(message)) {
    return message.length > 0;
  }

  if (typeof message === "string") {
    return message.toLowerCase().includes("should not exist");
  }

  return hasBackendValidationMessages(value.errors);
}
