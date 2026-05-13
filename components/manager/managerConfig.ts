import type { LanguageOption, ManagerNavItem, ManagerSettings } from "./managerTypes";

export const MANAGER_STORAGE_KEY = "managerDbTheme";

export const DEFAULT_MANAGER_SETTINGS: ManagerSettings = {
  layoutType: "vertical",
  scheme: "dark",
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
  {
    key: "billing",
    label: "Billing",
    pageTitle: "Billing",
    description: "Convert QR orders into final bills, collect payments, and manage cashier workflows.",
    icon: "billing",
  },
  {
    key: "invoices",
    label: "Invoices",
    pageTitle: "Invoices",
    description: "Manage subscription invoices, package renewals, payment methods, and plan changes.",
    icon: "invoices",
  },
  {
    key: "settings",
    label: "Settings",
    pageTitle: "Settings",
    description: "Customize restaurant workflows, profile details, theme preferences, and business rules.",
    icon: "settings",
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

export function getManagerNavHref(
  key: ManagerNavItem["key"],
  reportsTab: "users" | "orders" = "users",
) {
  switch (key) {
    case "dashboard":
      return "/manager";
    case "orders":
      return "/manager/orders";
    case "manage-menu":
      return "/manager/manage-menu";
    case "generate-qr":
      return "/manager/qr-codes";
    case "users":
      return "/manager/users";
    case "reports":
      return `/manager/reports?tab=${reportsTab}`;
    case "billing":
      return "/manager/billing";
    case "invoices":
      return "/manager/invoices";
    case "settings":
      return "/manager/settings";
    default:
      return null;
  }
}
