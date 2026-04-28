import type {
  BillMethodFilter,
  BillRecord,
  BillStatusFilter,
  CreateBillStatus,
  RefundReason,
} from "./billing.types";

export const BILLING_STATUS_OPTIONS: readonly BillStatusFilter[] = [
  "All Status",
  "Pending",
  "Paid",
  "Refunded",
] as const;

export const BILLING_METHOD_OPTIONS: readonly BillMethodFilter[] = [
  "All Methods",
  "Cash",
  "Card",
  "Online",
] as const;

export const CREATE_BILL_STATUS_OPTIONS: readonly CreateBillStatus[] = [
  "Pending",
  "Paid",
] as const;

export const REFUND_REASON_OPTIONS: readonly RefundReason[] = [
  "Customer cancelled item",
  "Wrong item served",
  "Payment correction",
  "Manager approval",
] as const;

export const BILLING_RECEIVED_BY = "Maxine - Admin Head";

export const BILLING_BASELINE = {
  waiterServedOffset: 96,
  averageBillAmountOffset: 310,
  averageBillCountOffset: 6,
  taxAndServiceOffset: 12_586,
  paymentMethodOffsets: {
    Cash: 39_550,
    Card: 26_700,
    Online: 13_000,
  } as const,
} as const;

export const INITIAL_BILL_RECORDS: BillRecord[] = [
  {
    id: "bill-record-2041",
    billId: "#BILL-2041",
    tableNumber: "T-05",
    waiterName: "Kavindu Peris",
    itemsCount: 7,
    total: 8_450,
    method: "Cash",
    status: "Paid",
    createdAt: "2026-04-27T19:18:00+05:30",
    receipt: {
      restaurantName: "MenuFlow Restaurant",
      branchName: "Chinese Dragon Cafe, Bambalapitiya",
      billId: "#BILL-2041",
      tableNumber: "T-05",
      waiterName: "Kavindu Peris",
      issuedOn: "2026-04-27T19:18:00+05:30",
      items: [
        { id: "2041-1", name: "Seafood Kottu", quantity: 2, total: 3_600 },
        { id: "2041-2", name: "Chicken Fried Rice", quantity: 1, total: 2_250 },
        { id: "2041-3", name: "Lime Soda", quantity: 3, total: 1_200 },
      ],
      subtotal: 7_161,
      taxAmount: 358,
      serviceCharge: 931,
      total: 8_450,
    },
  },
  {
    id: "bill-record-2040",
    billId: "#BILL-2040",
    tableNumber: "T-08",
    waiterName: "Sachini Gunawardena",
    itemsCount: 5,
    total: 12_300,
    method: "Card",
    status: "Paid",
    createdAt: "2026-04-27T20:02:00+05:30",
    receipt: {
      restaurantName: "MenuFlow Restaurant",
      branchName: "Chinese Dragon Cafe, Bambalapitiya",
      billId: "#BILL-2040",
      tableNumber: "T-08",
      waiterName: "Sachini Gunawardena",
      issuedOn: "2026-04-27T20:02:00+05:30",
      items: [
        { id: "2040-1", name: "Hot Butter Cuttlefish", quantity: 1, total: 4_200 },
        { id: "2040-2", name: "Singapore Noodles", quantity: 2, total: 3_800 },
        { id: "2040-3", name: "Fresh Lime", quantity: 2, total: 1_150 },
        { id: "2040-4", name: "Dessert Platter", quantity: 1, total: 1_274 },
      ],
      subtotal: 10_424,
      taxAmount: 521,
      serviceCharge: 1_355,
      total: 12_300,
    },
  },
  {
    id: "bill-record-2039",
    billId: "#BILL-2039",
    tableNumber: "T-12",
    waiterName: "Rashmi De Alwis",
    itemsCount: 4,
    total: 6_740,
    method: "Pending",
    status: "Pending",
    createdAt: "2026-04-27T20:14:00+05:30",
    receipt: {
      restaurantName: "MenuFlow Restaurant",
      branchName: "Chinese Dragon Cafe, Bambalapitiya",
      billId: "#BILL-2039",
      tableNumber: "T-12",
      waiterName: "Rashmi De Alwis",
      issuedOn: "2026-04-27T20:14:00+05:30",
      items: [
        { id: "2039-1", name: "Devilled Chicken", quantity: 1, total: 2_450 },
        { id: "2039-2", name: "Egg Fried Rice", quantity: 1, total: 1_860 },
        { id: "2039-3", name: "Mint Mojito", quantity: 2, total: 1_402 },
      ],
      subtotal: 5_712,
      taxAmount: 286,
      serviceCharge: 742,
      total: 6_740,
    },
  },
  {
    id: "bill-record-2038",
    billId: "#BILL-2038",
    tableNumber: "T-03",
    waiterName: "Kavindu Peris",
    itemsCount: 6,
    total: 10_900,
    method: "Pending",
    status: "Pending",
    createdAt: "2026-04-27T20:21:00+05:30",
    receipt: {
      restaurantName: "MenuFlow Restaurant",
      branchName: "Chinese Dragon Cafe, Bambalapitiya",
      billId: "#BILL-2038",
      tableNumber: "T-03",
      waiterName: "Kavindu Peris",
      issuedOn: "2026-04-27T20:21:00+05:30",
      items: [
        { id: "2038-1", name: "Mixed Seafood Rice", quantity: 2, total: 4_180 },
        { id: "2038-2", name: "Dragon Chicken", quantity: 1, total: 2_960 },
        { id: "2038-3", name: "Passion Fruit Cooler", quantity: 3, total: 2_097 },
      ],
      subtotal: 9_237,
      taxAmount: 462,
      serviceCharge: 1_201,
      total: 10_900,
    },
  },
];
