"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DEFAULT_MANAGER_SETTINGS } from "./managerConfig";
import { persistManagerSettings } from "./managerTheme";
import type { ManagerSettings } from "./managerTypes";

interface ManagerSettingsContextValue {
  settings: ManagerSettings;
  isReady: boolean;
  updateSetting: <K extends keyof ManagerSettings>(
    key: K,
    value: ManagerSettings[K],
  ) => void;
  toggleScheme: () => void;
  resetSettings: () => void;
}

const ManagerSettingsContext = createContext<ManagerSettingsContextValue | null>(null);

function useManagerSettingsState(initialSettings: ManagerSettings) {
  const [settings, setSettings] = useState<ManagerSettings>(initialSettings);

  useEffect(() => {
    persistManagerSettings(settings);
  }, [settings]);

  const value = useMemo<ManagerSettingsContextValue>(
    () => ({
      settings,
      isReady: true,
      updateSetting: <K extends keyof ManagerSettings>(
        key: K,
        value: ManagerSettings[K],
      ) => {
        setSettings((current) => ({
          ...current,
          [key]: value,
        }));
      },
      toggleScheme: () => {
        setSettings((current) => ({
          ...current,
          scheme: current.scheme === "dark" ? "light" : "dark",
        }));
      },
      resetSettings: () => {
        setSettings(DEFAULT_MANAGER_SETTINGS);
      },
    }),
    [settings],
  );

  return value;
}

export function ManagerThemeProvider({
  initialSettings = DEFAULT_MANAGER_SETTINGS,
  children,
}: {
  initialSettings?: ManagerSettings;
  children: React.ReactNode;
}) {
  const value = useManagerSettingsState(initialSettings);

  return (
    <ManagerSettingsContext.Provider value={value}>
      {children}
    </ManagerSettingsContext.Provider>
  );
}

export function useManagerSettings() {
  const context = useContext(ManagerSettingsContext);

  if (!context) {
    throw new Error("useManagerSettings must be used within ManagerThemeProvider.");
  }

  return context;
}
