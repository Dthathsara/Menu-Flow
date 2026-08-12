import type { AdminNavItem } from "./adminTypes";

export const ADMIN_STORAGE_KEY = "menuFlowAdminTheme";

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    title: "Welcome!",
    description: "MenuFlow platform overview, revenue, clients, packages, and activity.",
    icon: "dashboard",
  },
  {
    key: "clients",
    label: "Clients",
    title: "Clients",
    description: "Manage restaurant client accounts and subscription status.",
    icon: "clients",
  },
  {
    key: "users",
    label: "Users",
    title: "Users",
    description: "Control MenuFlow system staff accounts, roles, and access status.",
    icon: "users",
  },
  {
    key: "packages",
    label: "Packages",
    title: "Packages",
    description: "Configure subscription packages, pricing, duration, and availability.",
    icon: "packages",
  },
  {
    key: "invoices",
    label: "Invoices",
    title: "Invoices",
    description: "Track client invoices, payment status, and billing actions.",
    icon: "invoices",
  },
  {
    key: "settings",
    label: "Settings",
    title: "Settings",
    description: "Profile, system, notification, theme, and security preferences.",
    icon: "settings",
  },
];
