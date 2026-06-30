import type {
  OrderRecord,
  OrdersFilterState,
  OrdersSummary,
  OrdersSummaryCard,
  OrderStatus,
  PaymentStatus,
} from "./types";

export const ORDER_STATUS_OPTIONS = [
  "All Statuses",
  "accepted",
  "preparing",
  "ready",
  "delivered",
  "cancelled",
] as const;

export const PAYMENT_STATUS_OPTIONS = [
  "All Payments",
  "paid",
  "unpaid",
  "failed",
  "refunded",
] as const;

export const EDITABLE_ORDER_STATUSES: OrderStatus[] = [
  "accepted",
  "preparing",
  "ready",
  "delivered",
  "cancelled",
];

const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  accepted: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

export function getAllowedOrderStatusTransitions(
  currentStatus: OrderStatus,
) {
  return ORDER_STATUS_TRANSITIONS[currentStatus];
}

export function isOrderStatusTransitionAllowed(
  currentStatus: OrderStatus,
  nextStatus: OrderStatus,
) {
  return ORDER_STATUS_TRANSITIONS[currentStatus].includes(nextStatus);
}

export function getOrderItemCount(order: OrderRecord) {
  return order.items.length;
}

export function getOrdersSummaryCards(summary: OrdersSummary): OrdersSummaryCard[] {
  return [
    {
      title: "Total Orders",
      value: String(summary.totalOrders),
      note: `${summary.activeOrders} active orders`,
      accent: "blue",
    },
    {
      title: "Pending Payments",
      value: String(summary.pendingPayments),
      note: `Rs. ${summary.pendingAmount.toLocaleString("en-LK")} unpaid`,
      accent: "amber",
    },
    {
      title: "Active Orders",
      value: String(summary.activeOrders),
      note: "Accepted, preparing, and ready queues combined",
      accent: "purple",
    },
    {
      title: "Delivered Today",
      value: String(summary.deliveredToday),
      note: "Completed orders from today",
      accent: "green",
    },
  ];
}

export function getEmptyOrdersSummary(): OrdersSummary {
  return {
    totalOrders: 0,
    pendingPayments: 0,
    activeOrders: 0,
    deliveredToday: 0,
    pendingAmount: 0,
  };
}

export function filterOrdersLocally(
  orders: OrderRecord[],
  filters: OrdersFilterState,
) {
  const normalizedQuery = filters.query.trim().toLowerCase();

  return orders.filter((order) => {
    const matchesQuery =
      !normalizedQuery ||
      order.order_number.toLowerCase().includes(normalizedQuery) ||
      order.table_id.toLowerCase().includes(normalizedQuery) ||
      order.customer_name.toLowerCase().includes(normalizedQuery) ||
      order.customer_phone.toLowerCase().includes(normalizedQuery);
    const matchesPayment =
      filters.paymentStatus === "All Payments" ||
      order.payment_status === filters.paymentStatus;
    const matchesStatus =
      filters.orderStatus === "All Statuses" ||
      order.order_status === filters.orderStatus;

    return matchesQuery && matchesPayment && matchesStatus;
  });
}

export function sortOrdersByNewest(orders: OrderRecord[]) {
  return [...orders].sort(
    (left, right) =>
      new Date(right.placed_at).getTime() - new Date(left.placed_at).getTime(),
  );
}

export function formatStatusLabel(status: OrderStatus | PaymentStatus | string) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
