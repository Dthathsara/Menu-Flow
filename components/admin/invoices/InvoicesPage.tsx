"use client";

import { useMemo, useState } from "react";
import { createAdminInvoice, deleteAdminInvoice, updateAdminInvoice } from "@/lib/admin-invoices-api";
import { AdminButton } from "../common/AdminButton";
import { AdminStatCard } from "../common/AdminStatCard";
import { adminPageClasses, adminTableShellClasses } from "../common/adminStyles";
import type { AdminModalMode, AdminPageProps } from "../common/adminTypes";
import { calculateInvoiceStats, filterAdminInvoices, filterInvoices, formatFullCurrency } from "./invoice.helpers";
import { InvoiceModal } from "./InvoiceModal";
import { InvoicesTable } from "./InvoicesTable";
import type {
  AdminInvoice,
  CreateAdminInvoicePayload,
  UpdateAdminInvoicePayload,
} from "./invoice.types";
import { useInvoices } from "./useInvoices";

export function InvoicesPage({ scheme, searchQuery }: AdminPageProps) {
  const { invoices, stats, clients, isLoading, error, loadData } = useInvoices();

  const [modalMode, setModalMode] = useState<AdminModalMode>("add");
  const [selectedInvoice, setSelectedInvoice] = useState<AdminInvoice | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState("");

  const effectiveSearch = searchQuery || localSearch;

  const filteredInvoices = useMemo(
    () => filterAdminInvoices(invoices, effectiveSearch),
    [invoices, effectiveSearch],
  );

  function openModal(mode: AdminModalMode, invoice: AdminInvoice | null = null) {
    setModalMode(mode);
    setSelectedInvoice(invoice);
    setModalOpen(true);
  }

  async function handleSaveInvoice(
    payload: CreateAdminInvoicePayload | UpdateAdminInvoicePayload,
  ) {
    if (modalMode === "edit" && selectedInvoice) {
      await updateAdminInvoice(selectedInvoice.id, payload as UpdateAdminInvoicePayload);
    } else {
      await createAdminInvoice(payload as CreateAdminInvoicePayload);
    }
    await loadData();
  }

  async function handleDeleteInvoice(id: string) {
    await deleteAdminInvoice(id);
    await loadData();
  }

  return (
    <section className={adminPageClasses()}>
      {/* Breadcrumb Header */}
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-60">
        <span>Admin Dashboard</span>
        <span>/</span>
        <span className="text-current font-bold">Invoices</span>
      </div>

      {/* Summary Stat Cards Grid */}
      <section className="grid gap-5 xl:grid-cols-3">
        <AdminStatCard
          scheme={scheme}
          title="Total Invoice Value"
          value={formatFullCurrency(stats.monthlyTotalAmount)}
          note="This month"
        />
        <AdminStatCard
          scheme={scheme}
          title="Paid"
          value={formatFullCurrency(stats.totalPaidAmount)}
          note={`${stats.totalPaidCount} ${stats.totalPaidCount === 1 ? "invoice" : "invoices"}`}
        />
        <AdminStatCard
          scheme={scheme}
          title="Pending"
          value={formatFullCurrency(stats.totalPendingAmount)}
          note={`${stats.totalPendingCount} ${stats.totalPendingCount === 1 ? "invoice" : "invoices"}`}
        />
      </section>

      {/* Error Banner with Retry */}
      {error ? (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-rose-500/40 bg-rose-500/15 p-4 text-sm font-semibold text-rose-300">
          <div className="flex items-center gap-3">
            <span className="text-base">⚠️</span>
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => void loadData()}
            className="rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-bold text-white shadow transition hover:bg-rose-500 active:scale-95"
          >
            Retry
          </button>
        </div>
      ) : null}

      {/* Header and Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <h2 className="text-2xl font-extrabold tracking-tight">Invoices</h2>
          {!searchQuery ? (
            <input
              type="search"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Filter invoices..."
              className="w-full rounded-xl border border-slate-700/50 bg-slate-800/40 px-3.5 py-1.5 text-xs text-current outline-none transition focus:border-blue-500"
            />
          ) : null}
        </div>
        <AdminButton scheme={scheme} variant="primary" onClick={() => openModal("add")}>
          + Add Invoice
        </AdminButton>
      </div>

      {/* Table Shell */}
      <div className={adminTableShellClasses(scheme)}>
        <InvoicesTable
          scheme={scheme}
          invoices={filteredInvoices}
          isLoading={isLoading}
          onEdit={(invoice) => openModal("edit", invoice)}
          onDelete={(invoice) => openModal("delete", invoice)}
        />
      </div>

      {/* Add / Edit / Delete Modal */}
      <InvoiceModal
        key={`${modalMode}-${selectedInvoice?.id ?? "new"}-${modalOpen}`}
        scheme={scheme}
        mode={modalMode}
        invoice={selectedInvoice}
        clients={clients}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveInvoice}
        onConfirmDelete={handleDeleteInvoice}
      />
    </section>
  );
}
