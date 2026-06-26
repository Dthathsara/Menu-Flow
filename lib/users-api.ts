import { authJson } from "@/lib/auth-session";
import { apiUrl } from "@/lib/api-config";
import { getSafeImageSrcFromCandidates } from "@/lib/image-url";
import type { RestaurantProfile } from "@/components/manager/settings/settings.types";

const RESTAURANT_PROFILE_URL = apiUrl("/users/me/restaurant-profile");
const RESTAURANT_IMAGE_URL = apiUrl("/users/me/restaurant-image");
const RESTAURANT_PROFILE_CACHE_KEY = "menuflow:restaurantProfile";

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
    hotelName: asString(user.hotelName ?? user.hotel_name),
    businessEmail: asString(user.businessEmail ?? user.business_email),
    businessType: asString(user.businessType ?? user.business_type),
    businessLocation: asString(user.businessLocation ?? user.business_location),
    businessAddress: asString(user.businessAddress ?? user.business_address),
    kitchenOpenTime: asString(user.kitchenOpenTime ?? user.kitchen_open_time),
    kitchenCloseTime: asString(user.kitchenCloseTime ?? user.kitchen_close_time),
    taxRate: asString(user.taxRate ?? user.tax_rate, "5"),
    serviceChargeRate: asString(user.serviceChargeRate ?? user.service_charge_rate, "3"),
    discountRate:
      user.discountRate === undefined || user.discountRate === null
        ? asString(user.discount_rate)
        : asString(user.discountRate),
    restaurantImageUrl: getSafeImageSrcFromCandidates([
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
  window.dispatchEvent(
    new CustomEvent("menuflow:user-updated", { detail: nextUser }),
  );

  return profile;
}

export async function fetchRestaurantProfile() {
  const response = await authJson<unknown>(RESTAURANT_PROFILE_URL);
  return mapRestaurantProfile(response);
}

export async function updateRestaurantProfile(profile: RestaurantProfile) {
  const payload: Record<string, string> = {
    hotelName: profile.hotelName.trim(),
    businessEmail: profile.businessEmail.trim().toLowerCase(),
    businessType: profile.businessType.trim(),
    businessLocation: profile.businessLocation.trim(),
    businessAddress: profile.businessAddress.trim(),
    kitchenOpenTime: profile.kitchenOpenTime.trim(),
    kitchenCloseTime: profile.kitchenCloseTime.trim(),
    taxRate: String(Number(profile.taxRate)),
    serviceChargeRate: String(Number(profile.serviceChargeRate)),
    discountRate:
      profile.discountRate.trim() === "" ? "" : String(Number(profile.discountRate)),
  };

  const response = await authJson<unknown>(RESTAURANT_PROFILE_URL, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const record = unwrapUserProfile(response);
  const hasProfileData = [
    "hotelName",
    "hotel_name",
    "businessEmail",
    "business_email",
    "businessType",
    "business_type",
    "businessLocation",
    "business_location",
    "businessAddress",
    "business_address",
    "restaurantImageUrl",
    "restaurant_image_url",
    "restaurantImage",
    "restaurant_image",
  ].some((key) => record[key] !== undefined);

  return hasProfileData ? mapRestaurantProfile(response) : profile;
}

export async function uploadRestaurantImage(file: File) {
  const payload = new FormData();
  payload.append("image", file);

  const response = await authJson<unknown>(RESTAURANT_IMAGE_URL, {
    method: "PATCH",
    body: payload,
  });

  return mapRestaurantProfile(response);
}
