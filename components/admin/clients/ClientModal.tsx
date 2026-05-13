"use client";

import { useState } from "react";
import { cn } from "@/components/manager/managerUtils";
import { AdminButton } from "../common/AdminButton";
import { AdminModal } from "../common/AdminModal";
import { adminInputClasses, adminLabelClasses, adminMutedClasses, adminTextareaClasses } from "../common/adminStyles";
import type { AdminModalMode, AdminScheme } from "../common/adminTypes";
import type { ClientRecord } from "./ClientTable";

interface ClientModalProps {
  scheme: AdminScheme;
  mode: AdminModalMode;
  client: ClientRecord | null;
  open: boolean;
  onClose: () => void;
  onSave: (client: ClientRecord) => void;
  onConfirmDelete: (id: string) => void;
}

const emptyClient: ClientRecord = {
  id: "",
  business: "",
  owner: "",
  email: "",
  package: "Starter",
  status: "Active",
  notes: "Client business address and special notes",
};

export function ClientModal({ scheme, mode, client, open, onClose, onSave, onConfirmDelete }: ClientModalProps) {
  const [form, setForm] = useState<ClientRecord>(() => client ?? { ...emptyClient, id: crypto.randomUUID() });

  if (mode === "delete") {
    return (
      <AdminModal
        open={open}
        scheme={scheme}
        title="Delete Client"
        size="sm"
        onClose={onClose}
        footer={<><AdminButton scheme={scheme} onClick={onClose}>Cancel</AdminButton><AdminButton scheme={scheme} variant="danger" onClick={() => client && onConfirmDelete(client.id)}>Delete</AdminButton></>}
      >
        <p className={cn("text-sm leading-6", adminMutedClasses(scheme))}>Are you sure you want to delete this client?</p>
      </AdminModal>
    );
  }

  return (
    <AdminModal
      open={open}
      scheme={scheme}
      title={mode === "edit" ? "Update Client Details" : "Add Client Details"}
      onClose={onClose}
      footer={<><AdminButton scheme={scheme} onClick={onClose}>Cancel</AdminButton><AdminButton scheme={scheme} variant="primary" onClick={() => onSave(form)}>Save</AdminButton></>}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className={adminLabelClasses(scheme)}>Business Name</span>
          <input value={form.business} onChange={(event) => setForm((current) => ({ ...current, business: event.target.value }))} className={adminInputClasses(scheme)} />
        </label>
        <label className="space-y-2">
          <span className={adminLabelClasses(scheme)}>Owner Name</span>
          <input value={form.owner} onChange={(event) => setForm((current) => ({ ...current, owner: event.target.value }))} className={adminInputClasses(scheme)} />
        </label>
        <label className="space-y-2">
          <span className={adminLabelClasses(scheme)}>Email</span>
          <input value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} className={adminInputClasses(scheme)} />
        </label>
        <label className="space-y-2">
          <span className={adminLabelClasses(scheme)}>Package</span>
          <select value={form.package} onChange={(event) => setForm((current) => ({ ...current, package: event.target.value as ClientRecord["package"] }))} className={adminInputClasses(scheme)}>
            <option>Starter</option>
            <option>Business</option>
            <option>Pro</option>
            <option>Enterprise</option>
          </select>
        </label>
        <label className="space-y-2">
          <span className={adminLabelClasses(scheme)}>Status</span>
          <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as ClientRecord["status"] }))} className={adminInputClasses(scheme)}>
            <option>Active</option>
            <option>Pending</option>
            <option>Inactive</option>
          </select>
        </label>
        <label className="space-y-2 sm:col-span-2">
          <span className={adminLabelClasses(scheme)}>Address / Notes</span>
          <textarea placeholder="Client business address and special notes" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} className={adminTextareaClasses(scheme)} />
        </label>
      </div>
    </AdminModal>
  );
}
