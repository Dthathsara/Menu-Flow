import { useRouter } from "next/navigation";
import { getManagerNavHref } from "./managerConfig";
import {
  BillingIcon,
  DashboardIcon,
  InvoiceIcon,
  MenuBookIcon,
  OrdersIcon,
  QrCodeIcon,
  ReportsIcon,
  SettingsIcon,
  UsersIcon,
} from "./icons";
import { cn, getHorizontalNavToneClasses } from "./managerUtils";
import type { ManagerNavItem, ManagerNavKey, ManagerSettings } from "./managerTypes";
import type { ReportTab } from "./reports/reports.types";

interface HorizontalNavProps {
  settings: ManagerSettings;
  navItems: ManagerNavItem[];
  activeKey: ManagerNavKey;
  reportTab: ReportTab;
  onSelect: (key: ManagerNavKey) => void;
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

export function HorizontalNav({
  settings,
  navItems,
  activeKey,
  reportTab,
  onSelect,
}: HorizontalNavProps) {
  const router = useRouter();
  const navClasses = getHorizontalNavToneClasses(settings.menu, settings.scheme);
  const activeClasses =
    settings.menu === "brand"
      ? "bg-white/16 text-white"
      : settings.menu === "dark" || settings.scheme === "dark"
        ? "bg-blue-500 text-white"
        : "bg-blue-50 text-blue-700";
  const idleClasses =
    settings.menu === "brand"
      ? "text-white/86 hover:bg-white/10"
      : settings.menu === "dark" || settings.scheme === "dark"
        ? "text-slate-200 hover:bg-white/6"
        : "text-slate-700 hover:bg-slate-50";

  return (
    <div
      className={cn(
        "relative z-10 overflow-x-auto overflow-y-visible border backdrop-blur-xl",
        navClasses,
        settings.layoutMode === "detached"
          ? "rounded-[18px] px-3 py-3"
          : "px-3 py-3 sm:px-4",
      )}
    >
      <div className="flex min-w-max items-center gap-2">
        {navItems.map((item) => {
          const Icon = getNavIcon(item.icon);
          const active = item.key === activeKey;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                onSelect(item.key);
                const href =
                  item.key === "reports"
                    ? getManagerNavHref("reports", reportTab)
                    : getManagerNavHref(item.key);

                if (href) {
                  router.push(href);
                }
              }}
              className={cn(
                "inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2.5 text-[13px] font-semibold transition sm:px-4 sm:text-sm",
                active ? activeClasses : idleClasses,
              )}
            >
              <Icon className="size-4.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
