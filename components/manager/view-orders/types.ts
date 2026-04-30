import type { SummaryMetricAccent } from "../managerTypes";

export type OrderStatus = "Accepted" | "Preparing" | "Ready" | "Delivered";
export type PaymentStatus = "Paid" | "Pending";

export type OrderStatusFilter = "All Statuses" | OrderStatus;
export type PaymentStatusFilter = "All Payments" | PaymentStatus;

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderRecord {
  id: string;
  orderId: string;
  tableNumber: string;
  customerName: string;
  createdAt: string;
  deliveredAt?: string;
  waiterName: string;
  waiterPhoneNumber: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  taxAmount: number;
  serviceCharge: number;
  items: OrderItem[];
}

export interface OrdersFilterState {
  query: string;
  paymentStatus: PaymentStatusFilter;
  orderStatus: OrderStatusFilter;
}

export interface OrdersSummaryCard {
  title: string;
  value: string;
  note: string;
  accent: SummaryMetricAccent;
}
