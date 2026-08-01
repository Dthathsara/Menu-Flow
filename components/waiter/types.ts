import type { ManagerSettings } from "@/components/manager/managerTypes";

export type WaiterNavKey =
  | "dashboard"
  | "orders"
  | "my-orders"
  | "tables"
  | "notifications"
  | "profile"
  | "settings";

export type WaiterOrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready"
  | "delivered";

export type WaiterTableStatus =
  | "available"
  | "occupied"
  | "preparing"
  | "ready"
  | "reserved";

export type WaiterPaymentStatus = "paid" | "unpaid" | "pending" | "failed";

export interface WaiterNavItem {
  key: WaiterNavKey;
  label: string;
  pageTitle: string;
  description: string;
  href: string;
  icon: "dashboard" | "orders" | "tables" | "notifications" | "profile" | "settings";
}

export interface WaiterOrderItem {
  name: string;
  quantity: number;
  note?: string;
}

export interface WaiterOrder {
  id: string;
  orderNumber: string;
  table: string;
  customer: string;
  items: WaiterOrderItem[];
  notes: string;
  status: WaiterOrderStatus;
  time: string;
  paymentStatus: WaiterPaymentStatus;
  waiterId?: string;
  waiterName?: string;
  assignedChefId?: string | null;
  assignedChef?: ChefSummary | null;
  preparingAt?: string | null;
  readyAt?: string | null;
  deliveredAt?: string | null;
}

export interface ChefSummary {
  id: string;
  name: string;
  email?: string;
}

export interface WaiterTable {
  id: string;
  name: string;
  seats: number;
  status: WaiterTableStatus;
  currentOrderId?: string;
  customer?: string;
}

export interface WaiterNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read?: boolean;
}

export interface WaiterProfile {
  name: string;
  phone: string;
  email: string;
  profilePictureUrl: string;
}

export interface WaiterPageProps {
  settings: ManagerSettings;
  orders: WaiterOrder[];
  tables: WaiterTable[];
  notifications: WaiterNotification[];
  isLoading: boolean;
  errorMessage: string;
  onRefresh: () => Promise<void>;
  onUpdateOrderStatus: (orderId: string, status: WaiterOrderStatus) => Promise<void>;
}
