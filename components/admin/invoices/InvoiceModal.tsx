"use client";

import { useState } from "react";
import { AdminButton } from "../common/AdminButton";
import { AdminModal } from "../common/AdminModal";
import { adminInputClasses, adminLabelClasses, adminMutedClasses } from "../common/adminStyles";
import type { AdminModalMode, AdminScheme } from "../common/adminTypes";
import type { InvoiceRecord } from "./InvoicesTable";

interface InvoiceModalProps {
  scheme: AdminScheme;
  mode: AdminModalMode;
  invoice: InvoiceRecord | null;
  open: boolean;
  onClose: () => void;
  onSave: (invoice: InvoiceRecord) => void;
  onConfirmDelete: (id: string) => void;
}

const emptyInvoice: InvoiceRecord = {
  id: "",
  invoiceId: "INV-2026-005",
  client: "",
  amount: "",
  dueDate: "",
  status: "Pending",
};

export function InvoiceModal({ scheme, mode, invoice, open, onClose, onSave, onConfirmDelete }: InvoiceModalProps) {
  const [form, setForm] = useState<InvoiceRecord>(() => invoice ?? { ...emptyInvoice, id: crypto.randomUUID() });

  if (mode === "delete") {
    return (
      <AdminModal open={open} scheme={scheme} title="Delete Invoice" size="sm" onClose={onClose} footer={<><AdminButton scheme={scheme} onClick={onClose}>Cancel</AdminButton><AdminButton scheme={scheme} variant="danger" onClick={() => invoice && onConfirmDelete(invoice.id)}>Delete</AdminButton></>}>
        <p className={adminMutedClasses(scheme)}>Are you sure you want to delete this invoice?</p>
      </AdminModal>
    );
  }

  return (
    <AdminModal open={open} scheme={scheme} title={mode === "edit" ? "Update Invoice Details" : "Add Invoice Details"} onClose={onClose} footer={<><AdminButton scheme={scheme} onClick={onClose}>Cancel</AdminButton><AdminButton scheme={scheme} variant="primary" onClick={() => onSave(form)}>Save</AdminButton></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className={adminLabelClasses(scheme)}>Invoice ID</span>
          <input value={form.invoiceId} onChange={(event) => setForm((current) => ({ ...current, invoiceId: event.target.value }))} className={adminInputClasses(scheme)} />
        </label>
        <label className="space-y-2">
          <span className={adminLabelClasses(scheme)}>Client</span>
          <input value={form.client} onChange={(event) => setForm((current) => ({ ...current, client: event.target.value }))} className={adminInputClasses(scheme)} />
        </label>
        <label className="space-y-2">
          <span className={adminLabelClasses(scheme)}>Amount</span>
          <input value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} className={adminInputClasses(scheme)} />
        </label>
        <label className="space-y-2">
          <span className={adminLabelClasses(scheme)}>Due Date</span>
          <input value={form.dueDate} onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))} className={adminInputClasses(scheme)} />
        </label>
        <label className="space-y-2">
          <span className={adminLabelClasses(scheme)}>Status</span>
          <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as InvoiceRecord["status"] }))} className={adminInputClasses(scheme)}>
            <option>Paid</option>
            <option>Pending</option>
            <option>Overdue</option>
          </select>
        </label>
      </div>
    </AdminModal>
  );
}
