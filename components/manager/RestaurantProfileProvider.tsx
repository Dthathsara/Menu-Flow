"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { RestaurantProfile } from "./settings/settings.types";
import { DEFAULT_RESTAURANT_PROFILE } from "./settings/settings.data";
import {
  areRestaurantProfilesEqual,
  dispatchRestaurantProfileUpdated,
  normalizeRestaurantProfile,
  readCachedRestaurantProfile,
  writeCachedRestaurantProfile,
} from "@/lib/restaurant-profile-cache";
import { fetchRestaurantProfile } from "@/lib/users-api";

interface RestaurantProfileContextValue {
  restaurantProfile: RestaurantProfile;
  setRestaurantProfile: (
    profile:
      | RestaurantProfile
      | ((current: RestaurantProfile) => RestaurantProfile),
  ) => void;
  refreshRestaurantProfile: () => Promise<void>;
}

const RestaurantProfileContext =
  createContext<RestaurantProfileContextValue | null>(null);

export function RestaurantProfileProvider({ children }: { children: ReactNode }) {
  const [restaurantProfile, setRestaurantProfileState] =
    useState<RestaurantProfile>(DEFAULT_RESTAURANT_PROFILE);
  const lastPersistedProfileRef = useRef(restaurantProfile);

  const setRestaurantProfile = useCallback(
    (
      profile:
        | RestaurantProfile
        | ((current: RestaurantProfile) => RestaurantProfile),
    ) => {
      setRestaurantProfileState((current) => {
        const nextProfile =
          typeof profile === "function" ? profile(current) : profile;
        const normalizedProfile = normalizeRestaurantProfile(nextProfile);

        if (areRestaurantProfilesEqual(current, normalizedProfile)) {
          return current;
        }

        return normalizedProfile;
      });
    },
    [],
  );

  const refreshRestaurantProfile = useCallback(async () => {
    const profile = await fetchRestaurantProfile();
    setRestaurantProfile(profile);
  }, [setRestaurantProfile]);

  useEffect(() => {
    setRestaurantProfile(readCachedRestaurantProfile());

    let cancelled = false;

    void fetchRestaurantProfile()
      .then((profile) => {
        if (!cancelled) {
          setRestaurantProfile(profile);
        }
      })
      .catch(() => {
        // Keep the cached profile visible when the backend is unavailable.
      });

    return () => {
      cancelled = true;
    };
  }, [setRestaurantProfile]);

  useEffect(() => {
    if (
      areRestaurantProfilesEqual(
        lastPersistedProfileRef.current,
        restaurantProfile,
      )
    ) {
      return;
    }

    writeCachedRestaurantProfile(restaurantProfile);
    dispatchRestaurantProfileUpdated(restaurantProfile);
    lastPersistedProfileRef.current = restaurantProfile;
  }, [restaurantProfile]);

  useEffect(() => {
    const imageUrl = restaurantProfile.restaurantImageUrl;

    if (!imageUrl || typeof window === "undefined") {
      return;
    }

    const img = new Image();
    img.src = imageUrl;
  }, [restaurantProfile.restaurantImageUrl]);

  const value = useMemo(
    () => ({
      restaurantProfile,
      setRestaurantProfile,
      refreshRestaurantProfile,
    }),
    [refreshRestaurantProfile, restaurantProfile, setRestaurantProfile],
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
    throw new Error("useRestaurantProfile must be used inside RestaurantProfileProvider");
  }

  return context;
}
