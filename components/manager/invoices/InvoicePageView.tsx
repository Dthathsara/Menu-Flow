"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  changeManagerInvoicePlan,
  fetchManagerInvoice,
  fetchManagerInvoices,
  payManagerInvoice,
  toggleManagerAutoRenew,
  updateManagerPaymentMethod,
} from "@/lib/manager-invoices-api";
import { SessionExpiredError } from "@/lib/auth-session";
import { useManagerAccessStatus } from "../useManagerAccessStatus";
import {
  exportInvoicePdf,
  filterInvoices,
  formatCardNumberInput,
  formatExpiryInput,
  getDefaultTargetPlanId,
  getInvoiceDocument,
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
  const { locked, reason: lockReason, refetch: refetchAccessStatus } = useManagerAccessStatus();
  const [pageData, setPageData] = useState<ManagerInvoicesPageData | null>(null);
  const [pendingPlanId, setPendingPlanId] = useState<PlanId>("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<InvoiceHistoryStatusFilter>("All Status");
  const [previewInvoice, setPreviewInvoice] = useState<InvoiceRecord | null>(null);
  const [changePlanOpen, setChangePlanOpen] = useState(false);
  const [confirmPlanOpen, setConfirmPlanOpen] = useState(false);
  const [paymentMethodOpen, setPaymentMethodOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [activeInvoiceForPayment, setActiveInvoiceForPayment] = useState<InvoiceRecord | null>(null);
  const [activePendingInvoiceId, setActivePendingInvoiceId] = useState<string>("");
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState("");
  const [paymentMethodForm, setPaymentMethodForm] =
    useState<PaymentMethodFormValues>(EMPTY_PAYMENT_FORM);
  const [cardHolderName, setCardHolderName] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [invoiceAction, setInvoiceAction] = useState<InvoiceAction>("");
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [isSavingPaymentMethod, setIsSavingPaymentMethod] = useState(false);
  const [autoRenew, setAutoRenew] = useState(false);
  const [isTogglingAutoRenew, setIsTogglingAutoRenew] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [modalErrorMessage, setModalErrorMessage] = useState("");

  const loadInvoices = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const nextData = await fetchManagerInvoices();
      setPageData(nextData);
      setAutoRenew(Boolean(nextData.autoRenew));
      setSelectedPaymentMethodId((current) =>
        current && nextData.paymentMethods.some((method) => method.id === current)
          ? current
          : nextData.paymentMethods[0]?.id ?? "",
      );
      setBillingEmail((current) => current || nextData.billingProfile.billingEmail);
      setCardHolderName((current) => current || nextData.paymentMethods[0]?.holderName || "");
      setPendingPlanId((current) => {
        if (current && nextData.availablePlans.some((plan) => plan.id === current)) {
          return current;
        }
        return nextData.currentPlan?.id
          ? getDefaultTargetPlanId(nextData.currentPlan.id)
          : nextData.availablePlans[0]?.id ?? "";
      });

      if (nextData.invoices.length === 0) {
        setPreviewInvoice(null);
        setActiveInvoiceForPayment(null);
        setActivePendingInvoiceId("");
      }
      if (nextData.paymentMethods.length === 0) {
        setSelectedPaymentMethodId("");
      }
    } catch (error) {
      setPageData(null);
      setErrorMessage(getInvoiceErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInvoices();

    function onFocus() {
      void loadInvoices();
    }

    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
    };
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
    Boolean(invoiceAction) || isChangingPlan || isPaying || isSavingPaymentMethod;

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

  function openInitialPackagePayment(planId: PlanId) {
    const selected = availablePlans.find((plan) => plan.id === planId);
    if (!selected) {
      return;
    }
    setPendingPlanId(selected.id);
    setActivePendingInvoiceId("");
    setActiveInvoiceForPayment(null);
    setModalErrorMessage("");
    setPayModalOpen(true);
  }

  function openChangePlan(targetPlanId?: PlanId) {
    if (!currentPlan) {
      const targetId = targetPlanId || availablePlans[0]?.id;
      if (targetId) {
        openInitialPackagePayment(targetId);
      }
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

  function openPaymentModalForCurrentOrPending() {
    const pendingInv = pageData?.invoices.find((inv) => inv.status === "Pending" || inv.status === "Overdue");
    const initialPlanId = pendingPlanId || currentPlan?.id || availablePlans[0]?.id || "";
    setPendingPlanId(initialPlanId);
    const targetInvoice = pendingInv ?? latestInvoice ?? pageData?.invoices[0] ?? null;
    setActiveInvoiceForPayment(targetInvoice);
    setActivePendingInvoiceId(targetInvoice?.id ?? "");
    setModalErrorMessage("");
    setPayModalOpen(true);
  }

  async function handlePayInvoice(payload: {
    paymentMethodId?: string;
    cardNumber?: string;
    holderName?: string;
    expiryDate?: string;
    cvc?: string;
    billingEmail: string;
  }) {
    if (isPaying) {
      return;
    }

    setIsPaying(true);
    setModalErrorMessage("");

    try {
      const selectedPlan =
        availablePlans.find((plan) => plan.id === pendingPlanId) ??
        availablePlans[0] ??
        null;

      let invoiceId =
        activePendingInvoiceId ||
        activeInvoiceForPayment?.id ||
        "";

      // 1. Search page invoices for a matching pending invoice for this selected plan
      if (!invoiceId && selectedPlan) {
        const matchingPendingInv = pageData?.invoices.find((inv) => {
          if (inv.status !== "Pending" && inv.status !== "Overdue") return false;
          const labelMatch =
            inv.packageLabel?.toLowerCase() === selectedPlan.label.toLowerCase() ||
            inv.packageLabel?.toLowerCase() === selectedPlan.planName.toLowerCase() ||
            inv.invoiceLineLabel?.toLowerCase().includes(selectedPlan.label.toLowerCase());
          return labelMatch;
        });

        if (matchingPendingInv) {
          invoiceId = matchingPendingInv.id;
          setActivePendingInvoiceId(invoiceId);
          setActiveInvoiceForPayment(matchingPendingInv);
        }
      }

      // 2. If no pending invoice exists, call PATCH /manager-invoices/plan to create one
      if (!invoiceId) {
        if (!selectedPlan) {
          throw new Error("Please select a package.");
        }

        const planTarget = selectedPlan.packageId || selectedPlan.id;
        const changeResult = await changeManagerInvoicePlan(planTarget);

        invoiceId =
          changeResult.pendingInvoiceId ||
          changeResult.invoiceId ||
          "";

        if (!invoiceId) {
          throw new Error("Unable to prepare the subscription invoice. Please try again.");
        }

        setActivePendingInvoiceId(invoiceId);

        try {
          const preparedInvoice = await fetchManagerInvoice(invoiceId);
          setActiveInvoiceForPayment(preparedInvoice);
        } catch {
          // Invoice ID is enough to continue payment even if detail fetch fails
        }
      }

      if (typeof invoiceId !== "string" || !invoiceId.trim()) {
        throw new Error("A valid invoice could not be prepared for payment.");
      }

      const cleanInvoiceId = invoiceId.trim();

      const requestPayload = payload.paymentMethodId
        ? {
            invoiceId: cleanInvoiceId,
            paymentMethodId: payload.paymentMethodId,
            billingEmail: payload.billingEmail,
          }
        : {
            invoiceId: cleanInvoiceId,
            cardNumber: payload.cardNumber,
            holderName: payload.holderName,
            expiryDate: payload.expiryDate,
            cvc: payload.cvc,
            billingEmail: payload.billingEmail,
          };

      await payManagerInvoice(requestPayload);

      setPayModalOpen(false);
      setActivePendingInvoiceId("");
      setActiveInvoiceForPayment(null);
      pushToast("Payment completed successfully.");

      window.dispatchEvent(new Event("menuflow:subscription-updated"));
      await refetchAccessStatus();
      await loadInvoices();
    } catch (error) {
      setModalErrorMessage(getInvoiceErrorMessage(error));
    } finally {
      setIsPaying(false);
    }
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
      const targetPlanCodeOrId = pendingPlan.packageId || pendingPlan.id;
      const result = await changeManagerInvoicePlan(targetPlanCodeOrId);
      setConfirmPlanOpen(false);
      setChangePlanOpen(false);

      const pendingId = result.pendingInvoiceId || "";
      setActivePendingInvoiceId(pendingId);

      if (pendingId) {
        try {
          const invObj = await fetchManagerInvoice(pendingId);
          setActiveInvoiceForPayment(invObj);
        } catch {
          setActiveInvoiceForPayment(null);
        }
      } else {
        setActiveInvoiceForPayment(null);
      }

      setModalErrorMessage("");
      setPayModalOpen(true);
    } catch (error) {
      setModalErrorMessage(getInvoiceErrorMessage(error));
    } finally {
      setIsChangingPlan(false);
    }
  }

  function openPaymentModalForInvoice(invoice: InvoiceRecord) {
    setActiveInvoiceForPayment(invoice);
    setActivePendingInvoiceId(invoice.id);
    const matchingPlan = availablePlans.find(
      (plan) =>
        plan.label.toLowerCase() === invoice.packageLabel?.toLowerCase() ||
        plan.planName.toLowerCase() === invoice.packageLabel?.toLowerCase() ||
        plan.id === invoice.packageId,
    );
    if (matchingPlan) {
      setPendingPlanId(matchingPlan.id);
    }
    setModalErrorMessage("");
    setPayModalOpen(true);
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

  const selectedPaymentPlan = availablePlans.find((plan) => plan.id === pendingPlanId) ?? availablePlans[0] ?? null;
  const payableAmount =
    activeInvoiceForPayment?.totalDisplay ||
    selectedPaymentPlan?.totalDisplay ||
    selectedPaymentPlan?.priceDisplay ||
    currentPlan?.totalDisplay ||
    "Rs. 0";

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
            hasCurrentPlan={Boolean(currentPlan)}
            hasAvailablePlans={availablePlans.length > 0}
            isActionLoading={actionInFlight}
          />

          {locked ? (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 shadow-lg">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-amber-300">
                    Subscription payment required
                  </h3>
                  <p className="mt-1 text-sm font-medium text-amber-200/90">
                    {lockReason || "Your subscription payment is overdue. Complete payment to restore full access to MenuFlow."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openPaymentModalForCurrentOrPending}
                  className="inline-flex shrink-0 items-center justify-center rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-amber-400 active:scale-95"
                >
                  Pay Now
                </button>
              </div>
            </div>
          ) : null}

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

          {!isLoading ? (
            <>
              <InvoiceStats settings={settings} plan={currentPlan} />

              <section className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
                <CurrentPackageCard
                  settings={settings}
                  plan={currentPlan}
                  autoRenew={autoRenew}
                  savedMethodLabel={selectedPaymentMethod?.label}
                  isTogglingAutoRenew={isTogglingAutoRenew}
                  onToggleAutoRenew={async (enabled) => {
                    setIsTogglingAutoRenew(true);
                    try {
                      const nextState = await toggleManagerAutoRenew(enabled);
                      setAutoRenew(nextState);
                      pushToast(nextState ? "Auto Renew enabled." : "Auto Renew disabled.");
                    } catch (err) {
                      pushToast(err instanceof Error ? err.message : "Failed to toggle Auto Renew.");
                    } finally {
                      setIsTogglingAutoRenew(false);
                    }
                  }}
                  onAddPaymentMethod={openPaymentMethodModal}
                />
                <InvoiceSummaryCard
                  settings={settings}
                  plan={currentPlan}
                  onRenew={openPaymentModalForCurrentOrPending}
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
                onPay={openPaymentModalForInvoice}
                isActionLoading={actionInFlight}
              />

              <AvailablePlans
                settings={settings}
                currentPlan={currentPlan}
                currentPlanId={currentPlan?.id}
                currentPlanCode={currentPlan?.packageType}
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

      {payModalOpen ? (
        <PaymentModal
          settings={settings}
          title={activePendingInvoiceId ? "Complete Plan Payment" : "Subscription Payment"}
          subtitle={
            activePendingInvoiceId
              ? `Pay for pending subscription upgrade to ${pendingPlan?.planName || "new package"}.`
              : "Confirm payment method to renew subscription."
          }
          amount={payableAmount}
          cardHolderName={cardHolderName}
          selectedPaymentMethodId={selectedPaymentMethodId}
          paymentMethods={pageData?.paymentMethods ?? []}
          billingEmail={billingEmail}
          availablePlans={availablePlans}
          selectedPlanId={pendingPlanId || selectedPaymentPlan?.id || ""}
          onPlanChange={(planId) => {
            setPendingPlanId(planId);
            const selectedPlan = availablePlans.find((p) => p.id === planId);
            const matchingPendingInv = pageData?.invoices.find((inv) => {
              if (inv.status !== "Pending" && inv.status !== "Overdue") return false;
              return (
                inv.packageLabel?.toLowerCase() === selectedPlan?.label.toLowerCase() ||
                inv.packageLabel?.toLowerCase() === selectedPlan?.planName.toLowerCase()
              );
            });
            if (matchingPendingInv) {
              setActivePendingInvoiceId(matchingPendingInv.id);
              setActiveInvoiceForPayment(matchingPendingInv);
            }
          }}
          onCardHolderNameChange={setCardHolderName}
          onPaymentMethodChange={(methodId) => {
            setSelectedPaymentMethodId(methodId);
            const method = pageData?.paymentMethods.find((item) => item.id === methodId);
            setCardHolderName(method?.holderName ?? "");
          }}
          onBillingEmailChange={setBillingEmail}
          onClose={() => {
            if (!isPaying) {
              setPayModalOpen(false);
              setActivePendingInvoiceId("");
              setActiveInvoiceForPayment(null);
              setModalErrorMessage("");
            }
          }}
          onConfirmPay={handlePayInvoice}
          isSaving={isPaying}
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
