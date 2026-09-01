import { InvoiceModalFrame } from "./InvoiceModalFrame";
import {
  cn,
  getManagerLabelClasses,
  getManagerPrimaryButtonClasses,
  getManagerSecondaryButtonClasses,
  getManagerTextInputClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import type { PaymentMethodFormValues, PaymentMethodRecord } from "./invoice.types";

interface PaymentMethodModalProps {
  settings: ManagerSettings;
  values: PaymentMethodFormValues;
  currentMethod?: PaymentMethodRecord | null;
  onChange: (
    field: "cardNumber" | "holderName" | "expiryDate" | "cvc",
    value: string,
  ) => void;
  onClose: () => void;
  onSave: () => void;
  isSaving?: boolean;
  errorMessage?: string;
}

export function PaymentMethodModal({
  settings,
  values,
  currentMethod,
  onChange,
  onClose,
  onSave,
  isSaving = false,
  errorMessage = "",
}: PaymentMethodModalProps) {
  return (
    <InvoiceModalFrame
      open
      settings={settings}
      title="Change Payment Method"
      subtitle="Add or update the default card for automatic subscription renewals."
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
            onClick={onSave}
            disabled={isSaving}
            className={cn(getManagerPrimaryButtonClasses(settings.scheme), "rounded-[12px] px-5 disabled:cursor-not-allowed disabled:opacity-55")}
          >
            {isSaving ? "Saving..." : "Save Method"}
          </button>
        </>
      }
      onClose={onClose}
      disableClose={isSaving}
    >
      {errorMessage ? (
        <div className="mb-4 rounded-[14px] border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-[13px] font-semibold text-rose-300">
          {errorMessage}
        </div>
      ) : null}

      {currentMethod ? (
        <div className="mb-4 rounded-[14px] border border-blue-500/25 bg-blue-500/10 px-4 py-3 text-[13px] font-semibold text-blue-200">
          Current method: {currentMethod.label}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="flex items-center justify-between">
            <label className={getManagerLabelClasses(settings.scheme)}>Card Number</label>
            <span className="text-xs text-slate-400">Demo card: 4242 4242 4242 4242</span>
          </div>
          <input
            type="text"
            value={values.cardNumber}
            onChange={(event) => onChange("cardNumber", event.target.value)}
            placeholder="4242 4242 4242 4242"
            inputMode="numeric"
            maxLength={19}
            autoComplete="off"
            disabled={isSaving}
            className={cn("mt-2", getManagerTextInputClasses(settings.scheme))}
          />
        </div>
        <div>
          <label className={getManagerLabelClasses(settings.scheme)}>Name on Card</label>
          <input
            type="text"
            value={values.holderName}
            onChange={(event) => onChange("holderName", event.target.value)}
            placeholder="Account holder name"
            autoComplete="off"
            disabled={isSaving}
            className={cn("mt-2", getManagerTextInputClasses(settings.scheme))}
          />
        </div>
        <div>
          <label className={getManagerLabelClasses(settings.scheme)}>Expiry Date</label>
          <input
            type="text"
            value={values.expiryDate}
            onChange={(event) => onChange("expiryDate", event.target.value)}
            placeholder="MM / YY"
            inputMode="numeric"
            autoComplete="off"
            disabled={isSaving}
            className={cn("mt-2", getManagerTextInputClasses(settings.scheme))}
          />
        </div>
        <div>
          <label className={getManagerLabelClasses(settings.scheme)}>CVC</label>
          <input
            type="text"
            value={values.cvc}
            onChange={(event) => onChange("cvc", event.target.value)}
            placeholder="123"
            inputMode="numeric"
            autoComplete="off"
            disabled={isSaving}
            className={cn("mt-2", getManagerTextInputClasses(settings.scheme))}
          />
        </div>
      </div>
    </InvoiceModalFrame>
  );
}
