import type { WaiterNavItem } from "./types";

export const WAITER_NAV_ITEMS: WaiterNavItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    pageTitle: "Waiter Dashboard",
    description: "Today's service overview, order flow, and table activity.",
    href: "/waiter/dashboard",
    icon: "dashboard",
  },
  {
    key: "orders",
    label: "Orders",
    pageTitle: "Orders",
    description: "Accept pending table orders.",
    href: "/waiter/orders",
    icon: "orders",
  },
  {
    key: "my-orders",
    label: "My Orders",
    pageTitle: "My Orders",
    description: "Update orders accepted by your waiter account.",
    href: "/waiter/my-orders",
    icon: "orders",
  },
  {
    key: "tables",
    label: "Tables",
    pageTitle: "Tables",
    description: "Monitor table status and open the current order.",
    href: "/waiter/tables",
    icon: "tables",
  },
  {
    key: "settings",
    label: "Settings",
    pageTitle: "Settings",
    description: "Language, theme, and notification preferences.",
    href: "/waiter/settings",
    icon: "settings",
  },
];
