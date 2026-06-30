"use client";

import { useState } from "react";
import {
  cn,
  getManagerLabelClasses,
  getManagerTextInputClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import { BillingSelect } from "./BillingSelect";
import { BILLING_METHOD_OPTIONS, BILLING_RECEIVED_BY } from "./billing.data";
import { formatCurrency, getMutedButtonClasses, getSuccessButtonClasses } from "./billing.helpers";
import { BillingModalFrame } from "./BillingModalFrame";
import type { BillMethodFilter, BillRecord } from "./billing.types";

interface CollectPaymentModalProps {
  open: boolean;
  settings: ManagerSettings;
  bill: BillRecord | null;
  onClose: () => void;
  onConfirm: (method: Exclude<BillMethodFilter, "All Methods">) => void | Promise<void>;
  isSaving?: boolean;
  errorMessage?: string;
}

export function CollectPaymentModal({
  open,
  settings,
  bill,
  onClose,
  onConfirm,
  isSaving = false,
  errorMessage = "",
}: CollectPaymentModalProps) {
  const [methodOverride, setMethodOverride] = useState<Exclude<BillMethodFilter, "All Methods"> | null>(
    null,
  );
  const method = methodOverride ?? (
    bill?.method === "Cash" || bill?.method === "Card" || bill?.method === "Online"
      ? bill.method
      : "Cash"
  );

  function handleClose() {
    if (isSaving) {
      return;
    }

    setMethodOverride(null);
    onClose();
  }

  function handleConfirm() {
    if (!isSaving) {
      void onConfirm(method);
    }
  }

  return (
    <BillingModalFrame
      open={open}
      settings={settings}
      title="Collect Payment"
      subtitle="Confirm payment after waiter served the table."
      maxWidthClassName="max-w-[1080px]"
      onClose={handleClose}
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving}
            className={getMutedButtonClasses(settings.scheme)}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSaving}
            className={getSuccessButtonClasses(settings.scheme)}
          >
            {isSaving ? "Confirming..." : "Confirm Payment"}
          </button>
        </>
      }
    >
      {bill ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {errorMessage ? (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-300 md:col-span-2">
              {errorMessage}
            </div>
          ) : null}
          <div className="space-y-2">
            <label htmlFor="collect-payment-bill" className={getManagerLabelClasses(settings.scheme)}>
              Bill ID
            </label>
            <input
              id="collect-payment-bill"
              value={bill.billId}
              disabled
              className={cn(getManagerTextInputClasses(settings.scheme), "cursor-not-allowed opacity-80")}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="collect-payment-amount" className={getManagerLabelClasses(settings.scheme)}>
              Amount
            </label>
            <input
              id="collect-payment-amount"
              value={formatCurrency(bill.total)}
              disabled
              className={cn(getManagerTextInputClasses(settings.scheme), "cursor-not-allowed opacity-80")}
            />
          </div>

          <div className="space-y-2">
            <div className={getManagerLabelClasses(settings.scheme)}>Payment Method</div>
            <BillingSelect
              label="Payment method"
              settings={settings}
              options={BILLING_METHOD_OPTIONS.filter((option) => option !== "All Methods").map((option) => ({
                label: option,
                value: option,
              }))}
              value={method}
              onChange={setMethodOverride}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="collect-payment-received" className={getManagerLabelClasses(settings.scheme)}>
              Received By
            </label>
            <input
              id="collect-payment-received"
              value={BILLING_RECEIVED_BY}
              disabled
              className={cn(getManagerTextInputClasses(settings.scheme), "cursor-not-allowed opacity-80")}
            />
          </div>
        </div>
      ) : null}
    </BillingModalFrame>
  );
}
