"use client";

import { useState } from "react";
import { AdminButton } from "../common/AdminButton";
import { AdminModal } from "../common/AdminModal";
import { adminInputClasses, adminLabelClasses, adminMutedClasses, adminTextareaClasses } from "../common/adminStyles";
import type { AdminModalMode, AdminScheme } from "../common/adminTypes";
import type { PackageRecord } from "./PackagesTable";

interface PackageModalProps {
  scheme: AdminScheme;
  mode: AdminModalMode;
  packageItem: PackageRecord | null;
  open: boolean;
  onClose: () => void;
  onSave: (item: PackageRecord) => void;
  onConfirmDelete: (id: string) => void;
}

const emptyPackage: PackageRecord = {
  id: "",
  packageName: "",
  price: "",
  clients: 0,
  features: "QR ordering, menu management, analytics",
  status: "Active",
};

export function PackageModal({ scheme, mode, packageItem, open, onClose, onSave, onConfirmDelete }: PackageModalProps) {
  const [form, setForm] = useState<PackageRecord>(() => packageItem ?? { ...emptyPackage, id: crypto.randomUUID() });

  if (mode === "delete") {
    return (
      <AdminModal open={open} scheme={scheme} title="Delete Package" size="sm" onClose={onClose} footer={<><AdminButton scheme={scheme} onClick={onClose}>Cancel</AdminButton><AdminButton scheme={scheme} variant="danger" onClick={() => packageItem && onConfirmDelete(packageItem.id)}>Delete</AdminButton></>}>
        <p className={adminMutedClasses(scheme)}>Are you sure you want to delete this package?</p>
      </AdminModal>
    );
  }

  return (
    <AdminModal open={open} scheme={scheme} title={mode === "edit" ? "Update Package Details" : "Add Package Details"} onClose={onClose} footer={<><AdminButton scheme={scheme} onClick={onClose}>Cancel</AdminButton><AdminButton scheme={scheme} variant="primary" onClick={() => onSave(form)}>Save</AdminButton></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className={adminLabelClasses(scheme)}>Package Name</span>
          <input value={form.packageName} onChange={(event) => setForm((current) => ({ ...current, packageName: event.target.value }))} className={adminInputClasses(scheme)} />
        </label>
        <label className="space-y-2">
          <span className={adminLabelClasses(scheme)}>Price</span>
          <input value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} className={adminInputClasses(scheme)} />
        </label>
        <label className="space-y-2">
          <span className={adminLabelClasses(scheme)}>Status</span>
          <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as PackageRecord["status"] }))} className={adminInputClasses(scheme)}>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </label>
        <label className="space-y-2 sm:col-span-2">
          <span className={adminLabelClasses(scheme)}>Features</span>
          <textarea placeholder="QR ordering, menu management, analytics" value={form.features} onChange={(event) => setForm((current) => ({ ...current, features: event.target.value }))} className={adminTextareaClasses(scheme)} />
        </label>
      </div>
    </AdminModal>
  );
}
