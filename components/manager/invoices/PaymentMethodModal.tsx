import { InvoiceModalFrame } from "./InvoiceModalFrame";
import {
  cn,
  getManagerLabelClasses,
  getManagerPrimaryButtonClasses,
  getManagerSecondaryButtonClasses,
  getManagerTextInputClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";

interface PaymentMethodModalProps {
  settings: ManagerSettings;
  values: {
    cardNumber: string;
    holderName: string;
    expiryDate: string;
    cvc: string;
  };
  onChange: (
    field: "cardNumber" | "holderName" | "expiryDate" | "cvc",
    value: string,
  ) => void;
  onClose: () => void;
  onSave: () => void;
}

export function PaymentMethodModal({
  settings,
  values,
  onChange,
  onClose,
  onSave,
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
            className={cn(getManagerSecondaryButtonClasses(settings.scheme), "rounded-[12px] px-5")}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className={cn(getManagerPrimaryButtonClasses(settings.scheme), "rounded-[12px] px-5")}
          >
            Save Method
          </button>
        </>
      }
      onClose={onClose}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={getManagerLabelClasses(settings.scheme)}>Card Number</label>
          <input
            type="text"
            value={values.cardNumber}
            onChange={(event) => onChange("cardNumber", event.target.value)}
            placeholder="4242 4242 4242 4242"
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
            className={cn("mt-2", getManagerTextInputClasses(settings.scheme))}
          />
        </div>
      </div>
    </InvoiceModalFrame>
  );
}
