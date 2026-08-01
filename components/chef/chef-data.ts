import type { ChefNavItem } from "./types";

export const CHEF_NAV_ITEMS: ChefNavItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    pageTitle: "Chef Dashboard",
    description: "Kitchen activity, preparation progress, and today's order flow.",
    href: "/chef/dashboard",
    icon: "dashboard",
  },
  {
    key: "orders",
    label: "Orders",
    pageTitle: "Orders",
    description: "Accepted orders ready for kitchen preparation.",
    href: "/chef/orders",
    icon: "orders",
  },
  {
    key: "my-orders",
    label: "My Orders",
    pageTitle: "My Orders",
    description: "Orders assigned to your chef account.",
    href: "/chef/my-orders",
    icon: "orders",
  },
  {
    key: "tables",
    label: "Tables",
    pageTitle: "Tables",
    description: "Available tables for your restaurant.",
    href: "/chef/tables",
    icon: "tables",
  },
];
