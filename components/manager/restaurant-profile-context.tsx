"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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

function isValidRestaurantImageUrl(value?: string | null) {
  const normalized = getRestaurantImageUrl(value, "");

  return Boolean(normalized);
}

function mergeProfilePreservingImage(
  current: RestaurantProfile,
  incoming: RestaurantProfile | null,
) {
  const nextProfile = withProfileDefaults(incoming);

  if (
    !isValidRestaurantImageUrl(nextProfile.restaurantImageUrl) &&
    isValidRestaurantImageUrl(current.restaurantImageUrl)
  ) {
    return {
      ...nextProfile,
      restaurantImageUrl: current.restaurantImageUrl,
    };
  }

  return nextProfile;
}

function mergeProfileAllowingImageClear(incoming: RestaurantProfile | null) {
  return withProfileDefaults(incoming);
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
  const [hasProfileForSync, setHasProfileForSync] = useState(false);
  const lastSyncedProfileRef = useRef("");

  const updateRestaurantProfile = useCallback((profile: RestaurantProfile) => {
    setHasProfileForSync(true);
    setRestaurantProfile((current) => {
      const nextProfile = mergeProfileAllowingImageClear(profile);

      return areProfilesEqual(current, nextProfile) ? current : nextProfile;
    });
  }, []);

  useEffect(() => {
    let active = true;
    const cacheTimeoutId = window.setTimeout(() => {
      if (!active) {
        return;
      }

      const cachedProfile = getCachedRestaurantProfile();

      if (cachedProfile) {
        setHasProfileForSync(true);
        setRestaurantProfile((current) => {
          const nextProfile = mergeProfilePreservingImage(current, cachedProfile);

          return areProfilesEqual(current, nextProfile) ? current : nextProfile;
        });
      }
    }, 0);

    void fetchRestaurantProfile()
      .then((profile) => {
        if (!active) {
          return;
        }

        setHasProfileForSync(true);
        setRestaurantProfile((current) => {
          const nextProfile = mergeProfilePreservingImage(current, profile);

          return areProfilesEqual(current, nextProfile) ? current : nextProfile;
        });
      })
      .catch(() => {
        // Keep the cached profile visible if the backend is unavailable.
      });

    function handleUserUpdated(event: Event) {
      const detail = event instanceof CustomEvent ? event.detail : null;

      if (!detail) {
        return;
      }

      const incomingProfile = mapRestaurantProfile(detail);

      setHasProfileForSync(true);
      setRestaurantProfile((current) => {
        const nextProfile = mergeProfilePreservingImage(current, incomingProfile);

        return areProfilesEqual(current, nextProfile) ? current : nextProfile;
      });
    }

    window.addEventListener("menuflow:user-updated", handleUserUpdated);

    return () => {
      active = false;
      window.clearTimeout(cacheTimeoutId);
      window.removeEventListener("menuflow:user-updated", handleUserUpdated);
    };
  }, []);

  useEffect(() => {
    if (!hasProfileForSync) {
      return;
    }

    const normalizedProfile = normalizeProfileForCompare(restaurantProfile);
    const profileSnapshot = JSON.stringify(normalizedProfile);

    if (lastSyncedProfileRef.current === profileSnapshot) {
      return;
    }

    lastSyncedProfileRef.current = profileSnapshot;
    const nextUser = cacheRestaurantProfile(restaurantProfile);

    window.dispatchEvent(
      new CustomEvent("menuflow:user-updated", { detail: nextUser }),
    );
  }, [hasProfileForSync, restaurantProfile]);

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
