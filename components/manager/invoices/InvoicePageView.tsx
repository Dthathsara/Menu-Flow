"use client";

import { useState } from "react";
import {
  ARCHIVED_INVOICES,
  BILLING_EMAIL,
  DEFAULT_PAYMENT_METHODS,
  PLAN_ORDER,
  SUBSCRIPTION_PLANS,
} from "./invoice.data";
import {
  buildLatestInvoice,
  createPaymentMethodRecord,
  filterInvoices,
  getDefaultTargetPlanId,
  getInvoiceDocument,
} from "./invoice.helpers";
import { AvailablePlans } from "./AvailablePlans";
import { ChangePlanModal } from "./ChangePlanModal";
import { ConfirmPlanModal } from "./ConfirmPlanModal";
import { CurrentPackageCard } from "./CurrentPackageCard";
import { InvoiceHistoryTable } from "./InvoiceHistoryTable";
import { InvoicePageHeader } from "./InvoicePageHeader";
import { InvoicePreviewModal } from "./InvoicePreviewModal";
import { InvoiceStats } from "./InvoiceStats";
import { InvoiceSummaryCard } from "./InvoiceSummaryCard";
import { PaymentMethodModal } from "./PaymentMethodModal";
import { PaymentModal } from "./PaymentModal";
import { cn, getManagerCardShellClasses, getManagerPageSectionClasses } from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import type {
  PaymentMethodRecord,
  PlanId,
  ToastMessage,
} from "./invoice.types";

interface InvoicePageViewProps {
  settings: ManagerSettings;
}

export function InvoicePageView({ settings }: InvoicePageViewProps) {
  const [currentPlanId, setCurrentPlanId] = useState<PlanId>("growth");
  const [pendingPlanId, setPendingPlanId] = useState<PlanId>(
    getDefaultTargetPlanId("growth"),
  );
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All Status" | "Paid">("All Status");
  const [previewInvoiceId, setPreviewInvoiceId] = useState<string | null>(null);
  const [changePlanOpen, setChangePlanOpen] = useState(false);
  const [confirmPlanOpen, setConfirmPlanOpen] = useState(false);
  const [paymentMethodOpen, setPaymentMethodOpen] = useState(false);
  const [renewOpen, setRenewOpen] = useState(false);
  const [paymentMethods, setPaymentMethods] =
    useState<PaymentMethodRecord[]>(DEFAULT_PAYMENT_METHODS);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState(
    DEFAULT_PAYMENT_METHODS[0]?.id ?? "",
  );
  const [paymentMethodForm, setPaymentMethodForm] = useState({
    cardNumber: DEFAULT_PAYMENT_METHODS[0]?.cardNumber ?? "",
    holderName: DEFAULT_PAYMENT_METHODS[0]?.holderName ?? "",
    expiryDate: DEFAULT_PAYMENT_METHODS[0]?.expiryDate ?? "",
    cvc: DEFAULT_PAYMENT_METHODS[0]?.cvc ?? "",
  });
  const [cardHolderName, setCardHolderName] = useState(
    DEFAULT_PAYMENT_METHODS[0]?.holderName ?? "",
  );
  const [billingEmail, setBillingEmail] = useState(BILLING_EMAIL);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const currentPlan = SUBSCRIPTION_PLANS[currentPlanId];
  const pendingPlan = SUBSCRIPTION_PLANS[pendingPlanId];
  const latestInvoice = buildLatestInvoice(currentPlan);
  const invoiceHistory = [latestInvoice, ...ARCHIVED_INVOICES];
  const filteredInvoices = filterInvoices(invoiceHistory, query, statusFilter);
  const previewInvoice = invoiceHistory.find((invoice) => invoice.id === previewInvoiceId) ?? latestInvoice;
  const availableTargetPlans = PLAN_ORDER.filter((planId) => planId !== currentPlanId).map(
    (planId) => SUBSCRIPTION_PLANS[planId],
  );

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

  function openChangePlan(targetPlanId?: PlanId) {
    const nextTargetPlanId =
      targetPlanId && targetPlanId !== currentPlanId
        ? targetPlanId
        : getDefaultTargetPlanId(currentPlanId);

    setPendingPlanId(nextTargetPlanId);
    setChangePlanOpen(true);
  }

  function handleDownloadInvoice(invoiceId: string) {
    const invoice = invoiceHistory.find((item) => item.id === invoiceId);

    if (!invoice) {
      return;
    }

    const blob = new Blob([getInvoiceDocument(invoice)], {
      type: "text/html;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${invoice.id.toLowerCase()}.html`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    pushToast(`${invoice.id} downloaded.`);
  }

  function handlePrintInvoice(invoiceId: string) {
    const invoice = invoiceHistory.find((item) => item.id === invoiceId);

    if (!invoice) {
      return;
    }

    const printWindow = window.open("", "_blank", "noopener,noreferrer,width=900,height=720");

    if (!printWindow) {
      pushToast("Allow pop-ups to print invoices.");
      return;
    }

    printWindow.document.open();
    printWindow.document.write(getInvoiceDocument(invoice));
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  }

  function openLatestInvoicePreview() {
    setPreviewInvoiceId(latestInvoice.id);
  }

  function openPaymentMethodModal() {
    const selectedMethod =
      paymentMethods.find((method) => method.id === selectedPaymentMethodId) ??
      paymentMethods[0];

    if (selectedMethod) {
      setPaymentMethodForm({
        cardNumber: selectedMethod.cardNumber,
        holderName: selectedMethod.holderName,
        expiryDate: selectedMethod.expiryDate,
        cvc: selectedMethod.cvc,
      });
    }

    setPaymentMethodOpen(true);
  }

  function handleSavePaymentMethod() {
    const nextMethod = createPaymentMethodRecord(paymentMethodForm);

    setPaymentMethods((current) => [
      nextMethod,
      ...current.filter((method) => method.id !== nextMethod.id).slice(0, 1),
    ]);
    setSelectedPaymentMethodId(nextMethod.id);
    setCardHolderName(nextMethod.holderName);
    setPaymentMethodOpen(false);
    pushToast("Payment method updated.");
  }

  function handleConfirmPlanChange() {
    const previousLatestInvoiceId = latestInvoice.id;

    setCurrentPlanId(pendingPlanId);
    setChangePlanOpen(false);
    setConfirmPlanOpen(false);

    if (previewInvoiceId === previousLatestInvoiceId) {
      setPreviewInvoiceId(SUBSCRIPTION_PLANS[pendingPlanId].latestInvoiceId);
    }

    pushToast(`Current package changed to ${pendingPlan.planName}.`);
  }

  return (
    <>
      <section className={getManagerPageSectionClasses()}>
        <div className="space-y-6">
          <InvoicePageHeader
            settings={settings}
            onViewLatest={openLatestInvoicePreview}
            onPrintLatest={() => handlePrintInvoice(latestInvoice.id)}
            onDownloadLatest={() => handleDownloadInvoice(latestInvoice.id)}
            onOpenChangePlan={() => openChangePlan()}
          />

          <InvoiceStats settings={settings} plan={currentPlan} />

          <section className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
            <CurrentPackageCard settings={settings} plan={currentPlan} />
            <InvoiceSummaryCard
              settings={settings}
              plan={currentPlan}
              onRenew={() => setRenewOpen(true)}
              onChangeCard={openPaymentMethodModal}
            />
          </section>

          <InvoiceHistoryTable
            settings={settings}
            invoices={filteredInvoices}
            query={query}
            statusFilter={statusFilter}
            onQueryChange={setQuery}
            onStatusChange={setStatusFilter}
            onView={setPreviewInvoiceId}
            onDownload={handleDownloadInvoice}
          />

          <AvailablePlans
            settings={settings}
            currentPlanId={currentPlanId}
            onSelectPlan={openChangePlan}
          />
        </div>
      </section>

      {previewInvoiceId ? (
        <InvoicePreviewModal
          settings={settings}
          invoice={previewInvoice}
          onClose={() => setPreviewInvoiceId(null)}
          onDownload={() => handleDownloadInvoice(previewInvoice.id)}
          onPrint={() => handlePrintInvoice(previewInvoice.id)}
        />
      ) : null}

      {changePlanOpen ? (
        <ChangePlanModal
          settings={settings}
          currentPlan={currentPlan}
          targetPlanId={pendingPlanId}
          availablePlans={availableTargetPlans}
          onChangeTarget={setPendingPlanId}
          onClose={() => setChangePlanOpen(false)}
          onContinue={() => {
            setChangePlanOpen(false);
            setConfirmPlanOpen(true);
          }}
        />
      ) : null}

      {confirmPlanOpen ? (
        <ConfirmPlanModal
          settings={settings}
          currentPlan={currentPlan}
          targetPlan={pendingPlan}
          onClose={() => {
            setConfirmPlanOpen(false);
            setChangePlanOpen(true);
          }}
          onConfirm={handleConfirmPlanChange}
        />
      ) : null}

      {paymentMethodOpen ? (
        <PaymentMethodModal
          settings={settings}
          values={paymentMethodForm}
          onChange={(field, value) =>
            setPaymentMethodForm((current) => ({ ...current, [field]: value }))
          }
          onClose={() => setPaymentMethodOpen(false)}
          onSave={handleSavePaymentMethod}
        />
      ) : null}

      {renewOpen ? (
        <PaymentModal
          settings={settings}
          amount={currentPlan.totalDisplay}
          cardHolderName={cardHolderName}
          selectedPaymentMethodId={selectedPaymentMethodId}
          paymentMethods={paymentMethods}
          billingEmail={billingEmail}
          onCardHolderNameChange={setCardHolderName}
          onPaymentMethodChange={setSelectedPaymentMethodId}
          onBillingEmailChange={setBillingEmail}
          onClose={() => setRenewOpen(false)}
          onConfirm={() => {
            setRenewOpen(false);
            pushToast(`Renewal confirmed for ${currentPlan.planName}.`);
          }}
        />
      ) : null}

      <div className="pointer-events-none fixed right-4 top-4 z-[140] space-y-2">
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
