"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  cacheRestaurantProfile,
  fetchRestaurantProfile,
  getCachedRestaurantProfile,
  mapRestaurantProfile,
} from "@/lib/users-api";
import { getRestaurantImageUrl } from "@/lib/image-url";
import { DEFAULT_RESTAURANT_PROFILE } from "./settings/settings.data";
import type { RestaurantProfile } from "./settings/settings.types";

interface RestaurantProfileContextValue {
  restaurantProfile: RestaurantProfile;
  updateRestaurantProfile: (profile: RestaurantProfile) => void;
}

const RestaurantProfileContext =
  createContext<RestaurantProfileContextValue | null>(null);

function withProfileDefaults(profile: RestaurantProfile | null) {
  return {
    ...DEFAULT_RESTAURANT_PROFILE,
    ...(profile ?? {}),
  };
}

function normalizeProfileForCompare(profile: RestaurantProfile) {
  return {
    ...profile,
    restaurantImageUrl: getRestaurantImageUrl(profile.restaurantImageUrl),
  };
}

function areProfilesEqual(left: RestaurantProfile, right: RestaurantProfile) {
  return JSON.stringify(normalizeProfileForCompare(left)) ===
    JSON.stringify(normalizeProfileForCompare(right));
}

export function ManagerRestaurantProfileProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [restaurantProfile, setRestaurantProfile] = useState<RestaurantProfile>(
    DEFAULT_RESTAURANT_PROFILE,
  );

  const updateRestaurantProfile = useCallback((profile: RestaurantProfile) => {
    const nextProfile = withProfileDefaults(profile);

    cacheRestaurantProfile(nextProfile);
    setRestaurantProfile((current) =>
      areProfilesEqual(current, nextProfile) ? current : nextProfile,
    );
  }, []);

  useEffect(() => {
    let active = true;
    const cacheTimeoutId = window.setTimeout(() => {
      if (!active) {
        return;
      }

      const cachedProfile = getCachedRestaurantProfile();

      if (cachedProfile) {
        setRestaurantProfile((current) => {
          const nextProfile = withProfileDefaults(cachedProfile);

          return areProfilesEqual(current, nextProfile) ? current : nextProfile;
        });
      }
    }, 0);

    void fetchRestaurantProfile()
      .then((profile) => {
        if (!active) {
          return;
        }

        const nextProfile = withProfileDefaults(profile);
        cacheRestaurantProfile(nextProfile);
        setRestaurantProfile((current) =>
          areProfilesEqual(current, nextProfile) ? current : nextProfile,
        );
      })
      .catch(() => {
        // Keep the cached profile visible if the backend is unavailable.
      });

    function handleUserUpdated(event: Event) {
      const detail = event instanceof CustomEvent ? event.detail : null;

      if (!detail) {
        return;
      }

      const nextProfile = withProfileDefaults(mapRestaurantProfile(detail));

      setRestaurantProfile((current) =>
        areProfilesEqual(current, nextProfile) ? current : nextProfile,
      );
    }

    window.addEventListener("menuflow:user-updated", handleUserUpdated);

    return () => {
      active = false;
      window.clearTimeout(cacheTimeoutId);
      window.removeEventListener("menuflow:user-updated", handleUserUpdated);
    };
  }, []);

  useEffect(() => {
    const imageUrl = getRestaurantImageUrl(restaurantProfile.restaurantImageUrl, "");

    if (!imageUrl || imageUrl.startsWith("blob:") || imageUrl.startsWith("data:")) {
      return;
    }

    const image = new Image();
    image.decoding = "async";
    image.src = imageUrl;
  }, [restaurantProfile.restaurantImageUrl]);

  const value = useMemo(
    () => ({
      restaurantProfile,
      updateRestaurantProfile,
    }),
    [restaurantProfile, updateRestaurantProfile],
  );

  return (
    <RestaurantProfileContext.Provider value={value}>
      {children}
    </RestaurantProfileContext.Provider>
  );
}

export function useRestaurantProfile() {
  const context = useContext(RestaurantProfileContext);

  if (!context) {
    throw new Error("useRestaurantProfile must be used inside ManagerRestaurantProfileProvider");
  }

  return context;
}
