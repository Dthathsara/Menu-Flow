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
  onCreate: (values: CreateBillFormValues) => void | Promise<void>;
  isSaving?: boolean;
  errorMessage?: string;
  waiterSuggestions?: string[];
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
  isSaving = false,
  errorMessage = "",
  waiterSuggestions = [],
}: CreateBillModalProps) {
  const [values, setValues] = useState<CreateBillFormValues>(DEFAULT_VALUES);
  const [isWaiterListOpen, setIsWaiterListOpen] = useState(false);
  const waiterQuery = values.waiterName.trim().toLowerCase();
  const visibleWaiters = waiterSuggestions
    .filter((name) => !waiterQuery || name.toLowerCase().includes(waiterQuery))
    .slice(0, 8);

  function handleClose() {
    if (isSaving) {
      return;
    }

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
          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving}
            className={getMutedButtonClasses(settings.scheme)}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-bill-form"
            disabled={isSaving}
            className={cn(getManagerPrimaryButtonClasses(settings.scheme), "h-10 rounded-[14px] px-5 text-[14px]")}
          >
            {isSaving ? "Creating..." : "Create Bill"}
          </button>
        </>
      }
    >
      <form
        id="create-bill-form"
        className="grid gap-5"
        onSubmit={(event) => {
          event.preventDefault();
          if (!isSaving) {
            void onCreate(values);
          }
        }}
      >
        {errorMessage ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-300">
            {errorMessage}
          </div>
        ) : null}
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
              disabled={isSaving}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="create-bill-waiter" className={getManagerLabelClasses(settings.scheme)}>
              Waiter
            </label>
            <div className="relative">
              <input
                id="create-bill-waiter"
                value={values.waiterName}
                onChange={(event) => {
                  setValues((current) => ({ ...current, waiterName: event.target.value }));
                  setIsWaiterListOpen(true);
                }}
                onFocus={() => setIsWaiterListOpen(true)}
                onClick={() => setIsWaiterListOpen(true)}
                onBlur={() => window.setTimeout(() => setIsWaiterListOpen(false), 120)}
                placeholder="Kavindu Peris"
                className={getManagerTextInputClasses(settings.scheme)}
                disabled={isSaving}
                required
                autoComplete="off"
              />
              {isWaiterListOpen && visibleWaiters.length ? (
                <div
                  className={cn(
                    "absolute left-0 right-0 top-[calc(100%+8px)] z-20 max-h-56 overflow-y-auto rounded-2xl border p-1 shadow-2xl backdrop-blur-xl",
                    settings.scheme === "dark"
                      ? "border-white/10 bg-slate-950/96"
                      : "border-slate-200 bg-white/98",
                  )}
                >
                  {visibleWaiters.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        setValues((current) => ({ ...current, waiterName: name }));
                        setIsWaiterListOpen(false);
                      }}
                      className={cn(
                        "block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold transition",
                        settings.scheme === "dark"
                          ? "text-slate-100 hover:bg-white/10"
                          : "text-slate-800 hover:bg-slate-100",
                      )}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
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
              disabled={isSaving}
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
