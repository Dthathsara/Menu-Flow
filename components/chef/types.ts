import type { ManagerSettings } from "@/components/manager/managerTypes";

export type ChefNavKey = "dashboard" | "orders" | "my-orders" | "tables";

export type ChefOrderStatus = "accepted" | "preparing" | "ready" | "delivered";

export type ChefTableStatus = "available" | "occupied" | "preparing" | "ready" | "reserved";

export interface ChefNavItem {
  key: ChefNavKey;
  label: string;
  pageTitle: string;
  description: string;
  href: string;
  icon: "dashboard" | "orders" | "tables";
}

export interface ChefOrderItem {
  id: string;
  name: string;
  quantity: number;
  note: string;
  size: string;
}

export interface ChefOrder {
  id: string;
  orderNumber: string;
  table: string;
  customer: string;
  items: ChefOrderItem[];
  notes: string;
  status: ChefOrderStatus;
  time: string;
  acceptedAt: string;
  updatedAt: string;
  chefId: string;
  chefName: string;
}

export interface ChefTable {
  id: string;
  name: string;
  seats: number;
  status: ChefTableStatus;
  section: string;
}

export interface ChefDashboardSummary {
  acceptedOrdersToday: number;
  myPreparingOrders: number;
  readyOrders: number;
  completedToday: number;
  averagePreparationTimeMinutes: number;
  statusCounts: Record<ChefOrderStatus, number>;
  recentOrders: ChefOrder[];
  hourlyActivity: Array<{ hour: string; count: number }>;
  topItems: Array<{ id: string; name: string; quantity: number }>;
}

export interface ChefProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  restaurantId: string;
  tenantId: string;
}

export interface ChefMenuItem {
  id: string;
  name: string;
  categoryName: string;
  subCategoryName: string;
  description: string;
  imageUrl: string;
  smallPrice: number;
  mediumPrice: number;
  largePrice: number;
  available: boolean;
  active: boolean;
  prepTime: number;
}

export interface ChefMenuCategory {
  name: string;
  items: ChefMenuItem[];
}

export interface ChefPageProps {
  settings: ManagerSettings;
  summary: ChefDashboardSummary | null;
  acceptedOrders: ChefOrder[];
  myOrders: ChefOrder[];
  tables: ChefTable[];
  isLoading: boolean;
  errorMessage: string;
  actionMessage: string;
  actionError: string;
  pendingOrderId: string;
  onRefresh: () => Promise<void>;
  onStartPreparing: (orderId: string) => Promise<void>;
  onMoveToReady: (orderId: string) => Promise<void>;
  onMoveToDelivered: (orderId: string) => Promise<void>;
}
