"use client";

import { useMemo, useState } from "react";
import { AdminButton } from "../common/AdminButton";
import { AdminStatCard } from "../common/AdminStatCard";
import { adminPageClasses, adminTableShellClasses } from "../common/adminStyles";
import type { AdminModalMode, AdminPageProps } from "../common/adminTypes";
import { InvoiceModal } from "./InvoiceModal";
import { InvoicesTable, type InvoiceRecord } from "./InvoicesTable";

const initialInvoices: InvoiceRecord[] = [
  { id: "inv-1", invoiceId: "INV-2026-001", client: "Ocean Pearl Hotel", amount: "Rs. 48,500", dueDate: "2026-05-18", status: "Paid" },
  { id: "inv-2", invoiceId: "INV-2026-002", client: "Cafe Noir", amount: "Rs. 14,500", dueDate: "2026-05-20", status: "Pending" },
  { id: "inv-3", invoiceId: "INV-2026-003", client: "Spice Garden", amount: "Rs. 8,500", dueDate: "2026-05-21", status: "Pending" },
  { id: "inv-4", invoiceId: "INV-2026-004", client: "Lake View Resort", amount: "Rs. 62,000", dueDate: "2026-05-25", status: "Overdue" },
];

export function InvoicesPage({ scheme, searchQuery }: AdminPageProps) {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(initialInvoices);
  const [modalMode, setModalMode] = useState<AdminModalMode>("add");
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const filteredInvoices = useMemo(() => invoices.filter((invoice) => Object.values(invoice).join(" ").toLowerCase().includes(searchQuery.toLowerCase())), [invoices, searchQuery]);

  function openModal(mode: AdminModalMode, invoice: InvoiceRecord | null = null) {
    setModalMode(mode);
    setSelectedInvoice(invoice);
    setModalOpen(true);
  }

  function handleSave(invoice: InvoiceRecord) {
    setInvoices((current) => current.some((item) => item.id === invoice.id) ? current.map((item) => item.id === invoice.id ? invoice : item) : [invoice, ...current]);
    setModalOpen(false);
  }

  return (
    <section className={adminPageClasses()}>
      <section className="grid gap-5 xl:grid-cols-3">
        <AdminStatCard scheme={scheme} title="Total Invoice Value" value="Rs. 2.4M" note="This month" />
        <AdminStatCard scheme={scheme} title="Paid" value="Rs. 1.9M" note="82 invoices" />
        <AdminStatCard scheme={scheme} title="Pending" value="Rs. 214K" note="17 invoices" />
      </section>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-extrabold">Invoices</h2>
        <AdminButton scheme={scheme} variant="primary" onClick={() => openModal("add")}>+ Add Invoice</AdminButton>
      </div>
      <div className={adminTableShellClasses(scheme)}>
        <InvoicesTable scheme={scheme} invoices={filteredInvoices} onEdit={(invoice) => openModal("edit", invoice)} onDelete={(invoice) => openModal("delete", invoice)} />
      </div>
      <InvoiceModal key={`${modalMode}-${selectedInvoice?.id ?? "new"}-${modalOpen}`} scheme={scheme} mode={modalMode} invoice={selectedInvoice} open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} onConfirmDelete={(id) => { setInvoices((current) => current.filter((invoice) => invoice.id !== id)); setModalOpen(false); }} />
    </section>
  );
}
