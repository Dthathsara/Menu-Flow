"use client";

import { useMemo, useState } from "react";
import {
  formatSystemStaffRole,
  type CreateSystemStaffUserInput,
  type SystemStaffRole,
  type SystemStaffStatus,
  type SystemStaffUser,
  type UpdateSystemStaffUserInput,
} from "@/lib/system-admin-api";
import { AdminButton } from "../common/AdminButton";
import { AdminModal } from "../common/AdminModal";
import { adminInputClasses, adminLabelClasses, adminMutedClasses } from "../common/adminStyles";
import type { AdminModalMode, AdminScheme } from "../common/adminTypes";

interface UserModalProps {
  scheme: AdminScheme;
  mode: AdminModalMode;
  user: SystemStaffUser | null;
  currentUserId: string;
  open: boolean;
  submitting: boolean;
  error: string;
  onClose: () => void;
  onSave: (userId: string | null, values: CreateSystemStaffUserInput | UpdateSystemStaffUserInput) => Promise<void>;
  onConfirmDelete: (id: string) => Promise<void>;
}

interface UserFormState {
  fullName: string;
  email: string;
  password: string;
  role: SystemStaffRole;
  status: SystemStaffStatus;
}

const roleOptions: SystemStaffRole[] = ["SUPER_ADMIN", "ADMIN", "SUPPORT", "FINANCE"];
const statusOptions: SystemStaffStatus[] = ["Active", "Inactive"];

const emptyUser: UserFormState = {
  fullName: "",
  email: "",
  password: "",
  role: "ADMIN",
  status: "Active",
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function createFormState(user: SystemStaffUser | null): UserFormState {
  if (!user) {
    return emptyUser;
  }

  return {
    fullName: user.fullName,
    email: user.email,
    password: "",
    role: user.role,
    status: user.status,
  };
}

export function UserModal({
  scheme,
  mode,
  user,
  currentUserId,
  open,
  submitting,
  error,
  onClose,
  onSave,
  onConfirmDelete,
}: UserModalProps) {
  const initialState = useMemo(() => createFormState(user), [user]);
  const [form, setForm] = useState<UserFormState>(initialState);
  const [fieldError, setFieldError] = useState("");
  const isEdit = mode === "edit";

  function validate() {
    if (!form.fullName.trim()) return "Full name is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!isValidEmail(form.email)) return "Enter a valid email address.";
    if (!isEdit && !form.password.trim()) return "Password is required.";
    if (form.password && form.password.length < 8) return "Password must be at least 8 characters.";
    return "";
  }

  async function handleSave() {
    const nextError = validate();
    setFieldError(nextError);

    if (nextError) {
      return;
    }

    const trimmed = {
      fullName: form.fullName.trim(),
      email: form.email.trim().toLowerCase(),
      role: form.role,
      status: form.status,
    };

    if (isEdit) {
      await onSave(user?.id ?? null, trimmed);
      return;
    }

    await onSave(null, {
      ...trimmed,
      password: form.password,
    });
    setForm((current) => ({ ...current, password: "" }));
  }

  if (mode === "delete") {
    const isCurrentUser = Boolean(user?.id && user.id === currentUserId);

    return (
      <AdminModal
        open={open}
        scheme={scheme}
        title="Delete User"
        size="sm"
        onClose={onClose}
        footer={
          <>
            <AdminButton scheme={scheme} onClick={onClose} disabled={submitting}>Cancel</AdminButton>
            <AdminButton
              scheme={scheme}
              variant="danger"
              onClick={() => user && onConfirmDelete(user.id)}
              disabled={submitting || isCurrentUser}
            >
              {submitting ? "Deleting..." : "Delete"}
            </AdminButton>
          </>
        }
      >
        <p className={adminMutedClasses(scheme)}>
          Are you sure you want to delete {user?.fullName || "this user"}?
        </p>
        {isCurrentUser ? (
          <p className="mt-4 text-sm font-semibold text-rose-400">
            You cannot delete the currently authenticated account.
          </p>
        ) : null}
        {error ? <p className="mt-4 text-sm font-semibold text-rose-400">{error}</p> : null}
      </AdminModal>
    );
  }

  return (
    <AdminModal
      open={open}
      scheme={scheme}
      title={isEdit ? "Update System Staff User" : "Add System Staff User"}
      onClose={onClose}
      footer={
        <>
          <AdminButton scheme={scheme} onClick={onClose} disabled={submitting}>Cancel</AdminButton>
          <AdminButton scheme={scheme} variant="primary" onClick={handleSave} disabled={submitting}>
            {submitting ? "Saving..." : "Save"}
          </AdminButton>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className={adminLabelClasses(scheme)}>Full Name</span>
          <input value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} className={adminInputClasses(scheme)} />
        </label>
        <label className="space-y-2">
          <span className={adminLabelClasses(scheme)}>Email</span>
          <input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} className={adminInputClasses(scheme)} />
        </label>
        {!isEdit ? (
          <label className="space-y-2">
            <span className={adminLabelClasses(scheme)}>Password</span>
            <input type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} className={adminInputClasses(scheme)} autoComplete="new-password" />
          </label>
        ) : null}
        <label className="space-y-2">
          <span className={adminLabelClasses(scheme)}>Role</span>
          <select value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as SystemStaffRole }))} className={adminInputClasses(scheme)}>
            {roleOptions.map((role) => <option key={role} value={role}>{formatSystemStaffRole(role)}</option>)}
          </select>
        </label>
        <label className="space-y-2">
          <span className={adminLabelClasses(scheme)}>Status</span>
          <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as SystemStaffStatus }))} className={adminInputClasses(scheme)}>
            {statusOptions.map((status) => <option key={status}>{status}</option>)}
          </select>
        </label>
      </div>
      {fieldError || error ? (
        <p className="mt-4 text-sm font-semibold text-rose-400">{fieldError || error}</p>
      ) : null}
    </AdminModal>
  );
}
