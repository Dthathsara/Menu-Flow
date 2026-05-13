import type { SummaryCardAccent } from "@/components/common/SummaryCard";

export type BillStatus = "Pending" | "Paid" | "Refunded";

export type BillMethod = "Cash" | "Card" | "Online" | "Pending";

export type BillStatusFilter = "All Status" | BillStatus;

export type BillMethodFilter = "All Methods" | Exclude<BillMethod, "Pending">;

export type CreateBillStatus = "Pending" | "Paid";

export type RefundReason =
  | "Customer cancelled item"
  | "Wrong item served"
  | "Payment correction"
  | "Manager approval";

export interface ReceiptLineItem {
  id: string;
  name: string;
  quantity: number;
  total: number;
}

export interface BillReceipt {
  restaurantName: string;
  branchName: string;
  billId: string;
  tableNumber: string;
  waiterName: string;
  issuedOn: string;
  items: ReceiptLineItem[];
  subtotal: number;
  taxAmount: number;
  serviceCharge: number;
  total: number;
}

export interface BillRecord {
  id: string;
  billId: string;
  tableNumber: string;
  waiterName: string;
  itemsCount: number;
  total: number;
  method: BillMethod;
  status: BillStatus;
  createdAt: string;
  receipt: BillReceipt;
  refundReason?: RefundReason;
}

export interface BillingStat {
  label: string;
  value: string;
  helper: string;
  accent: SummaryCardAccent;
}

export interface CashierSummaryMetric {
  label: string;
  value: string;
  helper: string;
}

export interface PaymentMethodSummary {
  method: Exclude<BillMethod, "Pending">;
  label: string;
  description: string;
  amount: number;
  percent: number;
  accentClassName: string;
}

export interface BillingMetrics {
  heroStats: BillingStat[];
  cashierSummary: CashierSummaryMetric[];
  paymentMethods: PaymentMethodSummary[];
}

export interface ToastMessage {
  id: string;
  title: string;
}

export interface CreateBillFormValues {
  tableNumber: string;
  waiterName: string;
  totalAmount: string;
  status: CreateBillStatus;
}
