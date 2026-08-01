import {
  DashboardIcon,
  HomeIcon,
  OrdersIcon,
} from "@/components/manager/icons";
import type { ChefNavItem } from "./types";

export function getChefNavIcon(icon: ChefNavItem["icon"]) {
  switch (icon) {
    case "orders":
      return OrdersIcon;
    case "tables":
      return HomeIcon;
    case "dashboard":
    default:
      return DashboardIcon;
  }
}

export function formatChefTime(value: string) {
  if (!value) {
    return "Now";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
