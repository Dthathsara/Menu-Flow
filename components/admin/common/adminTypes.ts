export type AdminScheme = "dark" | "light";

export type AdminTab = "dashboard" | "clients" | "users" | "packages" | "invoices" | "settings";

export type AdminModalMode = "view" | "add" | "edit" | "delete" | "paid";

export interface AdminNavItem {
  key: AdminTab;
  label: string;
  title: string;
  description: string;
  icon: "dashboard" | "clients" | "users" | "packages" | "invoices" | "settings";
}

export interface AdminPageProps {
  scheme: AdminScheme;
  searchQuery: string;
}
