"use client";

import { useState } from "react";
import { cn, getManagerCardShellClasses, getManagerPageSectionClasses } from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import { BILLING_RECEIVED_BY, INITIAL_BILL_RECORDS } from "./billing.data";
import { BillingHeader } from "./BillingHeader";
import { BillReceiptModal } from "./BillReceiptModal";
import { CashierSummaryCard } from "./CashierSummaryCard";
import { CollectPaymentModal } from "./CollectPaymentModal";
import { CreateBillModal } from "./CreateBillModal";
import { PaymentMethodsCard } from "./PaymentMethodsCard";
import { PendingCollectionQueue } from "./PendingCollectionQueue";
import { RefundBillModal } from "./RefundBillModal";
import { TableBillsCard } from "./TableBillsCard";
import { buildDraftBill, calculateBillingMetrics, filterBills, getPendingBills } from "./billing.helpers";
import type {
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
  const [bills, setBills] = useState<BillRecord[]>(INITIAL_BILL_RECORDS);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BillStatusFilter>("All Status");
  const [methodFilter, setMethodFilter] = useState<BillMethodFilter>("All Methods");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [receiptBill, setReceiptBill] = useState<BillRecord | null>(null);
  const [paymentBill, setPaymentBill] = useState<BillRecord | null>(null);
  const [refundBill, setRefundBill] = useState<BillRecord | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const filteredBills = filterBills(bills, query, statusFilter, methodFilter);
  const pendingBills = getPendingBills(bills);
  const metrics = calculateBillingMetrics(bills);

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

  function handleCreateBill(values: CreateBillFormValues) {
    const nextBill = buildDraftBill(values, bills);
    setBills((current) => [nextBill, ...current]);
    setCreateModalOpen(false);
    pushToast(`${nextBill.billId} created successfully.`);
  }

  function handleCollectPayment(method: Exclude<BillMethodFilter, "All Methods">) {
    if (!paymentBill) {
      return;
    }

    setBills((current) =>
      current.map((bill) =>
        bill.id === paymentBill.id
          ? { ...bill, status: "Paid", method }
          : bill,
      ),
    );
    pushToast(`${paymentBill.billId} marked as paid by ${BILLING_RECEIVED_BY}.`);
    setPaymentBill(null);
  }

  function handleRefund(reason: RefundReason) {
    if (!refundBill) {
      return;
    }

    setBills((current) =>
      current.map((bill) =>
        bill.id === refundBill.id
          ? { ...bill, status: "Refunded", refundReason: reason }
          : bill,
      ),
    );
    pushToast(`${refundBill.billId} refunded successfully.`);
    setRefundBill(null);
  }

  return (
    <>
      <section className={getManagerPageSectionClasses()}>
        <div className="space-y-6">
          <BillingHeader
            settings={settings}
            stats={metrics.heroStats}
            onExportReport={() => pushToast("Billing report export queued.")}
          />

          <section className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
            <TableBillsCard
              settings={settings}
              bills={filteredBills}
              query={query}
              statusFilter={statusFilter}
              methodFilter={methodFilter}
              onQueryChange={setQuery}
              onStatusChange={setStatusFilter}
              onMethodChange={setMethodFilter}
              onCreateBill={() => setCreateModalOpen(true)}
              onView={setReceiptBill}
              onCollectPayment={setPaymentBill}
              onRefund={setRefundBill}
            />
            <CashierSummaryCard settings={settings} metrics={metrics.cashierSummary} />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <PendingCollectionQueue
              settings={settings}
              bills={pendingBills}
              onCollect={setPaymentBill}
            />
            <PaymentMethodsCard settings={settings} methods={metrics.paymentMethods} />
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
        />
      ) : null}

      {receiptBill ? (
        <BillReceiptModal
          open
          settings={settings}
          bill={receiptBill}
          onClose={() => setReceiptBill(null)}
          onDownloadPdf={() => pushToast("Receipt PDF download will be available soon.")}
        />
      ) : null}

      {paymentBill ? (
        <CollectPaymentModal
          key={paymentBill.id}
          open
          settings={settings}
          bill={paymentBill}
          onClose={() => setPaymentBill(null)}
          onConfirm={handleCollectPayment}
        />
      ) : null}

      {refundBill ? (
        <RefundBillModal
          key={refundBill.id}
          open
          settings={settings}
          bill={refundBill}
          onClose={() => setRefundBill(null)}
          onConfirm={handleRefund}
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
