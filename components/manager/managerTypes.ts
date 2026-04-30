export type ManagerNavKey =
  | "dashboard"
  | "manage-menu"
  | "generate-qr"
  | "users"
  | "reports"
  | "orders"
  | "billing"
  | "settings";

export type LayoutType = "vertical" | "horizontal";
export type Scheme = "light" | "dark";
export type LayoutMode = "fluid" | "detached";
export type TopbarTone = "light" | "dark" | "brand";
export type MenuTone = "light" | "dark" | "brand";
export type SidebarSize =
  | "default"
  | "compact"
  | "condensed"
  | "hover"
  | "full"
  | "hidden";

export interface ManagerSettings {
  layoutType: LayoutType;
  scheme: Scheme;
  layoutMode: LayoutMode;
  topbar: TopbarTone;
  menu: MenuTone;
  sidebarSize: SidebarSize;
}

export interface ManagerNavItem {
  key: ManagerNavKey;
  label: string;
  pageTitle: string;
  description: string;
  icon: "dashboard" | "menu" | "qr" | "users" | "reports" | "orders" | "billing" | "settings";
}

export interface LanguageOption {
  code: "en" | "hi" | "de" | "it" | "es" | "ru";
  label: string;
}
