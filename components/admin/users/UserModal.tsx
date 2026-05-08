"use client";

import { useState } from "react";
import { AdminButton } from "../common/AdminButton";
import { AdminModal } from "../common/AdminModal";
import { adminInputClasses, adminLabelClasses, adminMutedClasses } from "../common/adminStyles";
import type { AdminModalMode, AdminScheme } from "../common/adminTypes";
import type { StaffUserRecord } from "./UsersTable";

interface UserModalProps {
  scheme: AdminScheme;
  mode: AdminModalMode;
  user: StaffUserRecord | null;
  open: boolean;
  onClose: () => void;
  onSave: (user: StaffUserRecord) => void;
  onConfirmDelete: (id: string) => void;
}

const emptyUser: StaffUserRecord = {
  id: "",
  name: "",
  email: "",
  role: "Admin",
  lastLogin: "Never",
  status: "Active",
};

export function UserModal({ scheme, mode, user, open, onClose, onSave, onConfirmDelete }: UserModalProps) {
  const [form, setForm] = useState<StaffUserRecord>(() => user ?? { ...emptyUser, id: crypto.randomUUID() });

  if (mode === "delete") {
    return (
      <AdminModal open={open} scheme={scheme} title="Delete User" size="sm" onClose={onClose} footer={<><AdminButton scheme={scheme} onClick={onClose}>Cancel</AdminButton><AdminButton scheme={scheme} variant="danger" onClick={() => user && onConfirmDelete(user.id)}>Delete</AdminButton></>}>
        <p className={adminMutedClasses(scheme)}>Are you sure you want to delete this user?</p>
      </AdminModal>
    );
  }

  return (
    <AdminModal open={open} scheme={scheme} title={mode === "edit" ? "Update System Staff User" : "Add System Staff User"} onClose={onClose} footer={<><AdminButton scheme={scheme} onClick={onClose}>Cancel</AdminButton><AdminButton scheme={scheme} variant="primary" onClick={() => onSave(form)}>Save</AdminButton></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className={adminLabelClasses(scheme)}>Full Name</span>
          <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className={adminInputClasses(scheme)} />
        </label>
        <label className="space-y-2">
          <span className={adminLabelClasses(scheme)}>Email</span>
          <input value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} className={adminInputClasses(scheme)} />
        </label>
        <label className="space-y-2">
          <span className={adminLabelClasses(scheme)}>Role</span>
          <select value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as StaffUserRecord["role"] }))} className={adminInputClasses(scheme)}>
            <option>Super Admin</option>
            <option>Admin</option>
            <option>Support</option>
            <option>Finance</option>
          </select>
        </label>
        <label className="space-y-2">
          <span className={adminLabelClasses(scheme)}>Status</span>
          <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as StaffUserRecord["status"] }))} className={adminInputClasses(scheme)}>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </label>
      </div>
    </AdminModal>
  );
}
