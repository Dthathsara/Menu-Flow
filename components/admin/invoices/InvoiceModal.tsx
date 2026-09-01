"use client";

import { useEffect, useState } from "react";
import { AdminButton } from "../common/AdminButton";
import { AdminModal } from "../common/AdminModal";
import { adminInputClasses, adminLabelClasses, adminMutedClasses } from "../common/adminStyles";
import type { AdminModalMode, AdminScheme } from "../common/adminTypes";
import { createInvoiceSchema, updateInvoiceSchema } from "./invoice.schema";
import type {
  AdminInvoice,
  ClientOption,
  CreateAdminInvoicePayload,
  InvoiceStatus,
  UpdateAdminInvoicePayload,
} from "./invoice.types";
import { getApiErrorMessage } from "@/lib/error-handler";
import { formatLKR } from "./invoice.helpers";

interface InvoiceModalProps {
  scheme: AdminScheme;
  mode: AdminModalMode;
  invoice: AdminInvoice | null;
  clients: ClientOption[];
  open: boolean;
  onClose: () => void;
  onSave: (payload: CreateAdminInvoicePayload | UpdateAdminInvoicePayload) => Promise<void>;
  onConfirmDelete: (id: string) => Promise<void>;
}

export function InvoiceModal({
  scheme,
  mode,
  invoice,
  clients,
  open,
  onClose,
  onSave,
  onConfirmDelete,
}: InvoiceModalProps) {
  const [invoiceIdInput, setInvoiceIdInput] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [dueDateInput, setDueDateInput] = useState("");
  const [statusInput, setStatusInput] = useState<InvoiceStatus>("Pending");
  const [planNameInput, setPlanNameInput] = useState("");

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    setFormErrors({});
    setApiError("");
    setIsSubmitting(false);

    if (mode === "edit" && invoice) {
      setInvoiceIdInput(invoice.invoiceId);
      setSelectedClientId(invoice.clientId);
      setAmountInput(String(invoice.amount));
      setDueDateInput(
        invoice.dueDate.includes("T") ? invoice.dueDate.split("T")[0] : invoice.dueDate,
      );
      setStatusInput(invoice.status);
      setPlanNameInput(invoice.planName || "");
    } else if (mode === "add") {
      const randomNum = Math.floor(100 + Math.random() * 900);
      setInvoiceIdInput(`INV-2026-${randomNum}`);
      setSelectedClientId(clients[0]?.id || "");
      setAmountInput("");
      setDueDateInput(new Date().toISOString().split("T")[0]);
      setStatusInput("Pending");
      setPlanNameInput("");
    }
  }, [open, mode, invoice, clients]);

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormErrors({});
    setApiError("");

    const numAmount = parseFloat(amountInput.replace(/[^\d.-]/g, ""));

    const rawPayload = {
      invoiceId: invoiceIdInput.trim(),
      clientId: selectedClientId.trim(),
      amount: numAmount,
      dueDate: dueDateInput.trim(),
      status: statusInput,
      ...(planNameInput.trim() && { planName: planNameInput.trim() }),
    };

    const validationResult =
      mode === "edit"
        ? updateInvoiceSchema.safeParse(rawPayload)
        : createInvoiceSchema.safeParse(rawPayload);

    if (!validationResult.success || !validationResult.data) {
      setFormErrors(validationResult.errors || { _form: "Form validation failed." });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(validationResult.data);
      onClose();
    } catch (err) {
      const errorMsg = getApiErrorMessage(err, "Failed to save invoice.");
      setApiError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!invoice) return;
    setApiError("");
    setIsSubmitting(true);

    try {
      await onConfirmDelete(invoice.id);
      onClose();
    } catch (err) {
      const errorMsg = getApiErrorMessage(err, "Failed to delete invoice.");
      setApiError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (mode === "delete") {
    return (
      <AdminModal
        open={open}
        scheme={scheme}
        title="Delete Invoice"
        size="sm"
        onClose={onClose}
        footer={
          <>
            <AdminButton scheme={scheme} onClick={onClose} disabled={isSubmitting}>
              Cancel
            </AdminButton>
            <AdminButton
              scheme={scheme}
              variant="danger"
              disabled={isSubmitting}
              onClick={handleDeleteConfirm}
            >
              {isSubmitting ? "Deleting..." : "Confirm Delete"}
            </AdminButton>
          </>
        }
      >
        {apiError ? (
          <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-500/15 p-3.5 text-xs font-semibold text-rose-300">
            {apiError}
          </div>
        ) : null}

        <div className="space-y-3">
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm">
            <p className="font-extrabold text-rose-300">⚠️ Warning: High-Contrast Deletion Notice</p>
            <p className="mt-1 text-xs leading-5 text-rose-200/90">
              Are you sure you want to permanently delete this invoice?
            </p>
          </div>

          <div className={adminMutedClasses(scheme)}>
            <div className="text-xs space-y-1">
              <div>
                <span className="font-semibold">Invoice ID:</span>{" "}
                <span className="font-mono text-current font-bold">{invoice?.invoiceId || invoice?.id}</span>
              </div>
              <div>
                <span className="font-semibold">Client:</span>{" "}
                <span className="text-current font-semibold">{invoice?.clientName}</span>
              </div>
              <div>
                <span className="font-semibold">Amount:</span>{" "}
                <span className="text-emerald-400 font-bold">{formatLKR(invoice?.amount)}</span>
              </div>
            </div>
          </div>
        </div>
      </AdminModal>
    );
  }

  return (
    <AdminModal
      open={open}
      scheme={scheme}
      title={mode === "edit" ? "Update Invoice Details" : "Add Invoice Details"}
      onClose={onClose}
      footer={
        <>
          <AdminButton scheme={scheme} onClick={onClose} disabled={isSubmitting}>
            Cancel
          </AdminButton>
          <AdminButton
            scheme={scheme}
            variant="primary"
            disabled={isSubmitting}
            onClick={handleFormSubmit}
          >
            {isSubmitting ? "Saving..." : mode === "edit" ? "Update Invoice" : "Save Invoice"}
          </AdminButton>
        </>
      }
    >
      <form onSubmit={handleFormSubmit} className="space-y-4">
        {apiError ? (
          <div className="rounded-xl border border-rose-500/40 bg-rose-500/15 p-3.5 text-xs font-semibold text-rose-300">
            {apiError}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className={adminLabelClasses(scheme)}>Invoice ID *</span>
            <input
              type="text"
              value={invoiceIdInput}
              onChange={(e) => {
                setInvoiceIdInput(e.target.value);
                if (formErrors.invoiceId) setFormErrors((prev) => ({ ...prev, invoiceId: "" }));
              }}
              disabled={isSubmitting}
              className={adminInputClasses(scheme)}
              placeholder="e.g. INV-2026-001"
            />
            {formErrors.invoiceId ? (
              <p className="text-xs font-medium text-rose-400">{formErrors.invoiceId}</p>
            ) : null}
          </label>

          <label className="space-y-2">
            <span className={adminLabelClasses(scheme)}>Client / Restaurant *</span>
            <select
              value={selectedClientId}
              onChange={(e) => {
                setSelectedClientId(e.target.value);
                if (formErrors.clientId) setFormErrors((prev) => ({ ...prev, clientId: "" }));
              }}
              disabled={isSubmitting}
              className={adminInputClasses(scheme)}
            >
              <option value="">-- Select Client --</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.ownerName ? `(${c.ownerName})` : ""}
                </option>
              ))}
              {mode === "edit" && invoice?.clientId && !clients.some((c) => c.id === invoice.clientId) ? (
                <option value={invoice.clientId}>{invoice.clientName || invoice.clientId}</option>
              ) : null}
            </select>
            {formErrors.clientId ? (
              <p className="text-xs font-medium text-rose-400">{formErrors.clientId}</p>
            ) : null}
          </label>

          <label className="space-y-2">
            <span className={adminLabelClasses(scheme)}>Amount in LKR *</span>
            <input
              type="text"
              value={amountInput}
              onChange={(e) => {
                setAmountInput(e.target.value);
                if (formErrors.amount) setFormErrors((prev) => ({ ...prev, amount: "" }));
              }}
              disabled={isSubmitting}
              className={adminInputClasses(scheme)}
              placeholder="e.g. 48500"
            />
            {formErrors.amount ? (
              <p className="text-xs font-medium text-rose-400">{formErrors.amount}</p>
            ) : null}
          </label>

          <label className="space-y-2">
            <span className={adminLabelClasses(scheme)}>Due Date *</span>
            <input
              type="date"
              value={dueDateInput}
              onChange={(e) => {
                setDueDateInput(e.target.value);
                if (formErrors.dueDate) setFormErrors((prev) => ({ ...prev, dueDate: "" }));
              }}
              disabled={isSubmitting}
              className={adminInputClasses(scheme)}
            />
            {formErrors.dueDate ? (
              <p className="text-xs font-medium text-rose-400">{formErrors.dueDate}</p>
            ) : null}
          </label>

          <label className="space-y-2">
            <span className={adminLabelClasses(scheme)}>Status *</span>
            <select
              value={statusInput}
              onChange={(e) => setStatusInput(e.target.value as InvoiceStatus)}
              disabled={isSubmitting}
              className={adminInputClasses(scheme)}
            >
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
            {formErrors.status ? (
              <p className="text-xs font-medium text-rose-400">{formErrors.status}</p>
            ) : null}
          </label>

          <label className="space-y-2">
            <span className={adminLabelClasses(scheme)}>Plan Description (Optional)</span>
            <input
              type="text"
              value={planNameInput}
              onChange={(e) => setPlanNameInput(e.target.value)}
              disabled={isSubmitting}
              className={adminInputClasses(scheme)}
              placeholder="e.g. Pro Monthly Plan"
            />
          </label>
        </div>
      </form>
    </AdminModal>
  );
}
