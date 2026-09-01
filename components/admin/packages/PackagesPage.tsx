"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "@/lib/error-handler";
import {
  createAdminPackage,
  deleteAdminPackage,
  getAdminPackages,
  updateAdminPackage,
  type CreateAdminPackageInput,
  type SystemAdminPackage,
  type UpdateAdminPackageInput,
} from "@/lib/system-admin-api";
import { AdminButton } from "../common/AdminButton";
import { adminPageClasses, adminTableShellClasses } from "../common/adminStyles";
import type { AdminModalMode, AdminPageProps } from "../common/adminTypes";
import { PackageModal } from "./PackageModal";
import { PackagesTable } from "./PackagesTable";

export function PackagesPage({ scheme, searchQuery }: AdminPageProps) {
  const [packages, setPackages] = useState<SystemAdminPackage[]>([]);
  const [modalMode, setModalMode] = useState<AdminModalMode>("add");
  const [selectedPackage, setSelectedPackage] = useState<SystemAdminPackage | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const loadPackages = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const data = await getAdminPackages();
      setPackages(data);
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, "Unable to load packages. Please check that the server is running."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPackages();
  }, [loadPackages]);

  function showToast(message: string) {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(""), 3000);
  }

  const filteredPackages = useMemo(() => {
    if (!searchQuery.trim()) return packages;
    const query = searchQuery.toLowerCase();
    return packages.filter(
      (item) =>
        item.packageName.toLowerCase().includes(query) ||
        item.packageCode.toLowerCase().includes(query) ||
        item.featuresSummary.toLowerCase().includes(query) ||
        item.priceDisplay.toLowerCase().includes(query) ||
        item.status.toLowerCase().includes(query),
    );
  }, [packages, searchQuery]);

  function openModal(mode: AdminModalMode, item: SystemAdminPackage | null = null) {
    setModalMode(mode);
    setSelectedPackage(item);
    setModalOpen(true);
  }

  useEffect(() => {
    const handler = () => openModal("add");
    window.addEventListener("menuflow-admin:add-package", handler);
    return () => window.removeEventListener("menuflow-admin:add-package", handler);
  }, []);

  async function handleSave(input: CreateAdminPackageInput | UpdateAdminPackageInput, packageId?: string) {
    if (packageId) {
      const updated = await updateAdminPackage(packageId, input as UpdateAdminPackageInput);
      setPackages((current) =>
        current.map((pkg) => (pkg.id === packageId ? updated ?? { ...pkg, ...input } : pkg)),
      );
      showToast("Package details updated successfully.");
    } else {
      const created = await createAdminPackage(input as CreateAdminPackageInput);
      if (created) {
        setPackages((current) => [created, ...current]);
      }
      showToast("Package created successfully.");
    }
    setModalOpen(false);
    await loadPackages();
  }

  async function handleDelete(id: string) {
    await deleteAdminPackage(id);
    setPackages((current) => current.filter((item) => item.id !== id));
    showToast("Package archived/deleted successfully.");
    setModalOpen(false);
    await loadPackages();
  }

  return (
    <section className={adminPageClasses()}>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-extrabold">Packages</h2>
        <AdminButton scheme={scheme} variant="primary" onClick={() => openModal("add")}>
          + Add Package
        </AdminButton>
      </div>

      {toastMessage ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300">
          {toastMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-300">
          {errorMessage}
          <button
            type="button"
            onClick={() => void loadPackages()}
            className="ml-4 underline underline-offset-4 cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : null}

      <div className={adminTableShellClasses(scheme)}>
        {isLoading ? (
          <div className="p-8 text-center text-sm font-medium text-slate-400">
            Loading packages...
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="p-8 text-center text-sm font-medium text-slate-400">
            No packages have been created yet.
          </div>
        ) : (
          <PackagesTable
            scheme={scheme}
            packages={filteredPackages}
            onEdit={(item) => openModal("edit", item)}
            onDelete={(item) => openModal("delete", item)}
          />
        )}
      </div>

      <PackageModal
        key={`${modalMode}-${selectedPackage?.id ?? "new"}-${modalOpen}`}
        scheme={scheme}
        mode={modalMode}
        packageItem={selectedPackage}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onConfirmDelete={handleDelete}
      />
    </section>
  );
}

