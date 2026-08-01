"use client";

import { useRouter } from "next/navigation";
import { Brand } from "@/components/common/Brand";
import { XIcon } from "@/components/manager/icons";
import { cn, getFocusRingClasses, getMenuToneClasses, getSidebarWidthClasses, isCondensedSidebar, isHoverSidebar } from "@/components/manager/managerUtils";
import type { ManagerSettings } from "@/components/manager/managerTypes";
import type { WaiterNavItem, WaiterNavKey } from "./types";
import { getWaiterNavIcon } from "./waiter-utils";

export function WaiterSidebar({
  settings,
  activeKey,
  navItems,
  overlay = false,
  open = true,
  onSelect,
  onClose,
}: {
  settings: ManagerSettings;
  activeKey: WaiterNavKey;
  navItems: WaiterNavItem[];
  overlay?: boolean;
  open?: boolean;
  onSelect: (key: WaiterNavKey) => void;
  onClose?: () => void;
}) {
  const router = useRouter();

  if (overlay && !open) {
    return null;
  }

  const collapsed = !overlay && isCondensedSidebar(settings.sidebarSize);
  const hoverSidebar = !overlay && isHoverSidebar(settings.sidebarSize);
  const hideText = collapsed || hoverSidebar;
  const usesDarkSidebar = settings.menu !== "brand" && settings.scheme === "dark";
  const activeClasses = settings.scheme === "dark"
    ? "bg-blue-500 text-white shadow-[0_14px_30px_rgba(59,130,246,0.28)]"
    : "bg-blue-50 text-blue-700";
  const idleClasses = settings.scheme === "dark" ? "hover:bg-white/7" : "hover:bg-white/82";

  function handleNavigate(item: WaiterNavItem) {
    onSelect(item.key);
    router.push(item.href);
    onClose?.();
  }

  return (
    <>
      {overlay ? <div className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px]" onClick={onClose} /> : null}
      <aside
        className={cn(
          "group/sidebar border transition-all duration-300",
          getMenuToneClasses(settings.menu, settings.scheme),
          overlay
            ? "fixed inset-y-4 left-4 z-50 w-[276px] max-w-[calc(100vw-2rem)] rounded-[20px] p-4"
            : settings.layoutMode === "detached"
              ? cn("hidden lg:sticky lg:top-4 lg:block lg:h-[calc(100vh-2rem)] rounded-[20px] p-4", getSidebarWidthClasses(settings.sidebarSize))
              : cn("hidden lg:sticky lg:top-0 lg:block lg:h-screen p-4 lg:p-5", getSidebarWidthClasses(settings.sidebarSize)),
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-3">
            <Brand size="sidebar" inverted={usesDarkSidebar || settings.menu === "brand"} showText={!hideText || overlay} className="min-w-0" />
            {overlay ? (
              <button type="button" onClick={onClose} className={cn("inline-flex size-10 items-center justify-center rounded-md border", getFocusRingClasses(settings.scheme))} aria-label="Close sidebar">
                <XIcon className="size-4" />
              </button>
            ) : null}
          </div>
          <div className={cn("mt-6 text-[11px] font-semibold uppercase tracking-[0.28em]", settings.scheme === "dark" ? "text-slate-400" : "text-slate-500", hideText && !overlay && "lg:hidden")}>
            Waiter
          </div>
          <nav className="mt-4 flex-1 space-y-1.5">
            {navItems.map((item) => {
              const Icon = getWaiterNavIcon(item.icon);
              const active = item.key === activeKey;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleNavigate(item)}
                  className={cn("group/nav flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-left text-l font-medium transition-all duration-200 ease-out", active ? activeClasses : idleClasses, getFocusRingClasses(settings.scheme), hideText && !overlay && "justify-center lg:px-0")}
                >
                  <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-md", active ? "bg-white/12" : settings.scheme === "dark" ? "bg-white/6" : "bg-white")}>
                    <Icon className="size-5" />
                  </span>
                  <span className={cn("truncate", hideText && !overlay && "lg:max-w-0 lg:overflow-hidden lg:opacity-0 lg:transition lg:duration-200 lg:group-hover/sidebar:max-w-[180px] lg:group-hover/sidebar:opacity-100")}>
                    {item.label}
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
