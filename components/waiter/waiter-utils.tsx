import {
  BellIcon,
  ClockIcon,
  DashboardIcon,
  HomeIcon,
  OrdersIcon,
  SettingsIcon,
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
    case "settings":
      return SettingsIcon;
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
