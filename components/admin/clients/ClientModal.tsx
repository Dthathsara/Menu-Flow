"use client";

import { useMemo, useState } from "react";
import { cn } from "@/components/manager/managerUtils";
import {
  type AdminClient,
  type AdminClientPackage,
  type AdminClientStatus,
  type CreateAdminClientInput,
  type UpdateAdminClientInput,
} from "@/lib/system-admin-api";
import { AdminButton } from "../common/AdminButton";
import { AdminModal } from "../common/AdminModal";
import { adminInputClasses, adminLabelClasses, adminMutedClasses, adminTextareaClasses } from "../common/adminStyles";
import type { SystemAdminPackage } from "@/lib/system-admin-api";
import type { AdminModalMode, AdminScheme } from "../common/adminTypes";

interface ClientModalProps {
  scheme: AdminScheme;
  mode: AdminModalMode;
  client: AdminClient | null;
  packages?: SystemAdminPackage[];
  open: boolean;
  submitting: boolean;
  error: string;
  onClose: () => void;
  onSave: (clientId: string | null, values: CreateAdminClientInput | UpdateAdminClientInput) => Promise<void>;
  onConfirmDelete: (id: string) => Promise<void>;
}

interface ClientFormState {
  restaurantName: string;
  ownerName: string;
  loginEmail: string;
  temporaryPassword: string;
  phone: string;
  businessType: string;
  location: string;
  address: string;
  businessEmail: string;
  packageId: string;
  packageName: string;
  status: AdminClientStatus;
}

const statusOptions: AdminClientStatus[] = ["Active", "Pending", "Inactive"];

const emptyClient: ClientFormState = {
  restaurantName: "",
  ownerName: "",
  loginEmail: "",
  temporaryPassword: "",
  phone: "",
  businessType: "",
  location: "",
  address: "",
  businessEmail: "",
  packageId: "",
  packageName: "",
  status: "Active",
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function resolveSelectedPackageId(client: AdminClient | null, packages: SystemAdminPackage[]): { packageId: string; packageName: string } {
  if (!client) {
    return { packageId: "", packageName: "" };
  }

  if (client.packageId && packages.some((p) => p.id === client.packageId)) {
    const matched = packages.find((p) => p.id === client.packageId)!;
    return { packageId: matched.id, packageName: matched.packageName };
  }

  if (client.packageCode) {
    const matchedByCode = packages.find((p) => p.packageCode.toLowerCase() === client.packageCode!.toLowerCase());
    if (matchedByCode) {
      return { packageId: matchedByCode.id, packageName: matchedByCode.packageName };
    }
  }

  if (client.packageName) {
    const matchedByName = packages.find((p) => p.packageName.toLowerCase() === client.packageName.toLowerCase());
    if (matchedByName) {
      return { packageId: matchedByName.id, packageName: matchedByName.packageName };
    }
  }

  return { packageId: client.packageId ?? "", packageName: client.packageName || "" };
}

function createFormState(client: AdminClient | null, packages: SystemAdminPackage[]): ClientFormState {
  const pkgRes = resolveSelectedPackageId(client, packages);
  if (!client) {
    return { ...emptyClient, packageId: pkgRes.packageId, packageName: pkgRes.packageName };
  }

  return {
    restaurantName: client.restaurantName,
    ownerName: client.ownerName,
    loginEmail: client.loginEmail,
    temporaryPassword: "",
    phone: client.phone,
    businessType: client.businessType,
    location: client.location,
    address: client.address,
    businessEmail: client.businessEmail,
    packageId: pkgRes.packageId,
    packageName: pkgRes.packageName,
    status: client.status,
  };
}

export function ClientModal({
  scheme,
  mode,
  client,
  packages = [],
  open,
  submitting,
  error,
  onClose,
  onSave,
  onConfirmDelete,
}: ClientModalProps) {
  const initialState = useMemo(() => createFormState(client, packages), [client, packages]);
  const [form, setForm] = useState<ClientFormState>(initialState);
  const [fieldError, setFieldError] = useState("");
  const isEdit = mode === "edit";

  function validate() {
    if (!form.restaurantName.trim()) return "Restaurant or business name is required.";
    if (!form.ownerName.trim()) return "Owner or contact-person name is required.";
    if (!form.loginEmail.trim()) return "Manager login email is required.";
    if (!isValidEmail(form.loginEmail)) return "Enter a valid manager login email.";
    if (!isEdit && !form.temporaryPassword.trim()) return "Temporary password is required.";
    if (!isEdit && form.temporaryPassword.length < 8) return "Temporary password must be at least 8 characters.";
    if (!form.phone.trim()) return "Contact phone is required.";
    if (form.businessEmail.trim() && !isValidEmail(form.businessEmail)) return "Enter a valid public business email.";
    return "";
  }

  async function handleSave() {
    const nextError = validate();
    setFieldError(nextError);

    if (nextError) {
      return;
    }

    const matchedPkg = packages.find((p) => p.id === form.packageId || p.packageName === form.packageName);

    const trimmed = {
      restaurantName: form.restaurantName.trim(),
      ownerName: form.ownerName.trim(),
      loginEmail: form.loginEmail.trim().toLowerCase(),
      phone: form.phone.trim(),
      businessType: form.businessType.trim(),
      location: form.location.trim(),
      address: form.address.trim(),
      businessEmail: form.businessEmail.trim().toLowerCase(),
      packageId: matchedPkg?.id || form.packageId || undefined,
      packageName: matchedPkg?.packageName || form.packageName || undefined,
      status: form.status,
    };

    if (isEdit) {
      await onSave(client?.id ?? null, trimmed);
      return;
    }

    await onSave(null, {
      ...trimmed,
      temporaryPassword: form.temporaryPassword.trim(),
    });
    setForm((current) => ({ ...current, temporaryPassword: "" }));
  }

  if (mode === "delete") {
    return (
      <AdminModal
        open={open}
        scheme={scheme}
        title="Delete Client"
        size="sm"
        onClose={onClose}
        footer={
          <>
            <AdminButton scheme={scheme} onClick={onClose} disabled={submitting}>Cancel</AdminButton>
            <AdminButton scheme={scheme} variant="danger" onClick={() => client && onConfirmDelete(client.id)} disabled={submitting}>
              {submitting ? "Deleting..." : "Delete"}
            </AdminButton>
          </>
        }
      >
        <p className={cn("text-sm leading-6", adminMutedClasses(scheme))}>
          Are you sure you want to delete {client?.restaurantName || "this client"}?
        </p>
        {error ? <p className="mt-4 text-sm font-semibold text-rose-400">{error}</p> : null}
      </AdminModal>
    );
  }

  return (
    <AdminModal
      open={open}
      scheme={scheme}
      title={isEdit ? "Update Client Details" : "Add Client Details"}
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
          <span className={adminLabelClasses(scheme)}>Business Name</span>
          <input value={form.restaurantName} onChange={(event) => setForm((current) => ({ ...current, restaurantName: event.target.value }))} className={adminInputClasses(scheme)} />
        </label>
        <label className="space-y-2">
          <span className={adminLabelClasses(scheme)}>Owner Name</span>
          <input value={form.ownerName} onChange={(event) => setForm((current) => ({ ...current, ownerName: event.target.value }))} className={adminInputClasses(scheme)} />
        </label>
        <label className="space-y-2">
          <span className={adminLabelClasses(scheme)}>Manager Login Email</span>
          <input type="email" value={form.loginEmail} onChange={(event) => setForm((current) => ({ ...current, loginEmail: event.target.value }))} className={adminInputClasses(scheme)} />
        </label>
        {!isEdit ? (
          <label className="space-y-2">
            <span className={adminLabelClasses(scheme)}>Temporary Password</span>
            <input type="password" value={form.temporaryPassword} onChange={(event) => setForm((current) => ({ ...current, temporaryPassword: event.target.value }))} className={adminInputClasses(scheme)} autoComplete="new-password" />
          </label>
        ) : null}
        <label className="space-y-2">
          <span className={adminLabelClasses(scheme)}>Contact Phone</span>
          <input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} className={adminInputClasses(scheme)} />
        </label>
        <label className="space-y-2">
          <span className={adminLabelClasses(scheme)}>Business Type</span>
          <input value={form.businessType} onChange={(event) => setForm((current) => ({ ...current, businessType: event.target.value }))} className={adminInputClasses(scheme)} />
        </label>
        <label className="space-y-2">
          <span className={adminLabelClasses(scheme)}>Business Location</span>
          <input value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} className={adminInputClasses(scheme)} />
        </label>
        <label className="space-y-2">
          <span className={adminLabelClasses(scheme)}>Public Business Email</span>
          <input type="email" value={form.businessEmail} onChange={(event) => setForm((current) => ({ ...current, businessEmail: event.target.value }))} className={adminInputClasses(scheme)} />
        </label>
        <label className="space-y-2">
          <span className={adminLabelClasses(scheme)}>Package</span>
          <select
            value={form.packageId || packages.find((p) => p.packageName === form.packageName)?.id || ""}
            onChange={(event) => {
              const selectedId = event.target.value;
              const pkgObj = packages.find((p) => p.id === selectedId);
              setForm((current) => ({
                ...current,
                packageId: selectedId,
                packageName: pkgObj?.packageName || "",
              }));
            }}
            className={adminInputClasses(scheme)}
          >
            <option value="">No package</option>
            {packages.map((pkg) => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.packageName} ({pkg.priceDisplay})
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className={adminLabelClasses(scheme)}>Status</span>
          <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as AdminClientStatus }))} className={adminInputClasses(scheme)}>
            {statusOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>
        <label className="space-y-2 sm:col-span-2">
          <span className={adminLabelClasses(scheme)}>Business Address</span>
          <textarea value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} className={adminTextareaClasses(scheme)} />
        </label>
      </div>
      {fieldError || error ? (
        <p className="mt-4 text-sm font-semibold text-rose-400">{fieldError || error}</p>
      ) : null}
    </AdminModal>
  );
}
