"use client";

import { useState } from "react";
import {
  cn,
  getManagerLabelClasses,
  getManagerPrimaryButtonClasses,
  getManagerTextInputClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import { BillingSelect } from "./BillingSelect";
import { CREATE_BILL_STATUS_OPTIONS } from "./billing.data";
import { getMutedButtonClasses } from "./billing.helpers";
import { BillingModalFrame } from "./BillingModalFrame";
import type { CreateBillFormValues } from "./billing.types";

interface CreateBillModalProps {
  open: boolean;
  settings: ManagerSettings;
  onClose: () => void;
  onCreate: (values: CreateBillFormValues) => void;
}

const DEFAULT_VALUES: CreateBillFormValues = {
  tableNumber: "",
  waiterName: "",
  totalAmount: "",
  status: "Pending",
};

export function CreateBillModal({
  open,
  settings,
  onClose,
  onCreate,
}: CreateBillModalProps) {
  const [values, setValues] = useState<CreateBillFormValues>(DEFAULT_VALUES);

  function handleClose() {
    setValues(DEFAULT_VALUES);
    onClose();
  }

  return (
    <BillingModalFrame
      open={open}
      settings={settings}
      title="Create Bill"
      subtitle="Create a bill from a QR table order."
      maxWidthClassName="max-w-[960px]"
      onClose={handleClose}
      footer={
        <>
          <button type="button" onClick={handleClose} className={getMutedButtonClasses(settings.scheme)}>
            Cancel
          </button>
          <button
            type="submit"
            form="create-bill-form"
            className={cn(getManagerPrimaryButtonClasses(settings.scheme), "h-10 rounded-[14px] px-5 text-[14px]")}
          >
            Create Bill
          </button>
        </>
      }
    >
      <form
        id="create-bill-form"
        className="grid gap-5"
        onSubmit={(event) => {
          event.preventDefault();
          onCreate(values);
          setValues(DEFAULT_VALUES);
        }}
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="create-bill-table" className={getManagerLabelClasses(settings.scheme)}>
              Table Number
            </label>
            <input
              id="create-bill-table"
              value={values.tableNumber}
              onChange={(event) =>
                setValues((current) => ({ ...current, tableNumber: event.target.value }))
              }
              placeholder="T-09"
              className={getManagerTextInputClasses(settings.scheme)}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="create-bill-waiter" className={getManagerLabelClasses(settings.scheme)}>
              Waiter
            </label>
            <input
              id="create-bill-waiter"
              value={values.waiterName}
              onChange={(event) =>
                setValues((current) => ({ ...current, waiterName: event.target.value }))
              }
              placeholder="Kavindu Peris"
              className={getManagerTextInputClasses(settings.scheme)}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="create-bill-total" className={getManagerLabelClasses(settings.scheme)}>
              Total Amount
            </label>
            <input
              id="create-bill-total"
              type="number"
              min="1"
              value={values.totalAmount}
              onChange={(event) =>
                setValues((current) => ({ ...current, totalAmount: event.target.value }))
              }
              placeholder="8450"
              className={getManagerTextInputClasses(settings.scheme)}
              required
            />
          </div>

          <div className="space-y-2">
            <div className={getManagerLabelClasses(settings.scheme)}>Status</div>
            <BillingSelect
              label="Bill status"
              settings={settings}
              options={CREATE_BILL_STATUS_OPTIONS.map((option) => ({ label: option, value: option }))}
              value={values.status}
              onChange={(status) => setValues((current) => ({ ...current, status }))}
            />
          </div>
        </div>
      </form>
    </BillingModalFrame>
  );
}
