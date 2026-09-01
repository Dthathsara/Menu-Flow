"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LANGUAGE_OPTIONS, MANAGER_NAV_ITEMS } from "./managerConfig";
import { HorizontalShell } from "./HorizontalShell";
import { VerticalShell } from "./VerticalShell";
import { useRestaurantProfile } from "./restaurant-profile-context";
import { useManagerAccessStatus } from "./useManagerAccessStatus";
import { cn, getShellBackgroundClasses } from "./managerUtils";
import { useManagerSettings } from "./useManagerSettings";
import type { LanguageOption, ManagerNavKey } from "./managerTypes";
import type { ReportTab } from "./reports/reports.types";

interface ManagerDashboardProps {
  initialActiveNav?: ManagerNavKey;
  initialReportTab?: ReportTab;
}

export function ManagerDashboard({
  initialActiveNav = "dashboard",
  initialReportTab = "users",
}: ManagerDashboardProps) {
  const router = useRouter();
  const { locked } = useManagerAccessStatus();
  const [activeNav, setActiveNav] = useState<ManagerNavKey>(initialActiveNav);
  const [activeReportTab, setActiveReportTab] = useState<ReportTab>(initialReportTab);
  const { restaurantProfile, updateRestaurantProfile } = useRestaurantProfile();
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>(
    LANGUAGE_OPTIONS[0],
  );
  const [activeDropdown, setActiveDropdown] = useState<"language" | "profile" | null>(
    null,
  );
  const [navigationOpen, setNavigationOpen] = useState(false);
  const { settings, toggleScheme } = useManagerSettings();

  useEffect(() => {
    if (locked && activeNav !== "invoices") {
      setActiveNav("invoices");
      router.replace("/manager/invoices");
    }
  }, [locked, activeNav, router]);

  const effectiveNav = locked ? "invoices" : activeNav;
  const activeItem =
    MANAGER_NAV_ITEMS.find((item) => item.key === effectiveNav) ?? MANAGER_NAV_ITEMS[0];

  function handleToggleDropdown(dropdown: "language" | "profile") {
    setActiveDropdown((current) => (current === dropdown ? null : dropdown));
  }

  function handleSelectNav(key: ManagerNavKey) {
    if (locked && key !== "invoices") {
      router.push("/manager/invoices");
      return;
    }
    setActiveNav(key);
    setActiveDropdown(null);
    setNavigationOpen(false);
  }

  const sharedProps = {
    settings,
    navItems: MANAGER_NAV_ITEMS,
    activeItem,
    activeKey: effectiveNav,
    initialReportTab,
    reportTab: activeReportTab,
    restaurantProfile,
    selectedLanguage,
    languages: LANGUAGE_OPTIONS,
    activeDropdown,
    navigationOpen,
    isLocked: locked,
    onSelectNav: handleSelectNav,
    onSelectReportTab: setActiveReportTab,
    onToggleNavigation: () => setNavigationOpen((current) => !current),
    onCloseNavigation: () => setNavigationOpen(false),
    onToggleTheme: toggleScheme,
    onToggleDropdown: handleToggleDropdown,
    onCloseDropdowns: () => setActiveDropdown(null),
    onSelectLanguage: (language: LanguageOption) => {
      setSelectedLanguage(language);
      setActiveDropdown(null);
    },
    onUpdateRestaurantProfile: updateRestaurantProfile,
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
        {settings.layoutMode === "horizontal" ? (
          <HorizontalShell {...sharedProps} />
        ) : (
          <VerticalShell {...sharedProps} />
        )}
      </div>
    </div>
  );
}

