"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  changeManagerInvoicePlan,
  fetchManagerInvoice,
  fetchManagerInvoices,
  renewManagerSubscription,
  updateManagerPaymentMethod,
} from "@/lib/manager-invoices-api";
import { SessionExpiredError } from "@/lib/auth-session";
import {
  exportInvoicePdf,
  filterInvoices,
  formatCardNumberInput,
  formatExpiryInput,
  getDefaultTargetPlanId,
  getInvoiceDocument,
  validateBillingEmail,
  validatePaymentMethodForm,
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
  InvoiceHistoryStatusFilter,
  InvoiceRecord,
  ManagerInvoicesPageData,
  PaymentMethodFormValues,
  PlanId,
  ToastMessage,
} from "./invoice.types";

interface InvoicePageViewProps {
  settings: ManagerSettings;
}

type InvoiceAction = "preview" | "download" | "print" | "";

const EMPTY_PAYMENT_FORM: PaymentMethodFormValues = {
  cardNumber: "",
  holderName: "",
  expiryDate: "",
  cvc: "",
};

export function InvoicePageView({ settings }: InvoicePageViewProps) {
  const [pageData, setPageData] = useState<ManagerInvoicesPageData | null>(null);
  const [pendingPlanId, setPendingPlanId] = useState<PlanId>("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<InvoiceHistoryStatusFilter>("All Status");
  const [previewInvoice, setPreviewInvoice] = useState<InvoiceRecord | null>(null);
  const [changePlanOpen, setChangePlanOpen] = useState(false);
  const [confirmPlanOpen, setConfirmPlanOpen] = useState(false);
  const [paymentMethodOpen, setPaymentMethodOpen] = useState(false);
  const [renewOpen, setRenewOpen] = useState(false);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState("");
  const [paymentMethodForm, setPaymentMethodForm] =
    useState<PaymentMethodFormValues>(EMPTY_PAYMENT_FORM);
  const [cardHolderName, setCardHolderName] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [invoiceAction, setInvoiceAction] = useState<InvoiceAction>("");
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [isRenewing, setIsRenewing] = useState(false);
  const [isSavingPaymentMethod, setIsSavingPaymentMethod] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [modalErrorMessage, setModalErrorMessage] = useState("");

  const loadInvoices = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const nextData = await fetchManagerInvoices();
      setPageData(nextData);
      setSelectedPaymentMethodId((current) =>
        current && nextData.paymentMethods.some((method) => method.id === current)
          ? current
          : nextData.paymentMethods[0]?.id ?? "",
      );
      setBillingEmail((current) => current || nextData.billingProfile.billingEmail);
      setCardHolderName((current) => current || nextData.paymentMethods[0]?.holderName || "");
      setPendingPlanId((current) =>
        current && nextData.availablePlans.some((plan) => plan.id === current)
          ? current
          : getDefaultTargetPlanId(nextData.currentPlan.id),
      );
    } catch (error) {
      setPageData(null);
      setErrorMessage(getInvoiceErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInvoices();
  }, [loadInvoices]);

  const currentPlan = pageData?.currentPlan;
  const latestInvoice = pageData?.latestInvoice ?? null;
  const filteredInvoices = useMemo(
    () => filterInvoices(pageData?.invoices ?? [], query, statusFilter),
    [pageData?.invoices, query, statusFilter],
  );
  const availablePlans = pageData?.availablePlans ?? [];
  const availableTargetPlans = currentPlan
    ? availablePlans.filter((plan) => plan.id !== currentPlan.id)
    : [];
  const pendingPlan =
    availablePlans.find((plan) => plan.id === pendingPlanId) ??
    availableTargetPlans[0] ??
    currentPlan ??
    null;
  const selectedPaymentMethod =
    pageData?.paymentMethods.find((method) => method.id === selectedPaymentMethodId) ??
    pageData?.paymentMethods[0] ??
    null;
  const actionInFlight =
    Boolean(invoiceAction) || isChangingPlan || isRenewing || isSavingPaymentMethod;

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
    if (!currentPlan) {
      return;
    }

    const nextTargetPlanId =
      targetPlanId && targetPlanId !== currentPlan.id
        ? targetPlanId
        : availableTargetPlans[0]?.id ?? getDefaultTargetPlanId(currentPlan.id);

    setPendingPlanId(nextTargetPlanId);
    setModalErrorMessage("");
    setChangePlanOpen(true);
  }

  async function getDetailedInvoice(invoiceId: string) {
    return fetchManagerInvoice(invoiceId);
  }

  async function handleOpenInvoicePreview(invoiceId: string) {
    if (invoiceAction) {
      return;
    }

    setInvoiceAction("preview");
    setErrorMessage("");

    try {
      setPreviewInvoice(await getDetailedInvoice(invoiceId));
    } catch (error) {
      pushToast(getInvoiceErrorMessage(error));
    } finally {
      setInvoiceAction("");
    }
  }

  async function handleDownloadInvoice(invoiceId: string) {
    if (invoiceAction) {
      return;
    }

    setInvoiceAction("download");

    try {
      const invoice = await getDetailedInvoice(invoiceId);
      await exportInvoicePdf(invoice);
      pushToast(`${invoice.invoiceNumber || invoice.id} PDF downloaded.`);
    } catch (error) {
      pushToast(getInvoiceErrorMessage(error));
    } finally {
      setInvoiceAction("");
    }
  }

  async function handlePrintInvoice(invoiceId: string, providedInvoice?: InvoiceRecord) {
    if (invoiceAction) {
      return;
    }

    const printWindow = window.open("", "_blank", "noopener,noreferrer,width=900,height=720");

    if (!printWindow) {
      pushToast("Allow pop-ups to print invoices.");
      return;
    }

    setInvoiceAction("print");

    try {
      const invoice = providedInvoice ?? (await getDetailedInvoice(invoiceId));
      printWindow.document.open();
      printWindow.document.write(getInvoiceDocument(invoice));
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      };
    } catch (error) {
      printWindow.close();
      pushToast(getInvoiceErrorMessage(error));
    } finally {
      setInvoiceAction("");
    }
  }

  async function handleConfirmPlanChange() {
    if (!pendingPlan || isChangingPlan) {
      return;
    }

    setIsChangingPlan(true);
    setModalErrorMessage("");

    try {
      await changeManagerInvoicePlan(pendingPlan.id);
      setChangePlanOpen(false);
      setConfirmPlanOpen(false);
      pushToast(`Current package changed to ${pendingPlan.planName}.`);
      await loadInvoices();
    } catch (error) {
      setModalErrorMessage(getInvoiceErrorMessage(error));
    } finally {
      setIsChangingPlan(false);
    }
  }

  function openPaymentMethodModal() {
    setPaymentMethodForm({
      ...EMPTY_PAYMENT_FORM,
      holderName: selectedPaymentMethod?.holderName ?? "",
      expiryDate: "",
    });
    setModalErrorMessage("");
    setPaymentMethodOpen(true);
  }

  async function handleSavePaymentMethod() {
    const validationError = validatePaymentMethodForm(paymentMethodForm);

    if (validationError) {
      setModalErrorMessage(validationError);
      return;
    }

    setIsSavingPaymentMethod(true);
    setModalErrorMessage("");

    try {
      const savedMethod = await updateManagerPaymentMethod(paymentMethodForm);
      setPaymentMethodForm(EMPTY_PAYMENT_FORM);
      setSelectedPaymentMethodId(savedMethod.id);
      setCardHolderName(savedMethod.holderName);
      setPaymentMethodOpen(false);
      pushToast("Payment method updated.");
      await loadInvoices();
    } catch (error) {
      setPaymentMethodForm((current) => ({ ...current, cvc: "" }));
      setModalErrorMessage(getInvoiceErrorMessage(error));
    } finally {
      setIsSavingPaymentMethod(false);
    }
  }

  async function handleRenewSubscription() {
    if (isRenewing) {
      return;
    }

    if (!selectedPaymentMethod) {
      setModalErrorMessage("Add a payment method before renewing this subscription.");
      return;
    }

    if (!cardHolderName.trim()) {
      setModalErrorMessage("Card holder name is required.");
      return;
    }

    if (!validateBillingEmail(billingEmail)) {
      setModalErrorMessage("Enter a valid billing email.");
      return;
    }

    setIsRenewing(true);
    setModalErrorMessage("");

    try {
      await renewManagerSubscription({
        paymentMethodId: selectedPaymentMethod.id,
        cardHolderName,
        billingEmail,
      });
      setRenewOpen(false);
      pushToast("Subscription renewed successfully.");
      await loadInvoices();
    } catch (error) {
      setModalErrorMessage(getInvoiceErrorMessage(error));
    } finally {
      setIsRenewing(false);
    }
  }

  function handlePaymentMethodFormChange(
    field: keyof PaymentMethodFormValues,
    value: string,
  ) {
    const nextValue =
      field === "cardNumber"
        ? formatCardNumberInput(value)
        : field === "expiryDate"
          ? formatExpiryInput(value)
          : field === "cvc"
            ? value.replace(/\D/g, "").slice(0, 4)
            : value;

    setPaymentMethodForm((current) => ({ ...current, [field]: nextValue }));
  }

  return (
    <>
      <section className={getManagerPageSectionClasses()}>
        <div className="space-y-6">
          <InvoicePageHeader
            settings={settings}
            onViewLatest={() => {
              if (latestInvoice) {
                void handleOpenInvoicePreview(latestInvoice.id);
              }
            }}
            onPrintLatest={() => {
              if (latestInvoice) {
                void handlePrintInvoice(latestInvoice.id);
              }
            }}
            onDownloadLatest={() => {
              if (latestInvoice) {
                void handleDownloadInvoice(latestInvoice.id);
              }
            }}
            onOpenChangePlan={() => openChangePlan()}
            hasLatestInvoice={Boolean(latestInvoice)}
            isActionLoading={actionInFlight}
          />

          {errorMessage ? (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-5 py-4 text-sm font-semibold text-rose-300">
              {errorMessage}
              <button
                type="button"
                onClick={() => void loadInvoices()}
                className="ml-4 underline underline-offset-4"
              >
                Retry
              </button>
            </div>
          ) : null}

          {isLoading ? <InvoiceLoadingState settings={settings} /> : null}

          {!isLoading && currentPlan ? (
            <>
              <InvoiceStats settings={settings} plan={currentPlan} />

              <section className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
                <CurrentPackageCard settings={settings} plan={currentPlan} />
                <InvoiceSummaryCard
                  settings={settings}
                  plan={currentPlan}
                  onRenew={() => {
                    setCardHolderName(selectedPaymentMethod?.holderName ?? "");
                    setBillingEmail(pageData?.billingProfile.billingEmail ?? "");
                    setModalErrorMessage("");
                    setRenewOpen(true);
                  }}
                  onChangeCard={openPaymentMethodModal}
                  isActionLoading={actionInFlight}
                />
              </section>

              <InvoiceHistoryTable
                settings={settings}
                invoices={filteredInvoices}
                query={query}
                statusFilter={statusFilter}
                onQueryChange={setQuery}
                onStatusChange={setStatusFilter}
                onView={(invoiceId) => void handleOpenInvoicePreview(invoiceId)}
                onDownload={(invoiceId) => void handleDownloadInvoice(invoiceId)}
                isActionLoading={actionInFlight}
              />

              <AvailablePlans
                settings={settings}
                currentPlanId={currentPlan.id}
                plans={availablePlans}
                onSelectPlan={openChangePlan}
                isSaving={actionInFlight}
              />
            </>
          ) : null}
        </div>
      </section>

      {previewInvoice ? (
        <InvoicePreviewModal
          settings={settings}
          invoice={previewInvoice}
          onClose={() => setPreviewInvoice(null)}
          onDownload={() => void handleDownloadInvoice(previewInvoice.id)}
          onPrint={() => void handlePrintInvoice(previewInvoice.id, previewInvoice)}
          isActionLoading={actionInFlight}
        />
      ) : null}

      {changePlanOpen && currentPlan ? (
        <ChangePlanModal
          settings={settings}
          currentPlan={currentPlan}
          targetPlanId={pendingPlanId}
          availablePlans={availableTargetPlans}
          onChangeTarget={setPendingPlanId}
          onClose={() => {
            if (!isChangingPlan) {
              setChangePlanOpen(false);
              setModalErrorMessage("");
            }
          }}
          onContinue={() => {
            setChangePlanOpen(false);
            setConfirmPlanOpen(true);
          }}
          isSaving={isChangingPlan}
          errorMessage={modalErrorMessage}
        />
      ) : null}

      {confirmPlanOpen && currentPlan && pendingPlan ? (
        <ConfirmPlanModal
          settings={settings}
          currentPlan={currentPlan}
          targetPlan={pendingPlan}
          onClose={() => {
            if (!isChangingPlan) {
              setConfirmPlanOpen(false);
              setChangePlanOpen(true);
            }
          }}
          onConfirm={handleConfirmPlanChange}
          isSaving={isChangingPlan}
          errorMessage={modalErrorMessage}
        />
      ) : null}

      {paymentMethodOpen ? (
        <PaymentMethodModal
          settings={settings}
          values={paymentMethodForm}
          currentMethod={selectedPaymentMethod}
          onChange={handlePaymentMethodFormChange}
          onClose={() => {
            if (!isSavingPaymentMethod) {
              setPaymentMethodForm(EMPTY_PAYMENT_FORM);
              setPaymentMethodOpen(false);
              setModalErrorMessage("");
            }
          }}
          onSave={handleSavePaymentMethod}
          isSaving={isSavingPaymentMethod}
          errorMessage={modalErrorMessage}
        />
      ) : null}

      {renewOpen && currentPlan ? (
        <PaymentModal
          settings={settings}
          amount={currentPlan.totalDisplay}
          cardHolderName={cardHolderName}
          selectedPaymentMethodId={selectedPaymentMethodId}
          paymentMethods={pageData?.paymentMethods ?? []}
          billingEmail={billingEmail}
          onCardHolderNameChange={setCardHolderName}
          onPaymentMethodChange={(methodId) => {
            setSelectedPaymentMethodId(methodId);
            const method = pageData?.paymentMethods.find((item) => item.id === methodId);
            setCardHolderName(method?.holderName ?? "");
          }}
          onBillingEmailChange={setBillingEmail}
          onClose={() => {
            if (!isRenewing) {
              setRenewOpen(false);
              setModalErrorMessage("");
            }
          }}
          onConfirm={handleRenewSubscription}
          isSaving={isRenewing}
          errorMessage={modalErrorMessage}
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

function InvoiceLoadingState({ settings }: { settings: ManagerSettings }) {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {["plan", "cycle", "renewal", "due"].map((item) => (
          <div
            key={item}
            className={cn("h-[154px] animate-pulse p-5", getManagerCardShellClasses(settings.scheme))}
          >
            <div className="h-3 w-24 rounded-full bg-slate-400/20" />
            <div className="mt-6 h-7 w-32 rounded-full bg-slate-400/20" />
            <div className="mt-4 h-4 w-full rounded-full bg-slate-400/20" />
          </div>
        ))}
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <div className={cn("h-[360px] animate-pulse p-5", getManagerCardShellClasses(settings.scheme))} />
        <div className={cn("h-[360px] animate-pulse p-5", getManagerCardShellClasses(settings.scheme))} />
      </section>
    </div>
  );
}

function getInvoiceErrorMessage(error: unknown) {
  if (error instanceof SessionExpiredError) {
    return "Your session has expired. Please log in again.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unable to load invoice data. Please try again.";
}
