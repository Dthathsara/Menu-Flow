import { useState } from "react";
import { useRouter } from "next/navigation";
import { Brand } from "@/components/common/Brand";
import { ClientCompanyCard } from "./ClientCompanyCard";
import { getManagerNavHref } from "./managerConfig";
import {
  BillingIcon,
  ChevronDownIcon,
  DashboardIcon,
  InvoiceIcon,
  MenuBookIcon,
  OrdersIcon,
  QrCodeIcon,
  ReportsIcon,
  SettingsIcon,
  UsersIcon,
  XIcon,
} from "./icons";
import {
  cn,
  getFocusRingClasses,
  getMenuToneClasses,
  getSidebarWidthClasses,
  isCondensedSidebar,
  isHoverSidebar,
} from "./managerUtils";
import type { ManagerNavItem, ManagerNavKey, ManagerSettings } from "./managerTypes";
import type { ReportTab } from "./reports/reports.types";
import type { RestaurantProfile } from "./settings/settings.types";

interface SidebarProps {
  settings: ManagerSettings;
  activeKey: ManagerNavKey;
  navItems: ManagerNavItem[];
  reportTab: ReportTab;
  restaurantProfile: RestaurantProfile;
  overlay?: boolean;
  open?: boolean;
  isLocked?: boolean;
  onSelect: (key: ManagerNavKey) => void;
  onSelectReportTab: (tab: ReportTab) => void;
  onClose?: () => void;
}

function getNavIcon(icon: ManagerNavItem["icon"]) {
  switch (icon) {
    case "settings":
      return SettingsIcon;
    case "billing":
      return BillingIcon;
    case "invoices":
      return InvoiceIcon;
    case "menu":
      return MenuBookIcon;
    case "qr":
      return QrCodeIcon;
    case "users":
      return UsersIcon;
    case "reports":
      return ReportsIcon;
    case "orders":
      return OrdersIcon;
    case "dashboard":
    default:
      return DashboardIcon;
  }
}

export function Sidebar({
  settings,
  activeKey,
  navItems,
  reportTab,
  restaurantProfile,
  overlay = false,
  open = true,
  isLocked = false,
  onSelect,
  onSelectReportTab,
  onClose,
}: SidebarProps) {
  const router = useRouter();
  const [reportsExpanded, setReportsExpanded] = useState(activeKey === "reports");

  if (overlay && !open) {
    return null;
  }

  const collapsed = !overlay && isCondensedSidebar(settings.sidebarSize);
  const hoverSidebar = !overlay && isHoverSidebar(settings.sidebarSize);
  const hideText = collapsed || hoverSidebar;
  const usesBrandSidebar = settings.menu === "brand";
  const usesDarkSidebar = !usesBrandSidebar && settings.scheme === "dark";
  const menuClasses = getMenuToneClasses(settings.menu, settings.scheme);
  const mutedClasses =
    usesBrandSidebar
      ? "text-white/70"
      : usesDarkSidebar
        ? "text-slate-400"
        : "text-slate-500";
  const activeItemClasses =
    usesBrandSidebar
      ? "bg-white/16 text-white shadow-[0_14px_30px_rgba(15,23,42,0.12)]"
      : usesDarkSidebar
        ? "bg-blue-500 text-white shadow-[0_14px_30px_rgba(59,130,246,0.28)]"
        : "bg-blue-50 text-blue-700 shadow-[0_12px_26px_rgba(59,130,246,0.14)]";
  const hoverItemClasses =
    usesBrandSidebar
      ? "hover:bg-white/10"
      : usesDarkSidebar
        ? "hover:bg-white/7"
        : "hover:bg-white/82";
  const submenuRailClasses =
    usesBrandSidebar
      ? "bg-white/12"
      : usesDarkSidebar
        ? "bg-white/10"
        : "bg-[#dbe3ef]";
  const activeSubItemClasses =
    usesBrandSidebar
      ? "bg-white/10 text-white"
      : usesDarkSidebar
        ? "bg-white/8 text-slate-100"
        : "bg-white text-slate-900";
  const idleSubItemClasses =
    usesBrandSidebar
      ? "text-white/74 hover:bg-white/8"
      : usesDarkSidebar
        ? "text-slate-300 hover:bg-white/6"
        : "text-slate-500 hover:bg-white/82";
  const subItemIndicatorClasses =
    usesBrandSidebar
      ? "bg-white/55"
      : usesDarkSidebar
        ? "bg-blue-400"
        : "bg-blue-500";

  function handleNavigate(key: ManagerNavKey) {
    if (isLocked && key !== "invoices") {
      router.push("/manager/invoices");
      return;
    }

    onSelect(key);
    const href = getManagerNavHref(key);
    if (href) {
      router.push(href);
    }
    onClose?.();
  }

  function handleReportsClick() {
    if (isLocked) {
      router.push("/manager/invoices");
      return;
    }

    if (activeKey !== "reports") {
      setReportsExpanded(true);
      onSelect("reports");
      router.push(getManagerNavHref("reports", reportTab) ?? `/manager/reports?tab=${reportTab}`);
      onClose?.();
      return;
    }

    setReportsExpanded((current) => !current);
  }

  function handleReportTabSelect(tab: "users" | "orders") {
    if (isLocked) {
      router.push("/manager/invoices");
      return;
    }
    onSelectReportTab(tab);
    onSelect("reports");
    router.push(getManagerNavHref("reports", tab) ?? `/manager/reports?tab=${tab}`);
    onClose?.();
  }

  return (
    <>
      {overlay ? (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px]"
          onClick={onClose}
        />
      ) : null}

      <aside
        className={cn(
          "group/sidebar border transition-all duration-300",
          menuClasses,
          overlay
            ? "fixed inset-y-4 left-4 z-50 w-[276px] max-w-[calc(100vw-2rem)] rounded-[20px] p-4"
            : settings.layoutMode === "detached"
              ? cn(
                  "hidden lg:sticky lg:top-4 lg:block lg:h-[calc(100vh-2rem)] rounded-[20px] p-4",
                  getSidebarWidthClasses(settings.sidebarSize),
                )
              : cn(
                  "hidden lg:sticky lg:top-0 lg:block lg:h-screen p-4 lg:p-5",
                  getSidebarWidthClasses(settings.sidebarSize),
                ),
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-3">
            <Brand
              size="sidebar"
              inverted={usesBrandSidebar || usesDarkSidebar}
              showText={!hideText || overlay}
              hideSubtitleOnMobile={overlay}
              className="min-w-0"
            />

            {overlay ? (
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  "inline-flex size-10 items-center justify-center rounded-md border transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]",
                  usesDarkSidebar || usesBrandSidebar
                    ? "border-white/12 bg-white/10 hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                    : "border-[#dbe3ef] bg-white/88 text-slate-900 hover:bg-[#e8eef7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                )}
                aria-label="Close sidebar"
              >
                <XIcon className="size-4" />
              </button>
            ) : null}
          </div>

          <div className="mt-5">
            <ClientCompanyCard
              inverted={usesBrandSidebar || usesDarkSidebar}
              profile={restaurantProfile}
            />
          </div>

          <div className="mt-6 min-h-0 flex-1 overflow-y-auto pr-1">
            <div
              className={cn(
                "text-[11px] font-semibold uppercase tracking-[0.28em]",
                mutedClasses,
                hideText && !overlay && "lg:hidden",
              )}
            >
              Navigation
            </div>

            <nav className="mt-4 space-y-1.5 pb-4">
              {navItems.map((item) => {
                const Icon = getNavIcon(item.icon);
                const active = item.key === activeKey;
                const isItemLocked = isLocked && item.key !== "invoices";
                const textVisibilityClasses =
                  hideText &&
                  !overlay &&
                  "lg:max-w-0 lg:overflow-hidden lg:opacity-0 lg:transition lg:duration-200 lg:group-hover/sidebar:max-w-[180px] lg:group-hover/sidebar:opacity-100";

                if (item.key === "reports") {
                  const submenuVisible = reportsExpanded && !isItemLocked;

                  return (
                    <div key={item.key} className="space-y-1.5">
                      <button
                        type="button"
                        onClick={handleReportsClick}
                        aria-disabled={isItemLocked}
                        title={isItemLocked ? "Complete subscription payment to restore access." : undefined}
                        className={cn(
                          "group/nav flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-left text-l font-medium transition-all duration-200 ease-out active:translate-y-0 active:scale-[0.99]",
                          active ? activeItemClasses : hoverItemClasses,
                          !active && (usesBrandSidebar ? "text-white/86" : ""),
                          isItemLocked && "opacity-50 cursor-not-allowed hover:translate-x-0 hover:shadow-none",
                          !active &&
                            !isItemLocked &&
                            (usesBrandSidebar
                              ? "hover:translate-x-1 hover:shadow-[0_14px_26px_rgba(15,23,42,0.12)]"
                              : usesDarkSidebar
                                ? "hover:translate-x-1 hover:shadow-[0_14px_28px_rgba(2,6,23,0.18)]"
                                : "hover:translate-x-1 hover:shadow-[0_12px_24px_rgba(15,23,42,0.08)]"),
                          getFocusRingClasses(settings.scheme),
                          hideText && !overlay && "justify-center lg:px-0",
                        )}
                        aria-expanded={submenuVisible}
                        aria-controls="reports-submenu"
                      >
                        <span
                          className={cn(
                            "flex size-11 shrink-0 items-center justify-center rounded-md transition-all duration-200 ease-out group-hover/nav:scale-[1.03]",
                            active
                              ? usesBrandSidebar
                                ? "bg-white/14"
                                : "bg-white/10"
                              : usesBrandSidebar
                                ? "bg-white/8"
                                : usesDarkSidebar
                                  ? "bg-white/6 group-hover/nav:bg-white/10"
                                  : "bg-white group-hover/nav:bg-[#e8eef7]",
                          )}
                        >
                          <Icon className="size-5 transition-transform duration-200 ease-out group-hover/nav:scale-[1.04]" />
                        </span>

                        <span className={cn("min-w-0 flex-1 flex items-center justify-between", textVisibilityClasses)}>
                          <span className="block truncate">{item.label}</span>
                          {isItemLocked ? (
                            <span className="ml-1 text-amber-400" title="Locked - Payment overdue">
                              🔒
                            </span>
                          ) : null}
                        </span>

                        {!isItemLocked ? (
                          <ChevronDownIcon
                            className={cn(
                              "size-4 shrink-0 transition-transform duration-200",
                              submenuVisible && "rotate-180",
                              textVisibilityClasses,
                            )}
                          />
                        ) : null}
                      </button>

                      <div
                        id="reports-submenu"
                        className={cn(
                          "relative ml-[22px] overflow-hidden pl-5 transition-all duration-200",
                          submenuVisible ? "max-h-40 opacity-100" : "max-h-0 opacity-0",
                          hideText &&
                            !overlay &&
                            "lg:max-h-0 lg:opacity-0 lg:group-hover/sidebar:max-h-40 lg:group-hover/sidebar:opacity-100",
                        )}
                      >
                        <div className={cn("pointer-events-none absolute bottom-2 left-0 top-2 w-px", submenuRailClasses)} />
                        <div className="space-y-1.5 pb-1 pt-0.5">
                          {(["users", "orders"] as const).map((tab) => {
                            const subActive = active && reportTab === tab;

                            return (
                              <button
                                key={tab}
                                type="button"
                                onClick={() => handleReportTabSelect(tab)}
                                disabled={isItemLocked}
                                className={cn(
                                  "relative flex w-full items-center rounded-lg py-2.5 pl-5 pr-3 text-left text-[14px] font-medium transition-all duration-200 ease-out",
                                  subActive ? activeSubItemClasses : idleSubItemClasses,
                                )}
                              >
                                <span
                                  className={cn(
                                    "absolute left-0 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2",
                                    subActive
                                      ? usesBrandSidebar
                                        ? "border-white/30 bg-white"
                                        : usesDarkSidebar
                                          ? "border-slate-950 bg-blue-400"
                                          : "border-white bg-blue-500"
                                      : usesBrandSidebar
                                        ? "border-white/20 bg-white/20"
                                        : usesDarkSidebar
                                          ? "border-slate-950 bg-white/18"
                                          : "border-white bg-slate-300",
                                  )}
                                />
                                <span
                                  className={cn(
                                    "absolute left-0 top-1/2 h-px w-4 -translate-y-1/2",
                                    subActive ? subItemIndicatorClasses : submenuRailClasses,
                                  )}
                                />
                                <span className="capitalize">{tab}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleNavigate(item.key)}
                    aria-disabled={isItemLocked}
                    title={isItemLocked ? "Complete subscription payment to restore access." : undefined}
                    className={cn(
                      "group/nav flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-left text-l font-medium transition-all duration-200 ease-out active:translate-y-0 active:scale-[0.99]",
                      active ? activeItemClasses : hoverItemClasses,
                      !active && (usesBrandSidebar ? "text-white/86" : ""),
                      isItemLocked && "opacity-50 cursor-not-allowed hover:translate-x-0 hover:shadow-none",
                      !active &&
                        !isItemLocked &&
                        (usesBrandSidebar
                          ? "hover:translate-x-1 hover:shadow-[0_14px_26px_rgba(15,23,42,0.12)]"
                          : usesDarkSidebar
                            ? "hover:translate-x-1 hover:shadow-[0_14px_28px_rgba(2,6,23,0.18)]"
                            : "hover:translate-x-1 hover:shadow-[0_12px_24px_rgba(15,23,42,0.08)]"),
                      getFocusRingClasses(settings.scheme),
                      hideText && !overlay && "justify-center lg:px-0",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-11 shrink-0 items-center justify-center rounded-md transition-all duration-200 ease-out group-hover/nav:scale-[1.03]",
                        active
                          ? usesBrandSidebar
                            ? "bg-white/14"
                            : "bg-white/10"
                          : usesBrandSidebar
                            ? "bg-white/8"
                            : usesDarkSidebar
                              ? "bg-white/6 group-hover/nav:bg-white/10"
                              : "bg-white group-hover/nav:bg-[#e8eef7]",
                      )}
                    >
                      <Icon className="size-5 transition-transform duration-200 ease-out group-hover/nav:scale-[1.04]" />
                    </span>

                    <span className={cn("min-w-0 flex-1 flex items-center justify-between", textVisibilityClasses)}>
                      <span className="block truncate">{item.label}</span>
                      {isItemLocked ? (
                        <span className="ml-1 text-amber-400 text-xs" title="Locked - Payment overdue">
                          🔒
                        </span>
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
}

