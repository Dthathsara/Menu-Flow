"use client";

import { useEffect, useState } from "react";
import { DEFAULT_MANAGER_SETTINGS, MANAGER_STORAGE_KEY } from "./managerConfig";
import type {
  LayoutMode,
  LayoutType,
  ManagerSettings,
  MenuTone,
  Scheme,
  SidebarSize,
  TopbarTone,
} from "./managerTypes";

const layoutTypes = new Set<LayoutType>(["vertical", "horizontal"]);
const schemes = new Set<Scheme>(["light", "dark"]);
const layoutModes = new Set<LayoutMode>(["fluid", "detached"]);
const tones = new Set<TopbarTone | MenuTone>(["light", "dark", "brand"]);
const sidebarSizes = new Set<SidebarSize>([
  "default",
  "compact",
  "condensed",
  "hover",
  "full",
  "hidden",
]);

function parseStoredSettings(value: string | null): ManagerSettings | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<ManagerSettings>;

    return {
      layoutType: layoutTypes.has(parsed.layoutType as LayoutType)
        ? (parsed.layoutType as LayoutType)
        : DEFAULT_MANAGER_SETTINGS.layoutType,
      scheme: schemes.has(parsed.scheme as Scheme)
        ? (parsed.scheme as Scheme)
        : DEFAULT_MANAGER_SETTINGS.scheme,
      layoutMode: layoutModes.has(parsed.layoutMode as LayoutMode)
        ? (parsed.layoutMode as LayoutMode)
        : DEFAULT_MANAGER_SETTINGS.layoutMode,
      topbar: tones.has(parsed.topbar as TopbarTone)
        ? (parsed.topbar as TopbarTone)
        : DEFAULT_MANAGER_SETTINGS.topbar,
      menu: tones.has(parsed.menu as MenuTone)
        ? (parsed.menu as MenuTone)
        : DEFAULT_MANAGER_SETTINGS.menu,
      sidebarSize: sidebarSizes.has(parsed.sidebarSize as SidebarSize)
        ? (parsed.sidebarSize as SidebarSize)
        : DEFAULT_MANAGER_SETTINGS.sidebarSize,
    };
  } catch {
    return null;
  }
}

export function useManagerSettings() {
  const [settings, setSettings] = useState<ManagerSettings>(DEFAULT_MANAGER_SETTINGS);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => {
      const storedSettings = parseStoredSettings(
        window.localStorage.getItem(MANAGER_STORAGE_KEY),
      );

      if (storedSettings) {
        setSettings(storedSettings);
      }

      setIsReady(true);
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    window.localStorage.setItem(MANAGER_STORAGE_KEY, JSON.stringify(settings));
  }, [isReady, settings]);

  useEffect(() => {
    const previousTheme = document.documentElement.dataset.theme;

    return () => {
      if (previousTheme) {
        document.documentElement.dataset.theme = previousTheme;
        return;
      }

      document.documentElement.removeAttribute("data-theme");
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = settings.scheme;
  }, [settings.scheme]);

  function updateSetting<K extends keyof ManagerSettings>(
    key: K,
    value: ManagerSettings[K],
  ) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function toggleScheme() {
    setSettings((current) => ({
      ...current,
      scheme: current.scheme === "dark" ? "light" : "dark",
    }));
  }

  function resetSettings() {
    setSettings(DEFAULT_MANAGER_SETTINGS);
  }

  return {
    settings,
    isReady,
    updateSetting,
    toggleScheme,
    resetSettings,
  };
}
