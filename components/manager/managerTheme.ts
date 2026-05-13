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

function decodeStoredSettingsValue(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function sanitizeManagerSettings(
  parsed: Partial<ManagerSettings>,
  fallback: ManagerSettings = DEFAULT_MANAGER_SETTINGS,
): ManagerSettings {
  return {
    layoutType: layoutTypes.has(parsed.layoutType as LayoutType)
      ? (parsed.layoutType as LayoutType)
      : fallback.layoutType,
    scheme: schemes.has(parsed.scheme as Scheme)
      ? (parsed.scheme as Scheme)
      : fallback.scheme,
    layoutMode: layoutModes.has(parsed.layoutMode as LayoutMode)
      ? (parsed.layoutMode as LayoutMode)
      : fallback.layoutMode,
    topbar: tones.has(parsed.topbar as TopbarTone)
      ? (parsed.topbar as TopbarTone)
      : fallback.topbar,
    menu: tones.has(parsed.menu as MenuTone)
      ? (parsed.menu as MenuTone)
      : fallback.menu,
    sidebarSize: sidebarSizes.has(parsed.sidebarSize as SidebarSize)
      ? (parsed.sidebarSize as SidebarSize)
      : fallback.sidebarSize,
  };
}

export function parseManagerSettingsValue(
  value: string | null | undefined,
  fallback: ManagerSettings = DEFAULT_MANAGER_SETTINGS,
): ManagerSettings | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeStoredSettingsValue(value)) as Partial<ManagerSettings>;
    return sanitizeManagerSettings(parsed, fallback);
  } catch {
    return null;
  }
}

export function getManagerSchemeFromStoredValue(
  value: string | null | undefined,
  fallback: Scheme = DEFAULT_MANAGER_SETTINGS.scheme,
) {
  return parseManagerSettingsValue(value)?.scheme ?? fallback;
}

export function getDocumentTheme(
  fallback: Scheme = DEFAULT_MANAGER_SETTINGS.scheme,
): Scheme {
  if (typeof document === "undefined") {
    return fallback;
  }

  const theme = document.documentElement.dataset.theme;
  return theme === "light" || theme === "dark" ? theme : fallback;
}

export function getSystemTheme(
  fallback: Scheme = DEFAULT_MANAGER_SETTINGS.scheme,
): Scheme {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return fallback;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function getInitialManagerSettings(
  initialSettings: ManagerSettings = DEFAULT_MANAGER_SETTINGS,
): ManagerSettings {
  if (typeof window === "undefined") {
    return initialSettings;
  }

  const storedSettings = parseManagerSettingsValue(
    window.localStorage.getItem(MANAGER_STORAGE_KEY),
    initialSettings,
  );

  if (storedSettings) {
    return storedSettings;
  }

  return {
    ...initialSettings,
    scheme: getDocumentTheme(getSystemTheme(initialSettings.scheme)),
  };
}

export function applyThemeToDocument(scheme: Scheme) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.dataset.theme = scheme;
  document.documentElement.style.colorScheme = scheme;

  if (document.body) {
    document.body.dataset.theme = scheme;
  }
}

export function persistManagerSettings(settings: ManagerSettings) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const serialized = JSON.stringify(settings);
  window.localStorage.setItem(MANAGER_STORAGE_KEY, serialized);
  document.cookie = `${MANAGER_STORAGE_KEY}=${encodeURIComponent(serialized)}; path=/; max-age=31536000; samesite=lax`;
  applyThemeToDocument(settings.scheme);
}

export function createManagerThemeInitScript() {
  const defaultSettings = JSON.stringify(DEFAULT_MANAGER_SETTINGS);

  return `(() => {
    const storageKey = ${JSON.stringify(MANAGER_STORAGE_KEY)};
    const defaultSettings = ${defaultSettings};
    const parseSettings = (value) => {
      if (!value) return null;
      try {
        const decoded = decodeURIComponent(value);
        const parsed = JSON.parse(decoded);
        return parsed && typeof parsed === "object" ? parsed : null;
      } catch {
        return null;
      }
    };
    const getSystemTheme = () =>
      window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    const storedSettings = parseSettings(window.localStorage.getItem(storageKey));
    const scheme =
      storedSettings && (storedSettings.scheme === "light" || storedSettings.scheme === "dark")
        ? storedSettings.scheme
        : getSystemTheme();
    const root = document.documentElement;
    root.dataset.theme = scheme;
    root.style.colorScheme = scheme;
    if (document.body) {
      document.body.dataset.theme = scheme;
    }
    if (!storedSettings) {
      const nextSettings = JSON.stringify({ ...defaultSettings, scheme });
      window.localStorage.setItem(storageKey, nextSettings);
      document.cookie = storageKey + "=" + encodeURIComponent(nextSettings) + "; path=/; max-age=31536000; samesite=lax";
    }
  })();`;
}
