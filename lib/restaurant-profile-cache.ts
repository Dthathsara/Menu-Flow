import { DEFAULT_RESTAURANT_PROFILE } from "@/components/manager/settings/settings.data";
import type { RestaurantProfile } from "@/components/manager/settings/settings.types";
import { getRestaurantImageUrl } from "@/lib/image-url";
import { mapRestaurantProfile } from "@/lib/users-api";

export const RESTAURANT_PROFILE_CACHE_KEY = "menuflow:restaurantProfile";

function readJsonObject(value: string | null): Record<string, unknown> {
  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

export function normalizeRestaurantProfile(profile: RestaurantProfile): RestaurantProfile {
  return {
    ...DEFAULT_RESTAURANT_PROFILE,
    ...profile,
    restaurantImageUrl: profile.restaurantImageUrl
      ? getRestaurantImageUrl(profile.restaurantImageUrl, "")
      : "",
  };
}

export function readCachedRestaurantProfile(): RestaurantProfile {
  if (typeof window === "undefined") {
    return DEFAULT_RESTAURANT_PROFILE;
  }

  const cachedProfile = readJsonObject(
    window.localStorage.getItem(RESTAURANT_PROFILE_CACHE_KEY),
  );

  if (Object.keys(cachedProfile).length > 0) {
    return normalizeRestaurantProfile(mapRestaurantProfile(cachedProfile));
  }

  const cachedUser = readJsonObject(window.localStorage.getItem("user"));

  if (Object.keys(cachedUser).length > 0) {
    return normalizeRestaurantProfile(mapRestaurantProfile(cachedUser));
  }

  return DEFAULT_RESTAURANT_PROFILE;
}

export function writeCachedRestaurantProfile(profile: RestaurantProfile) {
  if (typeof window === "undefined") {
    return null;
  }

  const normalizedProfile = normalizeRestaurantProfile(profile);
  const storedUser = readJsonObject(window.localStorage.getItem("user"));
  const nextUser = {
    ...storedUser,
    ...normalizedProfile,
  };

  window.localStorage.setItem(
    RESTAURANT_PROFILE_CACHE_KEY,
    JSON.stringify(normalizedProfile),
  );
  window.localStorage.setItem("user", JSON.stringify(nextUser));

  return nextUser;
}

export function dispatchRestaurantProfileUpdated(profile: RestaurantProfile) {
  if (typeof window === "undefined") {
    return;
  }

  const storedUser = readJsonObject(window.localStorage.getItem("user"));
  const detail = {
    ...storedUser,
    ...normalizeRestaurantProfile(profile),
  };

  window.dispatchEvent(
    new CustomEvent("menuflow:restaurant-profile-updated", { detail: profile }),
  );
  window.dispatchEvent(new CustomEvent("menuflow:user-updated", { detail }));
}

export function areRestaurantProfilesEqual(
  first: RestaurantProfile,
  second: RestaurantProfile,
) {
  return (
    first.hotelName === second.hotelName &&
    first.businessEmail === second.businessEmail &&
    first.businessType === second.businessType &&
    first.businessLocation === second.businessLocation &&
    first.businessAddress === second.businessAddress &&
    first.kitchenOpenTime === second.kitchenOpenTime &&
    first.kitchenCloseTime === second.kitchenCloseTime &&
    first.taxRate === second.taxRate &&
    first.serviceChargeRate === second.serviceChargeRate &&
    first.discountRate === second.discountRate &&
    getRestaurantImageUrl(first.restaurantImageUrl, "") ===
      getRestaurantImageUrl(second.restaurantImageUrl, "")
  );
}
