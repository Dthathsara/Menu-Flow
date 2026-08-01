"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { LANGUAGE_OPTIONS } from "@/components/manager/managerConfig";
import { useManagerSettings } from "@/components/manager/useManagerSettings";
import {
  cn,
  getContentAreaClasses,
  getShellBackgroundClasses,
  hasPersistentSidebar,
} from "@/components/manager/managerUtils";
import type { LanguageOption, ManagerNavItem } from "@/components/manager/managerTypes";
import { CHEF_NAV_ITEMS } from "./chef-data";
import { ChefNavbar } from "./ChefNavbar";
import { ChefSidebar } from "./ChefSidebar";
import type { ChefNavKey } from "./types";

function getActiveChefNav(pathname: string): ChefNavKey {
  if (pathname.startsWith("/chef/orders")) {
    return "orders";
  }

  if (pathname.startsWith("/chef/my-orders")) {
    return "my-orders";
  }

  if (pathname.startsWith("/chef/tables")) {
    return "tables";
  }

  return "dashboard";
}

export function ChefShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { settings, toggleScheme } = useManagerSettings();
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>(LANGUAGE_OPTIONS[0]);
  const [activeDropdown, setActiveDropdown] = useState<"language" | "profile" | null>(null);
  const [navigationOpen, setNavigationOpen] = useState(false);
  const activeNav = getActiveChefNav(pathname);
  const activeItem = CHEF_NAV_ITEMS.find((item) => item.key === activeNav) ?? CHEF_NAV_ITEMS[0];
  const topbarItem: ManagerNavItem = useMemo(
    () => ({
      key: "dashboard",
      label: activeItem.label,
      pageTitle: activeItem.pageTitle,
      description: activeItem.description,
      icon: "dashboard",
    }),
    [activeItem],
  );
  const persistentSidebar = hasPersistentSidebar(settings.sidebarSize);

  return (
    <div className={cn("relative z-0 min-h-screen overflow-x-clip overflow-y-visible", getShellBackgroundClasses(settings.scheme))}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-white/8 to-transparent" />
      <div className="relative z-0 flex min-h-screen">
        {persistentSidebar ? (
          <ChefSidebar settings={settings} activeKey={activeNav} navItems={CHEF_NAV_ITEMS} onSelect={() => undefined} />
        ) : null}
        <div className="flex min-w-0 flex-1 flex-col overflow-visible">
          <ChefNavbar
            activeItem={topbarItem}
            settings={settings}
            selectedLanguage={selectedLanguage}
            languages={LANGUAGE_OPTIONS}
            activeDropdown={activeDropdown}
            menuButtonClassName={persistentSidebar ? "lg:hidden" : "inline-flex"}
            onToggleNavigation={() => setNavigationOpen((current) => !current)}
            onToggleTheme={toggleScheme}
            onToggleDropdown={(dropdown) => setActiveDropdown((current) => (current === dropdown ? null : dropdown))}
            onCloseDropdowns={() => setActiveDropdown(null)}
            onSelectLanguage={(language) => {
              setSelectedLanguage(language);
              setActiveDropdown(null);
            }}
          />
          <main className={cn("relative z-0 min-w-0 flex-1", getContentAreaClasses(settings.layoutMode, settings.sidebarSize))}>
            {children}
          </main>
        </div>
      </div>
      <ChefSidebar settings={settings} activeKey={activeNav} navItems={CHEF_NAV_ITEMS} overlay open={navigationOpen} onSelect={() => undefined} onClose={() => setNavigationOpen(false)} />
    </div>
  );
}
