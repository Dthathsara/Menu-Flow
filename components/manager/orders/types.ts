import type { SummaryCardAccent } from "@/components/common/SummaryCard";

export type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready"
  | "delivered";

export type PaymentStatus = "paid" | "unpaid" | "failed" | "refunded";

export type OrderStatusFilter = "All Statuses" | OrderStatus;
export type PaymentStatusFilter = "All Payments" | PaymentStatus;

export interface OrderItem {
  id: string;
  menu_item_id: string;
  name: string;
  serving_size: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  prep_time_min: number;
  note: string;
}

export interface OrderStatusHistoryUser {
  id: string;
  name: string;
  role: string;
  email?: string | null;
}

export interface OrderStatusHistoryEntry {
  id?: string | null;
  status: string;
  changedAt: string;
  changedById?: string | null;
  changedByRole?: string | null;
  changedBy?: OrderStatusHistoryUser | null;
}

export interface OrderRecord {
  id: string;
  order_number: string;
  table_id: string;
  customer_name: string;
  customer_phone: string;
  placed_at: string;
  updated_at: string;
  pendingAt?: string | null;
  acceptedAt?: string | null;
  preparingAt?: string | null;
  readyAt?: string | null;
  deliveredAt?: string | null;
  order_type: string;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  item_note: string;
  subtotal: number;
  tax_amount: number;
  service_charge_amount: number;
  discount_amount: number;
  total_amount: number;
  items: OrderItem[];
  statusHistory: OrderStatusHistoryEntry[];
}

export interface OrdersFilterState {
  query: string;
  paymentStatus: PaymentStatusFilter;
  orderStatus: OrderStatusFilter;
}

export interface OrdersSummary {
  totalOrders: number;
  pendingPayments: number;
  activeOrders: number;
  deliveredToday: number;
  pendingAmount: number;
}

export interface OrdersSummaryCard {
  title: string;
  value: string;
  note: string;
  accent: SummaryCardAccent;
}
