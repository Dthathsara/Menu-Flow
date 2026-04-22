"use client";

import { useState } from "react";
import { LANGUAGE_OPTIONS, MANAGER_NAV_ITEMS } from "./managerConfig";
import { HorizontalShell } from "./HorizontalShell";
import { VerticalShell } from "./VerticalShell";
import { cn, getShellBackgroundClasses } from "./managerUtils";
import { useManagerSettings } from "./useManagerSettings";
import type { LanguageOption, ManagerNavKey } from "./managerTypes";

export function ManagerDashboard() {
  const [activeNav, setActiveNav] = useState<ManagerNavKey>("dashboard");
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>(
    LANGUAGE_OPTIONS[0],
  );
  const [activeDropdown, setActiveDropdown] = useState<"language" | "profile" | null>(
    null,
  );
  const [navigationOpen, setNavigationOpen] = useState(false);
  const { settings, toggleScheme } = useManagerSettings();

  const activeItem =
    MANAGER_NAV_ITEMS.find((item) => item.key === activeNav) ?? MANAGER_NAV_ITEMS[0];

  function handleToggleDropdown(dropdown: "language" | "profile") {
    setActiveDropdown((current) => (current === dropdown ? null : dropdown));
  }

  function handleSelectNav(key: ManagerNavKey) {
    setActiveNav(key);
    setActiveDropdown(null);
    setNavigationOpen(false);
  }

  const sharedProps = {
    settings,
    navItems: MANAGER_NAV_ITEMS,
    activeItem,
    activeKey: activeNav,
    selectedLanguage,
    languages: LANGUAGE_OPTIONS,
    activeDropdown,
    navigationOpen,
    onSelectNav: handleSelectNav,
    onToggleNavigation: () => setNavigationOpen((current) => !current),
    onCloseNavigation: () => setNavigationOpen(false),
    onToggleTheme: toggleScheme,
    onToggleDropdown: handleToggleDropdown,
    onCloseDropdowns: () => setActiveDropdown(null),
    onSelectLanguage: (language: LanguageOption) => {
      setSelectedLanguage(language);
      setActiveDropdown(null);
    },
  };

  return (
    <div
      className={cn(
        "relative z-0 min-h-screen overflow-x-clip overflow-y-visible",
        getShellBackgroundClasses(settings.scheme),
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-white/8 to-transparent" />
      <div className="pointer-events-none absolute left-[-10rem] top-16 size-[22rem] rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[-8rem] top-28 size-[18rem] rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative z-0">
        {settings.layoutType === "vertical" ? (
          <VerticalShell {...sharedProps} />
        ) : (
          <HorizontalShell {...sharedProps} />
        )}
      </div>
    </div>
  );
}
