"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminButton } from "../common/AdminButton";
import { adminPageClasses, adminTableShellClasses } from "../common/adminStyles";
import type { AdminModalMode, AdminPageProps } from "../common/adminTypes";
import { PackageModal } from "./PackageModal";
import { PackagesTable, type PackageRecord } from "./PackagesTable";

const initialPackages: PackageRecord[] = [
  { id: "pkg-1", packageName: "Starter", price: "Rs. 4,500 / month", clients: 28, features: "Digital menu, QR ordering, 1 branch", status: "Active" },
  { id: "pkg-2", packageName: "Business", price: "Rs. 8,500 / month", clients: 34, features: "All Starter features, analytics, 3 branches", status: "Active" },
  { id: "pkg-3", packageName: "Pro", price: "Rs. 14,500 / month", clients: 42, features: "Kitchen screen, reports, staff controls", status: "Active" },
  { id: "pkg-4", packageName: "Enterprise", price: "Custom price", clients: 24, features: "Multi-branch, priority support, custom modules", status: "Active" },
];

export function PackagesPage({ scheme, searchQuery }: AdminPageProps) {
  const [packages, setPackages] = useState<PackageRecord[]>(initialPackages);
  const [modalMode, setModalMode] = useState<AdminModalMode>("add");
  const [selectedPackage, setSelectedPackage] = useState<PackageRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const filteredPackages = useMemo(() => packages.filter((item) => Object.values(item).join(" ").toLowerCase().includes(searchQuery.toLowerCase())), [packages, searchQuery]);

  function openModal(mode: AdminModalMode, item: PackageRecord | null = null) {
    setModalMode(mode);
    setSelectedPackage(item);
    setModalOpen(true);
  }

  useEffect(() => {
    const handler = () => openModal("add");
    window.addEventListener("menuflow-admin:add-package", handler);
    return () => window.removeEventListener("menuflow-admin:add-package", handler);
  }, []);

  function handleSave(item: PackageRecord) {
    setPackages((current) => current.some((record) => record.id === item.id) ? current.map((record) => record.id === item.id ? item : record) : [item, ...current]);
    setModalOpen(false);
  }

  return (
    <section className={adminPageClasses()}>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-extrabold">Packages</h2>
        <AdminButton scheme={scheme} variant="primary" onClick={() => openModal("add")}>+ Add Package</AdminButton>
      </div>
      <div className={adminTableShellClasses(scheme)}>
        <PackagesTable scheme={scheme} packages={filteredPackages} onEdit={(item) => openModal("edit", item)} onDelete={(item) => openModal("delete", item)} />
      </div>
      <PackageModal key={`${modalMode}-${selectedPackage?.id ?? "new"}-${modalOpen}`} scheme={scheme} mode={modalMode} packageItem={selectedPackage} open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} onConfirmDelete={(id) => { setPackages((current) => current.filter((item) => item.id !== id)); setModalOpen(false); }} />
    </section>
  );
}
