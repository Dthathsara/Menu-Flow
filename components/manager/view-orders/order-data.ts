import type {
  OrderItem,
  OrderRecord,
  OrdersFilterState,
  OrdersSummaryCard,
  OrderStatus,
  OrderStatusFilter,
  PaymentStatus,
  PaymentStatusFilter,
} from "./types";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const ORDER_STATUS_PRIORITY: Record<OrderStatus, number> = {
  Accepted: 0,
  Preparing: 1,
  Ready: 2,
  Delivered: 3,
};

const PAYMENT_STATUS_PRIORITY: Record<PaymentStatus, number> = {
  Pending: 0,
  Paid: 1,
};

function createItem(
  id: string,
  name: string,
  quantity: number,
  unitPrice: number,
): OrderItem {
  return {
    id,
    name,
    quantity,
    unitPrice,
  };
}

function createOrder(order: OrderRecord): OrderRecord {
  return order;
}

function startOfDay(value: Date) {
  const normalized = new Date(value);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

export const PAYMENT_STATUS_OPTIONS: readonly PaymentStatusFilter[] = [
  "All Payments",
  "Paid",
  "Pending",
];

export const ORDER_STATUS_OPTIONS: readonly OrderStatusFilter[] = [
  "All Statuses",
  "Accepted",
  "Preparing",
  "Ready",
  "Delivered",
];

export const ORDER_RECORDS: OrderRecord[] = [
  createOrder({
    id: "order-1024",
    orderId: "ORD-1024",
    tableNumber: "T-08",
    customerName: "Amaya Perera",
    createdAt: "2026-04-23T12:42:00+05:30",
    waiterName: "Kasun Silva",
    waiterPhoneNumber: "+94 77 415 8221",
    orderStatus: "Accepted",
    paymentStatus: "Pending",
    taxAmount: 420,
    serviceCharge: 350,
    items: [
      createItem("1024-1", "Seafood Kottu", 2, 1450),
      createItem("1024-2", "Lime Soda", 2, 380),
      createItem("1024-3", "Garlic Mayo Dip", 1, 260),
    ],
  }),
  createOrder({
    id: "order-1031",
    orderId: "ORD-1031",
    tableNumber: "T-03",
    customerName: "Noah Fernando",
    createdAt: "2026-04-23T12:18:00+05:30",
    waiterName: "Dinithi Jayasekara",
    waiterPhoneNumber: "+94 71 884 2021",
    orderStatus: "Accepted",
    paymentStatus: "Paid",
    taxAmount: 355,
    serviceCharge: 285,
    items: [
      createItem("1031-1", "Chicken Teriyaki Bowl", 2, 1320),
      createItem("1031-2", "Sparkling Water", 1, 420),
      createItem("1031-3", "Chocolate Mousse", 1, 760),
    ],
  }),
  createOrder({
    id: "order-1028",
    orderId: "ORD-1028",
    tableNumber: "T-11",
    customerName: "Ishara Dahanayake",
    createdAt: "2026-04-23T12:35:00+05:30",
    waiterName: "Kasun Silva",
    waiterPhoneNumber: "+94 77 415 8221",
    orderStatus: "Preparing",
    paymentStatus: "Pending",
    taxAmount: 515,
    serviceCharge: 430,
    items: [
      createItem("1028-1", "Black Pepper Prawns", 1, 2950),
      createItem("1028-2", "Steamed Rice", 2, 420),
      createItem("1028-3", "Mint Cooler", 2, 440),
    ],
  }),
  createOrder({
    id: "order-1034",
    orderId: "ORD-1034",
    tableNumber: "T-14",
    customerName: "Sanjana Hettiarachchi",
    createdAt: "2026-04-23T11:56:00+05:30",
    waiterName: "Nuwan Peris",
    waiterPhoneNumber: "+94 76 942 5570",
    orderStatus: "Preparing",
    paymentStatus: "Paid",
    taxAmount: 308,
    serviceCharge: 250,
    items: [
      createItem("1034-1", "Smoked Chicken Wrap", 2, 1180),
      createItem("1034-2", "Sweet Potato Fries", 1, 720),
      createItem("1034-3", "Iced Americano", 2, 520),
    ],
  }),
  createOrder({
    id: "order-1027",
    orderId: "ORD-1027",
    tableNumber: "T-05",
    customerName: "Liam Peiris",
    createdAt: "2026-04-23T12:09:00+05:30",
    waiterName: "Dinithi Jayasekara",
    waiterPhoneNumber: "+94 71 884 2021",
    orderStatus: "Ready",
    paymentStatus: "Pending",
    taxAmount: 246,
    serviceCharge: 205,
    items: [
      createItem("1027-1", "Margherita Pizza", 1, 2280),
      createItem("1027-2", "Roasted Tomato Soup", 2, 640),
      createItem("1027-3", "Still Water", 1, 280),
    ],
  }),
  createOrder({
    id: "order-1030",
    orderId: "ORD-1030",
    tableNumber: "T-09",
    customerName: "Mia Ranasinghe",
    createdAt: "2026-04-22T20:14:00+05:30",
    deliveredAt: "2026-04-22T20:46:00+05:30",
    waiterName: "Akeel Farook",
    waiterPhoneNumber: "+94 70 881 9904",
    orderStatus: "Ready",
    paymentStatus: "Paid",
    taxAmount: 300,
    serviceCharge: 240,
    items: [
      createItem("1030-1", "Grilled Salmon Plate", 1, 2780),
      createItem("1030-2", "Herb Rice", 1, 560),
      createItem("1030-3", "Passionfruit Mojito", 1, 820),
    ],
  }),
  createOrder({
    id: "order-1026",
    orderId: "ORD-1026",
    tableNumber: "T-01",
    customerName: "Ethan Wickramasinghe",
    createdAt: "2026-04-23T10:21:00+05:30",
    deliveredAt: "2026-04-23T10:54:00+05:30",
    waiterName: "Nuwan Peris",
    waiterPhoneNumber: "+94 76 942 5570",
    orderStatus: "Delivered",
    paymentStatus: "Pending",
    taxAmount: 270,
    serviceCharge: 220,
    items: [
      createItem("1026-1", "Classic Beef Burger", 2, 1260),
      createItem("1026-2", "Crispy Fries", 1, 680),
      createItem("1026-3", "Vanilla Milkshake", 1, 760),
    ],
  }),
  createOrder({
    id: "order-1029",
    orderId: "ORD-1029",
    tableNumber: "T-12",
    customerName: "Olivia Rajapaksa",
    createdAt: "2026-04-23T09:38:00+05:30",
    deliveredAt: "2026-04-23T10:02:00+05:30",
    waiterName: "Kasun Silva",
    waiterPhoneNumber: "+94 77 415 8221",
    orderStatus: "Delivered",
    paymentStatus: "Paid",
    taxAmount: 198,
    serviceCharge: 165,
    items: [
      createItem("1029-1", "Avocado Toast", 2, 980),
      createItem("1029-2", "Cold Brew", 2, 520),
    ],
  }),
  createOrder({
    id: "order-1021",
    orderId: "ORD-1021",
    tableNumber: "T-06",
    customerName: "Charlotte Weerasinghe",
    createdAt: "2026-04-22T13:06:00+05:30",
    deliveredAt: "2026-04-22T13:41:00+05:30",
    waiterName: "Akeel Farook",
    waiterPhoneNumber: "+94 70 881 9904",
    orderStatus: "Delivered",
    paymentStatus: "Pending",
    taxAmount: 360,
    serviceCharge: 300,
    items: [
      createItem("1021-1", "Butter Chicken", 1, 2180),
      createItem("1021-2", "Garlic Naan", 3, 390),
      createItem("1021-3", "Mango Lassi", 2, 560),
    ],
  }),
  createOrder({
    id: "order-1018",
    orderId: "ORD-1018",
    tableNumber: "T-15",
    customerName: "Daniel Gunawardena",
    createdAt: "2026-04-21T19:28:00+05:30",
    deliveredAt: "2026-04-21T20:01:00+05:30",
    waiterName: "Dinithi Jayasekara",
    waiterPhoneNumber: "+94 71 884 2021",
    orderStatus: "Delivered",
    paymentStatus: "Paid",
    taxAmount: 476,
    serviceCharge: 392,
    items: [
      createItem("1018-1", "Tomahawk Pork Chop", 1, 3650),
      createItem("1018-2", "Truffle Mash", 1, 1100),
      createItem("1018-3", "House Cola", 2, 420),
    ],
  }),
];

export function calculateOrderSubtotal(items: OrderItem[]) {
  return items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
}

export function calculateOrderGrandTotal(order: OrderRecord) {
  return calculateOrderSubtotal(order.items) + order.taxAmount + order.serviceCharge;
}

export function getOrderItemCount(order: OrderRecord) {
  return order.items.reduce((total, item) => total + item.quantity, 0);
}

export function getDatePriority(createdAt: string, referenceDate = new Date()) {
  const differenceInDays = Math.floor(
    (startOfDay(referenceDate).getTime() - startOfDay(new Date(createdAt)).getTime()) /
      DAY_IN_MS,
  );

  if (differenceInDays <= 0) {
    return 0;
  }

  if (differenceInDays === 1) {
    return 1;
  }

  return 2;
}

export function filterOrders(
  orders: OrderRecord[],
  filters: OrdersFilterState,
): OrderRecord[] {
  const normalizedQuery = filters.query.trim().toLowerCase();

  return orders.filter((order) => {
    const matchesQuery =
      !normalizedQuery ||
      order.orderId.toLowerCase().includes(normalizedQuery) ||
      order.tableNumber.toLowerCase().includes(normalizedQuery) ||
      order.customerName.toLowerCase().includes(normalizedQuery);
    const matchesPayment =
      filters.paymentStatus === "All Payments" ||
      order.paymentStatus === filters.paymentStatus;
    const matchesStatus =
      filters.orderStatus === "All Statuses" ||
      order.orderStatus === filters.orderStatus;

    return matchesQuery && matchesPayment && matchesStatus;
  });
}

export function sortOrders(
  orders: OrderRecord[],
  referenceDate = new Date(),
): OrderRecord[] {
  return [...orders].sort((left, right) => {
    const statusDifference =
      ORDER_STATUS_PRIORITY[left.orderStatus] - ORDER_STATUS_PRIORITY[right.orderStatus];

    if (statusDifference !== 0) {
      return statusDifference;
    }

    const paymentDifference =
      PAYMENT_STATUS_PRIORITY[left.paymentStatus] -
      PAYMENT_STATUS_PRIORITY[right.paymentStatus];

    if (paymentDifference !== 0) {
      return paymentDifference;
    }

    const dayDifference =
      getDatePriority(left.createdAt, referenceDate) -
      getDatePriority(right.createdAt, referenceDate);

    if (dayDifference !== 0) {
      return dayDifference;
    }

    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });
}

export function getFilteredAndSortedOrders(
  orders: OrderRecord[],
  filters: OrdersFilterState,
  referenceDate = new Date(),
) {
  return sortOrders(filterOrders(orders, filters), referenceDate);
}

export function getOrdersSummaryCards(
  orders: OrderRecord[],
  referenceDate = new Date(),
): OrdersSummaryCard[] {
  const pendingOrders = orders.filter((order) => order.paymentStatus === "Pending");
  const activeOrders = orders.filter((order) => order.orderStatus !== "Delivered");
  const deliveredToday = orders.filter(
    (order) =>
      order.orderStatus === "Delivered" && getDatePriority(order.createdAt, referenceDate) === 0,
  );
  const pendingAmount = pendingOrders.reduce(
    (total, order) => total + calculateOrderGrandTotal(order),
    0,
  );

  return [
    {
      title: "Total Orders",
      value: String(orders.length),
      note: `${activeOrders.length} currently active across the floor`,
      accentClassName: "from-blue-500/20 via-blue-500/8 to-transparent",
    },
    {
      title: "Pending Payments",
      value: String(pendingOrders.length),
      note: `Rs. ${pendingAmount.toLocaleString("en-LK")} awaiting collection`,
      accentClassName: "from-amber-500/22 via-amber-500/8 to-transparent",
    },
    {
      title: "Active Orders",
      value: String(activeOrders.length),
      note: "Accepted, preparing, and ready queues combined",
      accentClassName: "from-violet-500/20 via-violet-500/8 to-transparent",
    },
    {
      title: "Delivered Today",
      value: String(deliveredToday.length),
      note: "Completed and handed over since opening",
      accentClassName: "from-emerald-500/18 via-emerald-500/8 to-transparent",
    },
  ];
}
