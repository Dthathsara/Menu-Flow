"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { DEFAULT_MANAGER_SETTINGS, MANAGER_STORAGE_KEY } from "./managerConfig";
import {
  applyThemeToDocument,
  getSystemTheme,
  parseManagerSettingsValue,
  persistManagerSettings,
} from "./managerTheme";

export function ManagerThemeInitializer() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.startsWith("/admin")) {
      return;
    }

    const storedSettings = parseManagerSettingsValue(
      window.localStorage.getItem(MANAGER_STORAGE_KEY),
      DEFAULT_MANAGER_SETTINGS,
    );

    if (storedSettings) {
      applyThemeToDocument(storedSettings.scheme);
      return;
    }

    persistManagerSettings({
      ...DEFAULT_MANAGER_SETTINGS,
      scheme: getSystemTheme(DEFAULT_MANAGER_SETTINGS.scheme),
    });
  }, [pathname]);

  return null;
}
