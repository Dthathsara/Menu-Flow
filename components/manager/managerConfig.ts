import type { LanguageOption, ManagerNavItem, ManagerSettings } from "./managerTypes";

export const MANAGER_STORAGE_KEY = "managerDbTheme";

export const DEFAULT_MANAGER_SETTINGS: ManagerSettings = {
  layoutType: "vertical",
  scheme: "light",
  layoutMode: "fluid",
  topbar: "light",
  menu: "dark",
  sidebarSize: "default",
};

export const MANAGER_NAV_ITEMS: ManagerNavItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    pageTitle: "Dashboard",
    description: "Blank dashboard canvas ready for metrics and manager widgets.",
    icon: "dashboard",
  },
  {
    key: "orders",
    label: "Orders",
    pageTitle: "Orders",
    description: "Blank operational shell for live orders, queues, and fulfillment.",
    icon: "orders",
  },
  {
    key: "manage-menu",
    label: "Manage Menu",
    pageTitle: "Manage Menu",
    description: "Prepare menu management screens, categories, and dish controls.",
    icon: "menu",
  },
  {
    key: "generate-qr",
    label: "QR Codes",
    pageTitle: "QR Codes",
    description: "Reserved space for QR generation flows and publishing actions.",
    icon: "qr",
  },
  {
    key: "users",
    label: "Users",
    pageTitle: "Users",
    description: "User administration area placeholder for staff and role controls.",
    icon: "users",
  },
  {
    key: "reports",
    label: "Reports",
    pageTitle: "Reports",
    description: "Reporting workspace placeholder for revenue and operational views.",
    icon: "reports",
  },
];

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "de", label: "German" },
  { code: "it", label: "Italian" },
  { code: "es", label: "Spanish" },
  { code: "ru", label: "Russian" },
];
