"use client";

import { useEffect, useMemo, useState } from "react";
import { applyThemeToDocument } from "@/components/manager/managerTheme";
import { cn } from "@/components/manager/managerUtils";
import { ClientsPage } from "../clients/ClientsPage";
import { DashboardOverview } from "../dashboard/DashboardOverview";
import { InvoicesPage } from "../invoices/InvoicesPage";
import { PackagesPage } from "../packages/PackagesPage";
import { SettingsPage } from "../settings/SettingsPage";
import { UsersPage } from "../users/UsersPage";
import { ADMIN_NAV_ITEMS, ADMIN_STORAGE_KEY } from "./adminData";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";
import { adminShellClasses } from "./adminStyles";
import type { AdminScheme, AdminTab } from "./adminTypes";

export function AdminLayout() {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [mounted, setMounted] = useState(false);
  const [scheme, setScheme] = useState<AdminScheme>("dark");
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const stored = window.localStorage.getItem(ADMIN_STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      setScheme(stored);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    applyThemeToDocument(mounted ? scheme : "dark");
  }, [mounted, scheme]);

  useEffect(() => {
    const handleNavigate = (event: Event) => {
      const detail = (event as CustomEvent<AdminTab>).detail;
      if (detail) {
        setActiveTab(detail);
      }
    };

    window.addEventListener("menuflow-admin:navigate", handleNavigate);
    return () => window.removeEventListener("menuflow-admin:navigate", handleNavigate);
  }, []);

  function toggleTheme() {
    setScheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      window.localStorage.setItem(ADMIN_STORAGE_KEY, next);
      applyThemeToDocument(next);
      return next;
    });
  }

  function openPackageAdd() {
    setActiveTab("packages");
    window.setTimeout(() => window.dispatchEvent(new Event("menuflow-admin:add-package")), 0);
  }

  const activeItem = useMemo(
    () => ADMIN_NAV_ITEMS.find((item) => item.key === activeTab) ?? ADMIN_NAV_ITEMS[0],
    [activeTab],
  );

  return (
    <div className={cn("relative z-0 min-h-screen overflow-x-clip overflow-y-visible", adminShellClasses(scheme))}>
      <div className="relative z-0 flex min-h-screen">
        <AdminSidebar
          scheme={scheme}
          activeTab={activeTab}
          navItems={ADMIN_NAV_ITEMS}
          open={navigationOpen}
          onSelect={setActiveTab}
          onClose={() => setNavigationOpen(false)}
          onAddPackage={openPackageAdd}
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-visible">
          <AdminTopbar
            scheme={scheme}
            activeItem={activeItem}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onToggleNavigation={() => setNavigationOpen((current) => !current)}
            onToggleTheme={toggleTheme}
          />
          <main className="relative z-0 min-w-0 flex-1 p-4 sm:p-6 lg:p-[26px]">
            {activeTab === "dashboard" ? <DashboardOverview scheme={scheme} searchQuery={searchQuery} /> : null}
            {activeTab === "clients" ? <ClientsPage scheme={scheme} searchQuery={searchQuery} /> : null}
            {activeTab === "users" ? <UsersPage scheme={scheme} searchQuery={searchQuery} /> : null}
            {activeTab === "packages" ? <PackagesPage scheme={scheme} searchQuery={searchQuery} /> : null}
            {activeTab === "invoices" ? <InvoicesPage scheme={scheme} searchQuery={searchQuery} /> : null}
            {activeTab === "settings" ? <SettingsPage scheme={scheme} searchQuery={searchQuery} /> : null}
          </main>
        </div>
      </div>
    </div>
  );
}
