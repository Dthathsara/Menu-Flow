import { Brand } from "@/components/Brand";
import { ClientCompanyCard } from "./ClientCompanyCard";
import {
  DashboardIcon,
  MenuBookIcon,
  OrdersIcon,
  QrCodeIcon,
  UsersIcon,
  ReportsIcon,
  XIcon,
} from "./icons";
import {
  cn,
  getFocusRingClasses,
  getMenuToneClasses,
  getMutedTextClasses,
  getSidebarWidthClasses,
  isCondensedSidebar,
  isHoverSidebar,
} from "./managerUtils";
import type { ManagerNavItem, ManagerNavKey, ManagerSettings } from "./managerTypes";

interface SidebarProps {
  settings: ManagerSettings;
  activeKey: ManagerNavKey;
  navItems: ManagerNavItem[];
  overlay?: boolean;
  open?: boolean;
  onSelect: (key: ManagerNavKey) => void;
  onClose?: () => void;
}

function getNavIcon(icon: ManagerNavItem["icon"]) {
  switch (icon) {
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
  overlay = false,
  open = true,
  onSelect,
  onClose,
}: SidebarProps) {
  if (overlay && !open) {
    return null;
  }

  const collapsed = !overlay && isCondensedSidebar(settings.sidebarSize);
  const hoverSidebar = !overlay && isHoverSidebar(settings.sidebarSize);
  const hideText = collapsed || hoverSidebar;
  const menuClasses = getMenuToneClasses(settings.menu, settings.scheme);
  const mutedClasses =
    settings.menu === "brand"
      ? "text-white/70"
      : getMutedTextClasses(settings.scheme);
  const activeItemClasses =
    settings.menu === "brand"
      ? "bg-white/16 text-white shadow-[0_14px_30px_rgba(15,23,42,0.12)]"
      : settings.menu === "dark" || settings.scheme === "dark"
        ? "bg-blue-500 text-white shadow-[0_14px_30px_rgba(59,130,246,0.28)]"
        : "bg-blue-50 text-blue-700 shadow-[0_12px_26px_rgba(59,130,246,0.14)]";
  const hoverItemClasses =
    settings.menu === "brand"
      ? "hover:bg-white/10"
      : settings.menu === "dark" || settings.scheme === "dark"
        ? "hover:bg-white/7"
        : "hover:bg-slate-50";

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
              inverted={settings.menu === "brand" || settings.menu === "dark" || settings.scheme === "dark"}
              showText={!hideText || overlay}
              hideSubtitleOnMobile={overlay}
              className="min-w-0"
            />

            {overlay ? (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex size-10 items-center justify-center rounded-md border border-white/12 bg-white/10 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-white/16 active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                aria-label="Close sidebar"
              >
                <XIcon className="size-4" />
              </button>
            ) : null}
          </div>

          <div className="mt-5">
            <ClientCompanyCard
              inverted={
                settings.menu === "brand" ||
                settings.menu === "dark" ||
                settings.scheme === "dark"
              }
            />
          </div>

          <div
            className={cn(
              "mt-6 text-[11px] font-semibold uppercase tracking-[0.28em]",
              mutedClasses,
              hideText && !overlay && "lg:hidden",
            )}
          >
            Navigation
          </div>

          <nav className="mt-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = getNavIcon(item.icon);
              const active = item.key === activeKey;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    onSelect(item.key);
                    onClose?.();
                  }}
                  className={cn(
                    "group/nav flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-left text-l font-medium transition-all duration-200 ease-out active:translate-y-0 active:scale-[0.99]",
                    active ? activeItemClasses : hoverItemClasses,
                    !active && (settings.menu === "brand" ? "text-white/86" : ""),
                    !active &&
                      (settings.menu === "brand"
                        ? "hover:translate-x-1 hover:shadow-[0_14px_26px_rgba(15,23,42,0.12)]"
                        : settings.menu === "dark" || settings.scheme === "dark"
                          ? "hover:translate-x-1 hover:shadow-[0_14px_28px_rgba(2,6,23,0.18)]"
                          : "hover:translate-x-1 hover:border-slate-300/90 hover:shadow-[0_12px_24px_rgba(15,23,42,0.08)]"),
                    getFocusRingClasses(settings.scheme),
                    hideText && !overlay && "justify-center lg:px-0",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-md transition-all duration-200 ease-out group-hover/nav:scale-[1.03]",
                      active
                        ? settings.menu === "brand"
                          ? "bg-white/14"
                          : "bg-white/10"
                        : settings.menu === "brand"
                          ? "bg-white/8"
                          : settings.menu === "dark" || settings.scheme === "dark"
                            ? "bg-white/6 group-hover/nav:bg-white/10"
                            : "bg-slate-100 group-hover/nav:bg-blue-50",
                    )}
                  >
                    <Icon className="size-5 transition-transform duration-200 ease-out group-hover/nav:scale-[1.04]" />
                  </span>

                  <span
                    className={cn(
                      "min-w-0 flex-1",
                      hideText &&
                        !overlay &&
                        "lg:max-w-0 lg:overflow-hidden lg:opacity-0 lg:transition lg:duration-200 lg:group-hover/sidebar:max-w-[180px] lg:group-hover/sidebar:opacity-100",
                    )}
                  >
                    <span className="block truncate">{item.label}</span>
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
