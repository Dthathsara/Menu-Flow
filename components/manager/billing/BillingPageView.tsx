"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createBillingBill,
  fetchBilling,
  fetchBillingExport,
  payBillingBill,
  refundBillingBill,
} from "@/lib/manager-billing-api";
import { fetchWaiterStaffMembers } from "@/lib/manager-staff-api";
import { SessionExpiredError } from "@/lib/auth-session";
import { cn, getManagerCardShellClasses, getManagerPageSectionClasses } from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import { BILLING_RECEIVED_BY } from "./billing.data";
import { BillingHeader } from "./BillingHeader";
import { BillReceiptModal } from "./BillReceiptModal";
import { CashierSummaryCard } from "./CashierSummaryCard";
import { CollectPaymentModal } from "./CollectPaymentModal";
import { CreateBillModal } from "./CreateBillModal";
import { PaymentMethodsCard } from "./PaymentMethodsCard";
import { PendingCollectionQueue } from "./PendingCollectionQueue";
import { RefundBillModal } from "./RefundBillModal";
import { TableBillsCard } from "./TableBillsCard";
import { formatCurrency, formatReceiptDate } from "./billing.helpers";
import type {
  BillingPageData,
  BillingStat,
  BillMethodFilter,
  BillRecord,
  BillStatusFilter,
  CreateBillFormValues,
  RefundReason,
  ToastMessage,
} from "./billing.types";

interface BillingPageViewProps {
  settings: ManagerSettings;
}

export function BillingPageView({ settings }: BillingPageViewProps) {
  const [billingData, setBillingData] = useState<BillingPageData | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BillStatusFilter>("All Status");
  const [methodFilter, setMethodFilter] = useState<BillMethodFilter>("All Methods");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [receiptBill, setReceiptBill] = useState<BillRecord | null>(null);
  const [paymentBill, setPaymentBill] = useState<BillRecord | null>(null);
  const [refundBill, setRefundBill] = useState<BillRecord | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [isRefunding, setIsRefunding] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [modalErrorMessage, setModalErrorMessage] = useState("");
  const [waiterSuggestions, setWaiterSuggestions] = useState<string[]>([]);

  const loadBilling = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      setBillingData(
        await fetchBilling({
          search: query,
          status: statusFilter,
          method: methodFilter,
        }),
      );
    } catch (error) {
      setBillingData(null);
      setErrorMessage(getBillingErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [methodFilter, query, statusFilter]);

  useEffect(() => {
    void loadBilling();
  }, [loadBilling]);

  useEffect(() => {
    if (!createModalOpen) {
      return;
    }

    let isActive = true;

    fetchWaiterStaffMembers()
      .then((waiters) => {
        if (!isActive) {
          return;
        }

        setWaiterSuggestions(
          Array.from(new Set(waiters.map((waiter) => waiter.fullName.trim()).filter(Boolean))),
        );
      })
      .catch(() => {
        if (isActive) {
          setWaiterSuggestions([]);
        }
      });

    return () => {
      isActive = false;
    };
  }, [createModalOpen]);

  const bills = billingData?.bills ?? [];
  const pendingBills = billingData?.pendingCollectionQueue ?? bills.filter((bill) => bill.status === "Pending");
  const heroStats = buildHeroStats(billingData?.stats);
  const cashierSummary = billingData?.cashierSummary ?? [];
  const paymentMethods = billingData?.paymentMethods ?? [];

  function pushToast(title: string) {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `toast-${Date.now()}`;

    setToasts((current) => [...current, { id, title }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 2800);
  }

  async function handleCreateBill(values: CreateBillFormValues) {
    const validationError = validateCreateBill(values);

    if (validationError) {
      setModalErrorMessage(validationError);
      return;
    }

    setIsCreating(true);
    setModalErrorMessage("");

    try {
      const nextBill = await createBillingBill(values);
      setCreateModalOpen(false);
      pushToast(`${nextBill.billId} created successfully.`);
      await loadBilling();
    } catch (error) {
      setModalErrorMessage(getBillingErrorMessage(error));
    } finally {
      setIsCreating(false);
    }
  }

  async function handleCollectPayment(method: Exclude<BillMethodFilter, "All Methods">) {
    if (!paymentBill) {
      return;
    }

    setIsPaying(true);
    setModalErrorMessage("");

    try {
      await payBillingBill(paymentBill.id, method);
      pushToast(`${paymentBill.billId} marked as paid by ${BILLING_RECEIVED_BY}.`);
      setPaymentBill(null);
      await loadBilling();
    } catch (error) {
      setModalErrorMessage(getBillingErrorMessage(error));
    } finally {
      setIsPaying(false);
    }
  }

  async function handleRefund(reason: RefundReason) {
    if (!refundBill) {
      return;
    }

    setIsRefunding(true);
    setModalErrorMessage("");

    try {
      await refundBillingBill(refundBill.id, reason);
      pushToast(`${refundBill.billId} refunded successfully.`);
      setRefundBill(null);
      await loadBilling();
    } catch (error) {
      setModalErrorMessage(getBillingErrorMessage(error));
    } finally {
      setIsRefunding(false);
    }
  }

  async function handleExportReport() {
    if (isExporting) {
      return;
    }

    setIsExporting(true);
    setErrorMessage("");

    try {
      await exportBillingReportPdf(await fetchBillingExport());
    } catch (error) {
      setErrorMessage(getBillingErrorMessage(error));
    } finally {
      setIsExporting(false);
    }
  }

  async function handleDownloadReceiptPdf(bill: BillRecord) {
    try {
      await exportBillReceiptPdf(bill);
      pushToast(`${bill.billId} PDF downloaded.`);
    } catch (error) {
      pushToast(
        error instanceof Error && error.message
          ? error.message
          : "Unable to download receipt PDF.",
      );
    }
  }

  return (
    <>
      <section className={getManagerPageSectionClasses()}>
        <div className="space-y-6">
          <BillingHeader
            settings={settings}
            stats={heroStats}
            onExportReport={handleExportReport}
            isExporting={isExporting}
          />

          {errorMessage ? (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-5 py-4 text-sm font-semibold text-rose-300">
              {errorMessage}
              <button
                type="button"
                onClick={() => void loadBilling()}
                className="ml-4 underline underline-offset-4"
              >
                Retry
              </button>
            </div>
          ) : null}

          <section className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
            <TableBillsCard
              settings={settings}
              bills={bills}
              query={query}
              statusFilter={statusFilter}
              methodFilter={methodFilter}
              isLoading={isLoading}
              onQueryChange={setQuery}
              onStatusChange={setStatusFilter}
              onMethodChange={setMethodFilter}
              onCreateBill={() => setCreateModalOpen(true)}
              onView={setReceiptBill}
              onCollectPayment={setPaymentBill}
              onRefund={setRefundBill}
            />
            <CashierSummaryCard settings={settings} metrics={cashierSummary} />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <PendingCollectionQueue
              settings={settings}
              bills={pendingBills}
              onCollect={setPaymentBill}
            />
            <PaymentMethodsCard settings={settings} methods={paymentMethods} />
          </section>
        </div>
      </section>

      {createModalOpen ? (
        <CreateBillModal
          key="create-bill"
          open
          settings={settings}
          onClose={() => setCreateModalOpen(false)}
          onCreate={handleCreateBill}
          isSaving={isCreating}
          errorMessage={modalErrorMessage}
          waiterSuggestions={waiterSuggestions}
        />
      ) : null}

      {receiptBill ? (
        <BillReceiptModal
          open
          settings={settings}
          bill={receiptBill}
          onClose={() => setReceiptBill(null)}
          onDownloadPdf={() => void handleDownloadReceiptPdf(receiptBill)}
        />
      ) : null}

      {paymentBill ? (
        <CollectPaymentModal
          key={paymentBill.id}
          open
          settings={settings}
          bill={paymentBill}
          onClose={() => {
            if (!isPaying) {
              setPaymentBill(null);
              setModalErrorMessage("");
            }
          }}
          onConfirm={handleCollectPayment}
          isSaving={isPaying}
          errorMessage={modalErrorMessage}
        />
      ) : null}

      {refundBill ? (
        <RefundBillModal
          key={refundBill.id}
          open
          settings={settings}
          bill={refundBill}
          onClose={() => {
            if (!isRefunding) {
              setRefundBill(null);
              setModalErrorMessage("");
            }
          }}
          onConfirm={handleRefund}
          isSaving={isRefunding}
          errorMessage={modalErrorMessage}
        />
      ) : null}

      <div className="pointer-events-none fixed right-4 top-4 z-[90] space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto min-w-[260px] px-4 py-3 text-sm font-medium backdrop-blur-xl",
              getManagerCardShellClasses(settings.scheme, { interactive: false }),
              settings.scheme === "dark" ? "text-slate-100" : "text-slate-900",
            )}
          >
            {toast.title}
          </div>
        ))}
      </div>
    </>
  );
}

function getBillingErrorMessage(error: unknown) {
  if (error instanceof SessionExpiredError) {
    return "Your session has expired. Please log in again.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unable to load billing data. Please try again.";
}

function buildHeroStats(stats?: BillingPageData["stats"]): BillingStat[] {
  return [
    {
      label: "TODAY REVENUE",
      value: formatCurrency(stats?.todayRevenue ?? 0),
      helper: "Paid bills collected today.",
      accent: "green",
    },
    {
      label: "PENDING TABLES",
      value: String(stats?.pendingTables ?? 0).padStart(2, "0"),
      helper: "Tables waiting for cashier settlement.",
      accent: "amber",
    },
    {
      label: "BILLS GENERATED",
      value: String(stats?.billsGenerated ?? 0),
      helper: "Receipts generated from QR orders.",
      accent: "blue",
    },
    {
      label: "WAITER SERVED",
      value: String(stats?.waiterServed ?? 0),
      helper: "Items served by floor staff today.",
      accent: "purple",
    },
    {
      label: "AVG BILL VALUE",
      value: formatCurrency(stats?.avgBillValue ?? 0),
      helper: "Average payment per table.",
      accent: "teal",
    },
  ];
}

function validateCreateBill(values: CreateBillFormValues) {
  if (!values.tableNumber.trim()) {
    return "Table number is required.";
  }

  if (!values.waiterName.trim()) {
    return "Waiter name is required.";
  }

  if (!Number.isFinite(Number(values.totalAmount)) || Number(values.totalAmount) <= 0) {
    return "Total amount must be greater than zero.";
  }

  return "";
}

async function exportBillingReportPdf(data: BillingPageData) {
  const jsPdfModule = (await import("jspdf")) as {
    default: new () => {
      text: (text: string, x: number, y: number) => void;
      setFontSize: (size: number) => void;
      save: (filename: string) => void;
      lastAutoTable?: { finalY: number };
    };
  };
  const autoTableModule = (await import("jspdf-autotable")) as {
    default?: (doc: unknown, options: unknown) => void;
    autoTable?: (doc: unknown, options: unknown) => void;
  };
  const doc = new jsPdfModule.default();
  const autoTable = autoTableModule.default ?? autoTableModule.autoTable;

  if (!autoTable) {
    throw new Error("PDF table exporter is not available.");
  }

  const generatedAt = new Date();
  const fileDate = generatedAt.toISOString().slice(0, 10);

  doc.setFontSize(18);
  doc.text("MenuFlow Billing Report", 14, 18);
  doc.setFontSize(10);
  doc.text(`Generated: ${generatedAt.toLocaleString()}`, 14, 26);

  autoTable(doc, {
    startY: 36,
    head: [["Metric", "Value"]],
    body: [
      ["Today Revenue", formatCurrency(data.stats.todayRevenue)],
      ["Pending Tables", String(data.stats.pendingTables)],
      ["Bills Generated", String(data.stats.billsGenerated)],
      ["Waiter Served", String(data.stats.waiterServed)],
      ["Avg Bill Value", formatCurrency(data.stats.avgBillValue)],
    ],
  });

  autoTable(doc, {
    startY: (doc.lastAutoTable?.finalY ?? 78) + 10,
    head: [["Bill", "Table", "Waiter", "Items", "Total", "Method", "Status"]],
    body: data.bills.length
      ? data.bills.map((bill) => [
          bill.billId,
          bill.tableNumber,
          bill.waiterName,
          String(bill.itemsCount),
          formatCurrency(bill.total),
          bill.method,
          bill.status,
        ])
      : [["No table bills", "", "", "", "", "", ""]],
  });

  autoTable(doc, {
    startY: (doc.lastAutoTable?.finalY ?? 130) + 10,
    head: [["Cashier Summary", "Value", "Details"]],
    body: data.cashierSummary.length
      ? data.cashierSummary.map((item) => [item.label, item.value, item.helper])
      : [["No cashier summary", "", ""]],
  });

  autoTable(doc, {
    startY: (doc.lastAutoTable?.finalY ?? 180) + 10,
    head: [["Pending Bill", "Table", "Amount", "Waiter"]],
    body: data.pendingCollectionQueue.length
      ? data.pendingCollectionQueue.map((bill) => [
          bill.billId,
          bill.tableNumber,
          formatCurrency(bill.total),
          bill.waiterName,
        ])
      : [["No pending collection", "", "", ""]],
  });

  autoTable(doc, {
    startY: (doc.lastAutoTable?.finalY ?? 220) + 10,
    head: [["Payment Method", "Amount", "Percent"]],
    body: data.paymentMethods.length
      ? data.paymentMethods.map((method) => [
          method.label,
          formatCurrency(method.amount),
          `${method.percent}%`,
        ])
      : [["No payment methods", "", ""]],
  });

  doc.save(`menuflow-billing-report-${fileDate}.pdf`);
}

export async function exportBillReceiptPdf(bill: BillRecord) {
  const jsPdfModule = (await import("jspdf")) as {
    default: new () => {
      text: (text: string, x: number, y: number) => void;
      setFontSize: (size: number) => void;
      save: (filename: string) => void;
      lastAutoTable?: { finalY: number };
    };
  };
  const autoTableModule = (await import("jspdf-autotable")) as {
    default?: (doc: unknown, options: unknown) => void;
    autoTable?: (doc: unknown, options: unknown) => void;
  };
  const doc = new jsPdfModule.default();
  const autoTable = autoTableModule.default ?? autoTableModule.autoTable;

  if (!autoTable) {
    throw new Error("PDF table exporter is not available.");
  }

  const receipt = bill.receipt;

  doc.setFontSize(18);
  doc.text(receipt.restaurantName || "MenuFlow Restaurant", 14, 18);
  doc.setFontSize(10);
  doc.text(`Branch: ${receipt.branchName}`, 14, 26);
  doc.text(`Bill ID: ${bill.billId}`, 14, 32);
  doc.text(`Table: ${bill.tableNumber}`, 14, 38);
  doc.text(`Waiter: ${bill.waiterName}`, 14, 44);
  doc.text(`Date: ${formatReceiptDate(receipt.issuedOn)}`, 14, 50);

  autoTable(doc, {
    startY: 60,
    head: [["Item", "Qty", "Total"]],
    body: receipt.items.length
      ? receipt.items.map((item) => [item.name, String(item.quantity), formatCurrency(item.total)])
      : [["No receipt items available", "", ""]],
  });

  autoTable(doc, {
    startY: (doc.lastAutoTable?.finalY ?? 96) + 10,
    head: [["Summary", "Amount"]],
    body: [
      ["Subtotal", formatCurrency(receipt.subtotal)],
      ["Tax", formatCurrency(receipt.taxAmount)],
      ["Service Charge", formatCurrency(receipt.serviceCharge)],
      ["Total", formatCurrency(receipt.total || bill.total)],
    ],
  });

  const filenameBillId = bill.billId.replace(/[^a-z0-9_-]+/gi, "-").replace(/^-|-$/g, "") || bill.id;
  doc.save(`menuflow-receipt-${filenameBillId}.pdf`);
}
