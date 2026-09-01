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
import { getStoredAuthUser } from "@/lib/auth-session";
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
  const activeScopeRef = useRef("");

  const updateRestaurantProfile = useCallback((profile: RestaurantProfile) => {
    setHasProfileForSync(true);
    setRestaurantProfile((current) => {
      const nextProfile = mergeProfileAllowingImageClear(profile);

      return areProfilesEqual(current, nextProfile) ? current : nextProfile;
    });
  }, []);

  useEffect(() => {
    let active = true;
    const user = getStoredAuthUser();
    activeScopeRef.current = user?.tenantId || user?.restaurantId || user?.id || user?.userId || "";
    setHasProfileForSync(false);
    setRestaurantProfile(DEFAULT_RESTAURANT_PROFILE);

    const cacheTimeoutId = window.setTimeout(() => {
      if (!active) {
        return;
      }

      const cachedProfile = getCachedRestaurantProfile();

      if (cachedProfile) {
        setHasProfileForSync(true);
        setRestaurantProfile((current) => {
          const nextProfile = mergeProfileAllowingImageClear(cachedProfile);

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
          const nextProfile = mergeProfileAllowingImageClear(profile);

          return areProfilesEqual(current, nextProfile) ? current : nextProfile;
        });
      })
      .catch(() => {
        // Keep the cached profile visible if the backend is unavailable.
      });

    function handleUserUpdated(event: Event) {
      if (isSelfDispatchingRef.current) {
        return;
      }
      const detail = event instanceof CustomEvent ? event.detail : null;

      if (!detail) {
        return;
      }

      const incomingProfile = mapRestaurantProfile(detail);
      const nextUser = getStoredAuthUser();
      const nextScope = nextUser?.tenantId || nextUser?.restaurantId || nextUser?.id || nextUser?.userId || "";

      if (nextScope && nextScope !== activeScopeRef.current) {
        activeScopeRef.current = nextScope;
        setRestaurantProfile(DEFAULT_RESTAURANT_PROFILE);
      }

      setHasProfileForSync(true);
      setRestaurantProfile((current) => {
        const nextProfile = mergeProfileAllowingImageClear(incomingProfile);

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

  const isSelfDispatchingRef = useRef(false);

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

    isSelfDispatchingRef.current = true;
    window.dispatchEvent(
      new CustomEvent("menuflow:user-updated", { detail: nextUser }),
    );
    isSelfDispatchingRef.current = false;
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
