"use client";

import { useState } from "react";
import {
  cn,
  getManagerLabelClasses,
  getManagerTextInputClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import { BillingSelect } from "./BillingSelect";
import { REFUND_REASON_OPTIONS } from "./billing.data";
import { getMutedButtonClasses, getRefundButtonClasses } from "./billing.helpers";
import { BillingModalFrame } from "./BillingModalFrame";
import type { BillRecord, RefundReason } from "./billing.types";

interface RefundBillModalProps {
  open: boolean;
  settings: ManagerSettings;
  bill: BillRecord | null;
  onClose: () => void;
  onConfirm: (reason: RefundReason) => void;
}

export function RefundBillModal({
  open,
  settings,
  bill,
  onClose,
  onConfirm,
}: RefundBillModalProps) {
  const [reasonOverride, setReasonOverride] = useState<RefundReason | null>(null);
  const reason = reasonOverride ?? "Customer cancelled item";

  function handleClose() {
    setReasonOverride(null);
    onClose();
  }

  function handleConfirm() {
    onConfirm(reason);
    setReasonOverride(null);
  }

  return (
    <BillingModalFrame
      open={open}
      settings={settings}
      title="Refund Bill"
      subtitle="Record a refund for incorrect or cancelled payment."
      maxWidthClassName="max-w-[1080px]"
      onClose={handleClose}
      footer={
        <>
          <button type="button" onClick={handleClose} className={getMutedButtonClasses(settings.scheme)}>
            Cancel
          </button>
          <button type="button" onClick={handleConfirm} className={getRefundButtonClasses(settings.scheme)}>
            Confirm Refund
          </button>
        </>
      }
    >
      {bill ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="refund-bill-id" className={getManagerLabelClasses(settings.scheme)}>
              Bill ID
            </label>
            <input
              id="refund-bill-id"
              value={bill.billId}
              disabled
              className={cn(getManagerTextInputClasses(settings.scheme), "cursor-not-allowed opacity-80")}
            />
          </div>

          <div className="space-y-2">
            <div className={getManagerLabelClasses(settings.scheme)}>Refund Reason</div>
            <BillingSelect
              label="Refund reason"
              settings={settings}
              options={REFUND_REASON_OPTIONS.map((option) => ({ label: option, value: option }))}
              value={reason}
              onChange={setReasonOverride}
            />
          </div>
        </div>
      ) : null}
    </BillingModalFrame>
  );
}
