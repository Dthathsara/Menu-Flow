"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LANGUAGE_OPTIONS } from "@/components/manager/managerConfig";
import { useManagerSettings } from "@/components/manager/useManagerSettings";
import { cn, getContentAreaClasses, getShellBackgroundClasses, hasPersistentSidebar } from "@/components/manager/managerUtils";
import type { LanguageOption, ManagerNavItem } from "@/components/manager/managerTypes";
import { fetchWaiterMyOrders, fetchWaiterNotifications, fetchWaiterOrders, fetchWaiterTables, getStoredWaiterIdentity, updateWaiterOrderStatus } from "@/lib/waiter-api";
import { getApiErrorMessage } from "@/lib/error-handler";
import { WAITER_NAV_ITEMS } from "./waiter-data";
import type { WaiterNavKey, WaiterNotification, WaiterOrder, WaiterOrderStatus, WaiterTable } from "./types";
import { WaiterNavbar } from "./WaiterNavbar";
import { WaiterPages } from "./WaiterPages";
import { WaiterSidebar } from "./WaiterSidebar";

export function WaiterDashboard({ initialActiveNav = "dashboard" }: { initialActiveNav?: WaiterNavKey }) {
  const { settings, toggleScheme } = useManagerSettings();
  const [activeNav, setActiveNav] = useState<WaiterNavKey>(initialActiveNav);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>(LANGUAGE_OPTIONS[0]);
  const [activeDropdown, setActiveDropdown] = useState<"language" | "profile" | null>(null);
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [orders, setOrders] = useState<WaiterOrder[]>([]);
  const [tables, setTables] = useState<WaiterTable[]>([]);
  const [notifications, setNotifications] = useState<WaiterNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const loadingRef = useRef(false);

  const loadData = useCallback(async (showLoading = true) => {
    if (loadingRef.current) {
      return;
    }

    loadingRef.current = true;

    if (showLoading) {
      setIsLoading(true);
    }
    try {
      const [pendingOrders, myOrders, nextTables, nextNotifications] = await Promise.all([
        fetchWaiterOrders(),
        fetchWaiterMyOrders(),
        fetchWaiterTables(),
        fetchWaiterNotifications(),
      ]);
      const mergedOrders = [...pendingOrders, ...myOrders].filter(
        (order, index, all) =>
          order.id && all.findIndex((item) => item.id === order.id) === index,
      );

      setOrders(mergedOrders);
      setTables(nextTables);
      setNotifications(nextNotifications);
      setErrorMessage("");
    } catch (error) {
      if (showLoading) {
        setOrders([]);
        setTables([]);
        setNotifications([]);
      }
      setErrorMessage(getApiErrorMessage(error, "Unable to load waiter data."));
    } finally {
      loadingRef.current = false;
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadData(true);
  }, [loadData]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void loadData(false);
    }, 45000);

    return () => window.clearInterval(intervalId);
  }, [loadData]);

  const activeItem = WAITER_NAV_ITEMS.find((item) => item.key === activeNav) ?? WAITER_NAV_ITEMS[0];
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

  async function handleUpdateOrderStatus(orderId: string, status: WaiterOrderStatus) {
    const previousOrders = orders;
    const waiterIdentity = status === "accepted" ? getStoredWaiterIdentity() : null;
    setOrders((current) =>
      current.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status,
              waiterId: waiterIdentity?.waiterId || order.waiterId,
              waiterName: waiterIdentity?.waiterName || order.waiterName,
            }
          : order,
      ),
    );

    try {
      const updatedOrder = await updateWaiterOrderStatus(orderId, status);
      setOrders((current) =>
        current.map((order) =>
          order.id === orderId
            ? {
                ...updatedOrder,
                waiterId: updatedOrder.waiterId || waiterIdentity?.waiterId || order.waiterId,
                waiterName: updatedOrder.waiterName || waiterIdentity?.waiterName || order.waiterName,
              }
            : order,
        ),
      );
      setErrorMessage("");
      void loadData(false);
    } catch (error) {
      setOrders(previousOrders);
      setErrorMessage(getApiErrorMessage(error, "Unable to update order status."));
    }
  }

  return (
    <div className={cn("relative z-0 min-h-screen overflow-x-clip overflow-y-visible", getShellBackgroundClasses(settings.scheme))}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-white/8 to-transparent" />
      <div className="relative z-0 flex min-h-screen">
        {persistentSidebar ? (
          <WaiterSidebar settings={settings} activeKey={activeNav} navItems={WAITER_NAV_ITEMS} onSelect={setActiveNav} />
        ) : null}
        <div className="flex min-w-0 flex-1 flex-col overflow-visible">
          <WaiterNavbar
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
            <WaiterPages
              activeKey={activeNav}
              settings={settings}
              orders={orders}
              tables={tables}
              notifications={notifications}
              isLoading={isLoading}
              errorMessage={errorMessage}
              onRefresh={loadData}
              onUpdateOrderStatus={handleUpdateOrderStatus}
            />
          </main>
        </div>
      </div>
      <WaiterSidebar settings={settings} activeKey={activeNav} navItems={WAITER_NAV_ITEMS} overlay open={navigationOpen} onSelect={setActiveNav} onClose={() => setNavigationOpen(false)} />
    </div>
  );
}
