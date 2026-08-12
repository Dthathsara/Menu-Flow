import { ChevronDownIcon } from "../icons";
import { InvoiceModalFrame } from "./InvoiceModalFrame";
import {
  cn,
  getManagerLabelClasses,
  getManagerPrimaryButtonClasses,
  getManagerSecondaryButtonClasses,
  getManagerTextInputClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import type { PaymentMethodRecord } from "./invoice.types";

interface PaymentModalProps {
  settings: ManagerSettings;
  amount: string;
  cardHolderName: string;
  selectedPaymentMethodId: string;
  paymentMethods: PaymentMethodRecord[];
  billingEmail: string;
  onCardHolderNameChange: (value: string) => void;
  onPaymentMethodChange: (value: string) => void;
  onBillingEmailChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  isSaving?: boolean;
  errorMessage?: string;
}

export function PaymentModal({
  settings,
  amount,
  cardHolderName,
  selectedPaymentMethodId,
  paymentMethods,
  billingEmail,
  onCardHolderNameChange,
  onPaymentMethodChange,
  onBillingEmailChange,
  onClose,
  onConfirm,
  isSaving = false,
  errorMessage = "",
}: PaymentModalProps) {
  const hasPaymentMethods = paymentMethods.length > 0;

  return (
    <InvoiceModalFrame
      open
      settings={settings}
      title="Renew Subscription"
      subtitle="Confirm payment method and renew your current package."
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
            onClick={onConfirm}
            disabled={isSaving || !hasPaymentMethods}
            className={cn(getManagerPrimaryButtonClasses(settings.scheme), "rounded-[12px] px-5 disabled:cursor-not-allowed disabled:opacity-55")}
          >
            {isSaving ? "Processing..." : "Confirm Payment"}
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

      {!hasPaymentMethods ? (
        <div className="mb-4 rounded-[14px] border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-[13px] font-semibold text-amber-300">
          Add a payment method before renewing this subscription.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
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
        <div>
          <label className={getManagerLabelClasses(settings.scheme)}>Payment Method</label>
          <div className="relative mt-2">
            <select
              value={selectedPaymentMethodId}
              onChange={(event) => onPaymentMethodChange(event.target.value)}
              disabled={isSaving || !hasPaymentMethods}
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
          <label className={getManagerLabelClasses(settings.scheme)}>Amount</label>
          <input
            type="text"
            value={amount}
            readOnly
            className={cn("mt-2", getManagerTextInputClasses(settings.scheme))}
          />
        </div>
        <div>
          <label className={getManagerLabelClasses(settings.scheme)}>Billing Email</label>
          <input
            type="email"
            value={billingEmail}
            onChange={(event) => onBillingEmailChange(event.target.value)}
            disabled={isSaving}
            className={cn("mt-2", getManagerTextInputClasses(settings.scheme))}
          />
        </div>
      </div>
    </InvoiceModalFrame>
  );
}
