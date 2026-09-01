"use client";

import { useEffect, useState } from "react";
import { getApiErrorMessage } from "@/lib/error-handler";
import { AdminButton } from "../common/AdminButton";
import { AdminModal } from "../common/AdminModal";
import { adminInputClasses, adminLabelClasses, adminMutedClasses, adminTextareaClasses } from "../common/adminStyles";
import type { AdminModalMode, AdminScheme } from "../common/adminTypes";
import type { CreateAdminPackageInput, SystemAdminPackage, UpdateAdminPackageInput } from "@/lib/system-admin-api";

interface PackageModalProps {
  scheme: AdminScheme;
  mode: AdminModalMode;
  packageItem: SystemAdminPackage | null;
  open: boolean;
  onClose: () => void;
  onSave: (input: CreateAdminPackageInput | UpdateAdminPackageInput, packageId?: string) => Promise<void>;
  onConfirmDelete: (id: string) => Promise<void>;
}

export function PackageModal({
  scheme,
  mode,
  packageItem,
  open,
  onClose,
  onSave,
  onConfirmDelete,
}: PackageModalProps) {
  const [packageName, setPackageName] = useState("");
  const [packageCode, setPackageCode] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isCustomPrice, setIsCustomPrice] = useState(false);
  const [taxService, setTaxService] = useState("0");
  const [discount, setDiscount] = useState("0");
  const [billingCycle, setBillingCycle] = useState("Monthly");
  const [locationUnlimited, setLocationUnlimited] = useState(true);
  const [locationLimit, setLocationLimit] = useState("");
  const [tableUnlimited, setTableUnlimited] = useState(true);
  const [qrTableLimit, setQrTableLimit] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");
  const [featuresText, setFeaturesText] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [codeManuallyEdited, setCodeManuallyEdited] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (packageItem && mode === "edit") {
      setPackageName(packageItem.packageName || "");
      setPackageCode(packageItem.packageCode || "");
      setDescription(packageItem.description || "");
      setPrice(packageItem.price !== null && packageItem.price !== undefined ? String(packageItem.price) : "");
      setIsCustomPrice(packageItem.isCustomPrice ?? false);
      setTaxService(String(packageItem.taxService ?? 0));
      setDiscount(String(packageItem.discount ?? 0));
      setBillingCycle(packageItem.billingCycle || "Monthly");
      setLocationUnlimited(packageItem.locationLimit === null || packageItem.locationLimit === undefined);
      setLocationLimit(packageItem.locationLimit ? String(packageItem.locationLimit) : "");
      setTableUnlimited(packageItem.qrTableLimit === null || packageItem.qrTableLimit === undefined);
      setQrTableLimit(packageItem.qrTableLimit ? String(packageItem.qrTableLimit) : "");
      setStatus(packageItem.status || "Active");
      setFeaturesText(packageItem.features ? packageItem.features.join("\n") : "");
      setSortOrder(String(packageItem.sortOrder ?? 0));
      setCodeManuallyEdited(true);
    } else {
      setPackageName("");
      setPackageCode("");
      setDescription("");
      setPrice("");
      setIsCustomPrice(false);
      setTaxService("0");
      setDiscount("0");
      setBillingCycle("Monthly");
      setLocationUnlimited(true);
      setLocationLimit("");
      setTableUnlimited(true);
      setQrTableLimit("");
      setStatus("Active");
      setFeaturesText("");
      setSortOrder("0");
      setCodeManuallyEdited(false);
    }
    setValidationError("");
    setIsSaving(false);
  }, [packageItem, mode, open]);

  function handleNameChange(name: string) {
    setPackageName(name);
    if (!codeManuallyEdited) {
      const generated = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      setPackageCode(generated);
    }
  }

  function validateForm() {
    if (!packageName.trim()) {
      return "Package Name is required.";
    }

    if (!isCustomPrice) {
      const numericPrice = Number(price.trim());
      if (price.trim() === "" || !Number.isFinite(numericPrice) || numericPrice < 0) {
        return "Price must be a valid positive number for non-custom packages.";
      }
    }

    const numericTax = Number(taxService.trim());
    if (taxService.trim() !== "" && (!Number.isFinite(numericTax) || numericTax < 0)) {
      return "Tax / Service Amount must be a valid non-negative number.";
    }

    const numericDiscount = Number(discount.trim());
    if (discount.trim() !== "" && (!Number.isFinite(numericDiscount) || numericDiscount < 0)) {
      return "Discount Amount must be a valid non-negative number.";
    }

    if (!locationUnlimited && locationLimit.trim() !== "") {
      const parsedLoc = Number(locationLimit.trim());
      if (!Number.isInteger(parsedLoc) || parsedLoc <= 0) {
        return "Location Limit must be a positive integer or set to Unlimited.";
      }
    }

    if (!tableUnlimited && qrTableLimit.trim() !== "") {
      const parsedTables = Number(qrTableLimit.trim());
      if (!Number.isInteger(parsedTables) || parsedTables <= 0) {
        return "QR/Table Limit must be a positive integer or set to Unlimited.";
      }
    }

    return "";
  }

  async function handleSaveClick() {
    const error = validateForm();
    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError("");
    setIsSaving(true);

    try {
      const features = featuresText
        .split(/[\n,]/)
        .map((f) => f.trim())
        .filter(Boolean);

      const payload: CreateAdminPackageInput = {
        packageName: packageName.trim(),
        packageCode: packageCode.trim() || packageName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: description.trim(),
        price: isCustomPrice ? null : Number(price.trim()) || 0,
        isCustomPrice,
        taxService: Number(taxService.trim()) || 0,
        discount: Number(discount.trim()) || 0,
        billingCycle,
        locationLimit: locationUnlimited ? null : Number(locationLimit.trim()) || null,
        qrTableLimit: tableUnlimited ? null : Number(qrTableLimit.trim()) || null,
        status,
        features,
        sortOrder: Number(sortOrder.trim()) || 0,
      };

      await onSave(payload, mode === "edit" ? packageItem?.id : undefined);
    } catch (err) {
      setValidationError(getApiErrorMessage(err, "Failed to save package details."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteClick() {
    if (!packageItem) return;
    setIsSaving(true);
    setValidationError("");
    try {
      await onConfirmDelete(packageItem.id);
    } catch (err) {
      setValidationError(getApiErrorMessage(err, "Failed to archive package."));
    } finally {
      setIsSaving(false);
    }
  }

  if (mode === "delete") {
    return (
      <AdminModal
        open={open}
        scheme={scheme}
        title="Delete Package"
        size="sm"
        onClose={onClose}
        footer={
          <>
            <AdminButton scheme={scheme} onClick={onClose} disabled={isSaving}>
              Cancel
            </AdminButton>
            <AdminButton scheme={scheme} variant="danger" onClick={() => void handleDeleteClick()} disabled={isSaving}>
              {isSaving ? "Deleting..." : "Delete"}
            </AdminButton>
          </>
        }
      >
        {validationError ? (
          <div className="mb-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-300">
            {validationError}
          </div>
        ) : null}
        <p className={adminMutedClasses(scheme)}>
          Are you sure you want to archive this package? Existing invoice history will not be removed.
        </p>
      </AdminModal>
    );
  }

  return (
    <AdminModal
      open={open}
      scheme={scheme}
      title={mode === "edit" ? "Update Package Details" : "Add Package Details"}
      size="lg"
      onClose={onClose}
      footer={
        <>
          <AdminButton scheme={scheme} onClick={onClose} disabled={isSaving}>
            Cancel
          </AdminButton>
          <AdminButton scheme={scheme} variant="primary" onClick={() => void handleSaveClick()} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Package"}
          </AdminButton>
        </>
      }
    >
      {validationError ? (
        <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-300">
          {validationError}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className={adminLabelClasses(scheme)}>Package Name *</span>
          <input
            value={packageName}
            onChange={(event) => handleNameChange(event.target.value)}
            placeholder="e.g. Starter, Business"
            className={adminInputClasses(scheme)}
            disabled={isSaving}
          />
        </label>

        <label className="space-y-1.5">
          <span className={adminLabelClasses(scheme)}>Package Code</span>
          <input
            value={packageCode}
            onChange={(event) => {
              setPackageCode(event.target.value);
              setCodeManuallyEdited(true);
            }}
            placeholder="e.g. starter-plan"
            className={adminInputClasses(scheme)}
            disabled={isSaving}
          />
        </label>

        <label className="space-y-1.5 sm:col-span-2">
          <span className={adminLabelClasses(scheme)}>Description</span>
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Brief package summary for clients"
            className={adminInputClasses(scheme)}
            disabled={isSaving}
          />
        </label>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className={adminLabelClasses(scheme)}>Price (LKR) *</span>
            <label className="flex items-center gap-1.5 text-xs text-slate-400">
              <input
                type="checkbox"
                checked={isCustomPrice}
                onChange={(event) => setIsCustomPrice(event.target.checked)}
                className="rounded border-slate-700 bg-slate-800"
                disabled={isSaving}
              />
              <span>Custom Price</span>
            </label>
          </div>
          <input
            type="number"
            value={isCustomPrice ? "" : price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder={isCustomPrice ? "Custom Quote" : "8500"}
            disabled={isCustomPrice || isSaving}
            className={adminInputClasses(scheme)}
          />
        </div>

        <label className="space-y-1.5">
          <span className={adminLabelClasses(scheme)}>Billing Cycle</span>
          <select
            value={billingCycle}
            onChange={(event) => setBillingCycle(event.target.value)}
            className={adminInputClasses(scheme)}
            disabled={isSaving}
          >
            <option value="Monthly">Monthly</option>
            <option value="Yearly">Yearly</option>
            <option value="Custom">Custom</option>
          </select>
        </label>

        <label className="space-y-1.5">
          <span className={adminLabelClasses(scheme)}>Tax / Service Amount (LKR)</span>
          <input
            type="number"
            value={taxService}
            onChange={(event) => setTaxService(event.target.value)}
            placeholder="0"
            className={adminInputClasses(scheme)}
            disabled={isSaving}
          />
        </label>

        <label className="space-y-1.5">
          <span className={adminLabelClasses(scheme)}>Discount Amount (LKR)</span>
          <input
            type="number"
            value={discount}
            onChange={(event) => setDiscount(event.target.value)}
            placeholder="0"
            className={adminInputClasses(scheme)}
            disabled={isSaving}
          />
        </label>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className={adminLabelClasses(scheme)}>Location Limit</span>
            <label className="flex items-center gap-1.5 text-xs text-slate-400">
              <input
                type="checkbox"
                checked={locationUnlimited}
                onChange={(event) => setLocationUnlimited(event.target.checked)}
                className="rounded border-slate-700 bg-slate-800"
                disabled={isSaving}
              />
              <span>Unlimited</span>
            </label>
          </div>
          <input
            type="number"
            value={locationUnlimited ? "" : locationLimit}
            onChange={(event) => setLocationLimit(event.target.value)}
            placeholder={locationUnlimited ? "Unlimited" : "3"}
            disabled={locationUnlimited || isSaving}
            className={adminInputClasses(scheme)}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className={adminLabelClasses(scheme)}>QR / Table Limit</span>
            <label className="flex items-center gap-1.5 text-xs text-slate-400">
              <input
                type="checkbox"
                checked={tableUnlimited}
                onChange={(event) => setTableUnlimited(event.target.checked)}
                className="rounded border-slate-700 bg-slate-800"
                disabled={isSaving}
              />
              <span>Unlimited</span>
            </label>
          </div>
          <input
            type="number"
            value={tableUnlimited ? "" : qrTableLimit}
            onChange={(event) => setQrTableLimit(event.target.value)}
            placeholder={tableUnlimited ? "Unlimited" : "25"}
            disabled={tableUnlimited || isSaving}
            className={adminInputClasses(scheme)}
          />
        </div>

        <label className="space-y-1.5">
          <span className={adminLabelClasses(scheme)}>Status</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as "Active" | "Inactive")}
            className={adminInputClasses(scheme)}
            disabled={isSaving}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </label>

        <label className="space-y-1.5">
          <span className={adminLabelClasses(scheme)}>Sort Order</span>
          <input
            type="number"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            placeholder="0"
            className={adminInputClasses(scheme)}
            disabled={isSaving}
          />
        </label>

        <label className="space-y-1.5 sm:col-span-2">
          <span className={adminLabelClasses(scheme)}>Features (One per line or comma-separated)</span>
          <textarea
            rows={3}
            placeholder="Digital menu&#10;QR ordering&#10;Analytics"
            value={featuresText}
            onChange={(event) => setFeaturesText(event.target.value)}
            className={adminTextareaClasses(scheme)}
            disabled={isSaving}
          />
        </label>
      </div>
    </AdminModal>
  );
}

