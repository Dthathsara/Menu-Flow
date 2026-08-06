import {
  BellIcon,
  ClockIcon,
  DashboardIcon,
  HomeIcon,
  OrdersIcon,
  UserIcon,
} from "@/components/manager/icons";
import { cn, getContentSurfaceClasses, getInteractiveCardClasses } from "@/components/manager/managerUtils";
import type { ManagerSettings } from "@/components/manager/managerTypes";
import type { WaiterNavItem } from "./types";

export function getWaiterNavIcon(icon: WaiterNavItem["icon"]) {
  switch (icon) {
    case "orders":
      return OrdersIcon;
    case "tables":
      return HomeIcon;
    case "notifications":
      return BellIcon;
    case "profile":
      return UserIcon;
    case "dashboard":
    default:
      return DashboardIcon;
  }
}

export function WaiterSurface({
  settings,
  className,
  children,
}: {
  settings: ManagerSettings;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-[22px] border p-5 sm:p-6",
        getContentSurfaceClasses(settings.scheme),
        getInteractiveCardClasses(settings.scheme),
        className,
      )}
    >
      {children}
    </div>
  );
}

export function getWorkspaceBadgeClasses(scheme: ManagerSettings["scheme"]) {
  return cn(
    "inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]",
    scheme === "dark"
      ? "border-blue-400/24 bg-blue-500/14 text-blue-100"
      : "border-blue-200 bg-blue-50 text-blue-700",
  );
}

export function formatWaiterTime(value: string) {
  if (!value) {
    return "Now";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export { ClockIcon };
