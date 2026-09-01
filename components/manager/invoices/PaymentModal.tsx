"use client";

import { useState } from "react";
import { ChevronDownIcon } from "../icons";
import { InvoiceModalFrame } from "./InvoiceModalFrame";
import {
  formatCardNumberInput,
  formatExpiryInput,
  validateBillingEmail,
  validatePaymentMethodForm,
} from "./invoice.helpers";
import {
  cn,
  getManagerLabelClasses,
  getManagerPrimaryButtonClasses,
  getManagerSecondaryButtonClasses,
  getManagerTextInputClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import type { PaymentMethodFormValues, PaymentMethodRecord, PlanId, SubscriptionPlan } from "./invoice.types";

interface PaymentModalProps {
  settings: ManagerSettings;
  title?: string;
  subtitle?: string;
  amount: string;
  cardHolderName: string;
  selectedPaymentMethodId: string;
  paymentMethods: PaymentMethodRecord[];
  billingEmail: string;
  availablePlans?: SubscriptionPlan[];
  selectedPlanId?: PlanId;
  onPlanChange?: (planId: PlanId) => void;
  onCardHolderNameChange: (value: string) => void;
  onPaymentMethodChange: (value: string) => void;
  onBillingEmailChange: (value: string) => void;
  onClose: () => void;
  onConfirmPay: (payload: {
    paymentMethodId?: string;
    cardNumber?: string;
    holderName?: string;
    expiryDate?: string;
    cvc?: string;
    billingEmail: string;
  }) => Promise<void>;
  isSaving?: boolean;
  errorMessage?: string;
}

export function PaymentModal({
  settings,
  title = "Complete Payment",
  subtitle = "Enter card details or select a saved method to process demo payment.",
  amount,
  cardHolderName,
  selectedPaymentMethodId,
  paymentMethods,
  billingEmail,
  availablePlans = [],
  selectedPlanId = "",
  onPlanChange,
  onCardHolderNameChange,
  onPaymentMethodChange,
  onBillingEmailChange,
  onClose,
  onConfirmPay,
  isSaving = false,
  errorMessage = "",
}: PaymentModalProps) {
  const hasSavedMethods = paymentMethods.length > 0;
  const [useNewCard, setUseNewCard] = useState(!hasSavedMethods);
  const [newCardForm, setNewCardForm] = useState<PaymentMethodFormValues>({
    cardNumber: "",
    holderName: cardHolderName || "",
    expiryDate: "",
    cvc: "",
  });
  const [localError, setLocalError] = useState("");

  function handleFormChange(field: keyof PaymentMethodFormValues, value: string) {
    const nextValue =
      field === "cardNumber"
        ? formatCardNumberInput(value)
        : field === "expiryDate"
          ? formatExpiryInput(value)
          : field === "cvc"
            ? value.replace(/\D/g, "").slice(0, 4)
            : value;

    setNewCardForm((current) => ({ ...current, [field]: nextValue }));
    if (field === "holderName") {
      onCardHolderNameChange(nextValue);
    }
  }

  async function handlePayClick() {
    setLocalError("");

    if (!validateBillingEmail(billingEmail)) {
      setLocalError("Please enter a valid billing email.");
      return;
    }

    if (useNewCard) {
      const cardError = validatePaymentMethodForm(newCardForm);
      if (cardError) {
        setLocalError(cardError);
        return;
      }

      try {
        await onConfirmPay({
          cardNumber: newCardForm.cardNumber,
          holderName: newCardForm.holderName.trim(),
          expiryDate: newCardForm.expiryDate.trim(),
          cvc: newCardForm.cvc.trim(),
          billingEmail: billingEmail.trim(),
        });
        setNewCardForm({ cardNumber: "", holderName: "", expiryDate: "", cvc: "" });
      } catch (err) {
        setNewCardForm((current) => ({ ...current, cvc: "" }));
      }
    } else {
      if (!selectedPaymentMethodId) {
        setLocalError("Please select a valid payment method.");
        return;
      }

      try {
        await onConfirmPay({
          paymentMethodId: selectedPaymentMethodId,
          holderName: cardHolderName.trim() || undefined,
          billingEmail: billingEmail.trim(),
        });
      } catch (err) {
        // Handled by parent error prop
      }
    }
  }

  const activeError = localError || errorMessage;

  return (
    <InvoiceModalFrame
      open
      settings={settings}
      title={title}
      subtitle={subtitle}
      maxWidthClassName="max-w-[760px]"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className={cn(getManagerSecondaryButtonClasses(settings.scheme), "rounded-[12px] px-5 disabled:cursor-not-allowed disabled:opacity-55")}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handlePayClick()}
            disabled={isSaving}
            className={cn(getManagerPrimaryButtonClasses(settings.scheme), "rounded-[12px] px-5 disabled:cursor-not-allowed disabled:opacity-55")}
          >
            {isSaving ? "Processing Pay..." : `Pay ${amount}`}
          </button>
        </>
      }
      onClose={onClose}
      disableClose={isSaving}
    >
      {activeError ? (
        <div className="mb-4 rounded-[14px] border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-[13px] font-semibold text-rose-300">
          {activeError}
        </div>
      ) : null}

      <div className="space-y-4">
        {hasSavedMethods ? (
          <div className="flex items-center gap-4 rounded-xl border border-slate-700/50 bg-slate-800/40 p-3">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-200">
              <input
                type="radio"
                name="paymentMode"
                checked={!useNewCard}
                onChange={() => setUseNewCard(false)}
                disabled={isSaving}
              />
              <span>Use Saved Payment Method</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-200">
              <input
                type="radio"
                name="paymentMode"
                checked={useNewCard}
                onChange={() => setUseNewCard(true)}
                disabled={isSaving}
              />
              <span>Enter New Card</span>
            </label>
          </div>
        ) : null}

        {!useNewCard && hasSavedMethods ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={getManagerLabelClasses(settings.scheme)}>Saved Card</label>
              <div className="relative mt-2">
                <select
                  value={selectedPaymentMethodId}
                  onChange={(event) => onPaymentMethodChange(event.target.value)}
                  disabled={isSaving}
                  className={cn(
                    "w-full appearance-none pr-10 disabled:cursor-not-allowed disabled:opacity-60",
                    getManagerTextInputClasses(settings.scheme),
                  )}
                >
                  {paymentMethods.map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.label}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
            <div>
              <label className={getManagerLabelClasses(settings.scheme)}>Card Holder Name</label>
              <input
                type="text"
                value={cardHolderName}
                onChange={(event) => onCardHolderNameChange(event.target.value)}
                disabled={isSaving}
                className={cn("mt-2", getManagerTextInputClasses(settings.scheme))}
              />
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <div className="flex items-center justify-between">
                <label className={getManagerLabelClasses(settings.scheme)}>Card Number *</label>
                <span className="text-xs text-slate-400">Demo mode — any 16-digit test number</span>
              </div>
              <input
                type="text"
                value={newCardForm.cardNumber}
                onChange={(event) => handleFormChange("cardNumber", event.target.value)}
                placeholder="3333 3333 3333 3333"
                inputMode="numeric"
                maxLength={19}
                autoComplete="off"
                disabled={isSaving}
                className={cn("mt-2", getManagerTextInputClasses(settings.scheme))}
              />
            </div>
            <div>
              <label className={getManagerLabelClasses(settings.scheme)}>Name on Card *</label>
              <input
                type="text"
                value={newCardForm.holderName}
                onChange={(event) => handleFormChange("holderName", event.target.value)}
                placeholder="Account Holder Name"
                autoComplete="cc-name"
                disabled={isSaving}
                className={cn("mt-2", getManagerTextInputClasses(settings.scheme))}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={getManagerLabelClasses(settings.scheme)}>Expiry *</label>
                <input
                  type="text"
                  value={newCardForm.expiryDate}
                  onChange={(event) => handleFormChange("expiryDate", event.target.value)}
                  placeholder="MM / YY"
                  inputMode="numeric"
                  autoComplete="off"
                  disabled={isSaving}
                  className={cn("mt-2", getManagerTextInputClasses(settings.scheme))}
                />
              </div>
              <div>
                <label className={getManagerLabelClasses(settings.scheme)}>CVC *</label>
                <input
                  type="text"
                  value={newCardForm.cvc}
                  onChange={(event) => handleFormChange("cvc", event.target.value)}
                  placeholder="123"
                  inputMode="numeric"
                  autoComplete="off"
                  disabled={isSaving}
                  className={cn("mt-2", getManagerTextInputClasses(settings.scheme))}
                />
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 pt-2 border-t border-slate-700/40">
          <div>
            <label className={getManagerLabelClasses(settings.scheme)}>Package *</label>
            {availablePlans.length > 0 && onPlanChange ? (
              <div className="relative mt-2">
                <select
                  value={selectedPlanId}
                  onChange={(event) => onPlanChange(event.target.value)}
                  disabled={isSaving}
                  className={cn(
                    "w-full appearance-none pr-10 font-bold text-blue-400 disabled:cursor-not-allowed disabled:opacity-60",
                    getManagerTextInputClasses(settings.scheme),
                  )}
                >
                  {availablePlans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.label || plan.planName} — {plan.priceDisplay}{plan.priceUnit ? `/${plan.priceUnit.replace(/^\//, "")}` : ""}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              </div>
            ) : (
              <input
                type="text"
                value={amount}
                readOnly
                className={cn("mt-2 font-bold text-blue-400", getManagerTextInputClasses(settings.scheme))}
              />
            )}
          </div>
          <div>
            <label className={getManagerLabelClasses(settings.scheme)}>Billing Email *</label>
            <input
              type="email"
              value={billingEmail}
              onChange={(event) => onBillingEmailChange(event.target.value)}
              placeholder="billing@restaurant.com"
              disabled={isSaving}
              className={cn("mt-2", getManagerTextInputClasses(settings.scheme))}
            />
          </div>
        </div>
      </div>
    </InvoiceModalFrame>
  );
}

