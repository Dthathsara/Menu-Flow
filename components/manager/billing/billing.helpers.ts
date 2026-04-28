import {
  cn,
  getManagerBadgeClasses,
  getManagerDangerButtonClasses,
  getManagerPrimaryButtonClasses,
  getManagerSecondaryButtonClasses,
  getManagerSuccessButtonClasses,
  getManagerTableActionButtonClasses,
} from "../managerUtils";
import { BILLING_BASELINE } from "./billing.data";
import type {
  BillMethod,
  BillMethodFilter,
  BillingMetrics,
  BillRecord,
  BillStatus,
  BillStatusFilter,
  CreateBillFormValues,
} from "./billing.types";

export function formatCurrency(amount: number) {
  return `Rs. ${amount.toLocaleString("en-LK")}`;
}

export function formatReceiptDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function getBillStatusBadgeClasses(status: BillStatus, scheme: "light" | "dark") {
  if (status === "Paid") {
    return cn(
      "inline-flex items-center rounded-full border px-3 py-1 text-[12px] font-semibold",
      getManagerBadgeClasses("teal", scheme),
    );
  }

  if (status === "Refunded") {
    return cn(
      "inline-flex items-center rounded-full border px-3 py-1 text-[12px] font-semibold",
      getManagerBadgeClasses("danger", scheme),
    );
  }

  return cn(
    "inline-flex items-center rounded-full border px-3 py-1 text-[12px] font-semibold",
    getManagerBadgeClasses("amber", scheme),
  );
}

export function getMethodBadgeLabel(method: BillMethod) {
  return method === "Pending" ? "Pending" : method;
}

export function filterBills(
  bills: BillRecord[],
  query: string,
  statusFilter: BillStatusFilter,
  methodFilter: BillMethodFilter,
) {
  const normalizedQuery = query.trim().toLowerCase();

  return bills.filter((bill) => {
    const matchesQuery =
      !normalizedQuery ||
      [bill.billId, bill.tableNumber, bill.waiterName]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);

    const matchesStatus = statusFilter === "All Status" || bill.status === statusFilter;
    const matchesMethod = methodFilter === "All Methods" || bill.method === methodFilter;

    return matchesQuery && matchesStatus && matchesMethod;
  });
}

export function getPendingBills(bills: BillRecord[]) {
  return bills.filter((bill) => bill.status === "Pending");
}

export function calculateBillingMetrics(bills: BillRecord[]): BillingMetrics {
  const activeBills = bills.filter((bill) => bill.status !== "Refunded");
  const paidBills = bills.filter((bill) => bill.status === "Paid");
  const pendingBills = bills.filter((bill) => bill.status === "Pending");
  const totalGross = activeBills.reduce((sum, bill) => sum + bill.total, 0);
  const taxAndService =
    activeBills.reduce(
      (sum, bill) => sum + bill.receipt.taxAmount + bill.receipt.serviceCharge,
      0,
    ) + BILLING_BASELINE.taxAndServiceOffset;
  const totalItemsServed =
    bills.reduce((sum, bill) => sum + bill.itemsCount, 0) + BILLING_BASELINE.waiterServedOffset;

  const paymentMethodAmounts = {
    Cash:
      paidBills
        .filter((bill) => bill.method === "Cash")
        .reduce((sum, bill) => sum + bill.total, 0) + BILLING_BASELINE.paymentMethodOffsets.Cash,
    Card:
      paidBills
        .filter((bill) => bill.method === "Card")
        .reduce((sum, bill) => sum + bill.total, 0) + BILLING_BASELINE.paymentMethodOffsets.Card,
    Online:
      paidBills
        .filter((bill) => bill.method === "Online")
        .reduce((sum, bill) => sum + bill.total, 0) + BILLING_BASELINE.paymentMethodOffsets.Online,
  };

  const paymentTotal =
    paymentMethodAmounts.Cash + paymentMethodAmounts.Card + paymentMethodAmounts.Online;

  const averageBillValue = Math.round(
    (totalGross + BILLING_BASELINE.averageBillAmountOffset) /
      (activeBills.length + BILLING_BASELINE.averageBillCountOffset),
  );

  return {
    heroStats: [
      {
        label: "TODAY REVENUE",
        value: formatCurrency(paidBills.reduce((sum, bill) => sum + bill.total, 0)),
        helper: "Paid bills collected today.",
      },
      {
        label: "PENDING TABLES",
        value: pendingBills.length.toString().padStart(2, "0"),
        helper: "Tables waiting for cashier settlement.",
      },
      {
        label: "BILLS GENERATED",
        value: `${bills.length}`,
        helper: "Receipts generated from QR orders.",
      },
      {
        label: "WAITER SERVED",
        value: `${totalItemsServed}`,
        helper: "Items served by floor staff today.",
      },
      {
        label: "AVG BILL VALUE",
        value: formatCurrency(averageBillValue),
        helper: "Average payment per table.",
      },
    ],
    cashierSummary: [
      {
        label: "COLLECTED TODAY",
        value: formatCurrency(paidBills.reduce((sum, bill) => sum + bill.total, 0)),
        helper: "Confirmed payments from QR table bills.",
      },
      {
        label: "PENDING COLLECTION",
        value: formatCurrency(pendingBills.reduce((sum, bill) => sum + bill.total, 0)),
        helper: "Bills not fully settled yet.",
      },
      {
        label: "TAX + SERVICE",
        value: formatCurrency(taxAndService),
        helper: "Tax and service contribution included in billing.",
      },
    ],
    paymentMethods: [
      {
        method: "Cash",
        label: "Cash",
        description: "Counter settlement",
        amount: paymentMethodAmounts.Cash,
        percent: Math.round((paymentMethodAmounts.Cash / paymentTotal) * 100),
        accentClassName: "from-blue-500 to-sky-400",
      },
      {
        method: "Card",
        label: "Card",
        description: "POS machine payment",
        amount: paymentMethodAmounts.Card,
        percent: Math.round((paymentMethodAmounts.Card / paymentTotal) * 100),
        accentClassName: "from-violet-500 to-fuchsia-400",
      },
      {
        method: "Online",
        label: "Online",
        description: "Future gateway support",
        amount: paymentMethodAmounts.Online,
        percent: Math.round((paymentMethodAmounts.Online / paymentTotal) * 100),
        accentClassName: "from-teal-400 to-cyan-400",
      },
    ],
  };
}

export function getNextBillId(bills: BillRecord[]) {
  const latest = bills.reduce((highest, bill) => {
    const numeric = Number.parseInt(bill.billId.replace(/\D/g, ""), 10);
    return Number.isNaN(numeric) ? highest : Math.max(highest, numeric);
  }, 2038);

  return `#BILL-${latest + 1}`;
}

export function estimateItemCount(total: number) {
  return Math.max(2, Math.min(9, Math.round(total / 1_750)));
}

export function buildDraftBill(
  values: CreateBillFormValues,
  existingBills: BillRecord[],
): BillRecord {
  const total = Number(values.totalAmount);
  const billId = getNextBillId(existingBills);
  const serviceCharge = Math.round(total * 0.11);
  const taxAmount = Math.round(total * 0.042);
  const subtotal = total - serviceCharge - taxAmount;
  const primary = Math.round(subtotal * 0.46);
  const secondary = Math.round(subtotal * 0.31);
  const tertiary = subtotal - primary - secondary;
  const createdAt = new Date().toISOString();

  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `bill-${Date.now()}`,
    billId,
    tableNumber: values.tableNumber.trim().toUpperCase(),
    waiterName: values.waiterName.trim(),
    itemsCount: estimateItemCount(total),
    total,
    method: values.status === "Paid" ? "Cash" : "Pending",
    status: values.status,
    createdAt,
    receipt: {
      restaurantName: "MenuFlow Restaurant",
      branchName: "Chinese Dragon Cafe, Bambalapitiya",
      billId,
      tableNumber: values.tableNumber.trim().toUpperCase(),
      waiterName: values.waiterName.trim(),
      issuedOn: createdAt,
      items: [
        { id: `${billId}-1`, name: "QR Table Order", quantity: 1, total: primary },
        { id: `${billId}-2`, name: "Kitchen Service", quantity: 1, total: secondary },
        { id: `${billId}-3`, name: "Beverages", quantity: 1, total: tertiary },
      ],
      subtotal,
      taxAmount,
      serviceCharge,
      total,
    },
  };
}

export function getPrimaryTableButtonClasses(scheme: "light" | "dark") {
  return cn(getManagerTableActionButtonClasses(scheme), "h-9 rounded-[10px] px-3 text-[13px]");
}

export function getBrandTableButtonClasses(scheme: "light" | "dark") {
  return cn(getManagerPrimaryButtonClasses(scheme), "h-10 rounded-[14px] px-4 text-[14px]");
}

export function getRefundButtonClasses(scheme: "light" | "dark") {
  return cn(getManagerDangerButtonClasses(scheme), "h-10 rounded-[14px] px-5 text-[14px]");
}

export function getMutedButtonClasses(scheme: "light" | "dark") {
  return cn(getManagerSecondaryButtonClasses(scheme), "h-10 rounded-[14px] px-4 text-[14px]");
}

export function getSuccessButtonClasses(scheme: "light" | "dark") {
  return cn(getManagerSuccessButtonClasses(scheme), "h-10 rounded-[14px] px-5 text-[14px]");
}
