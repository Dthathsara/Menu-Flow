"use client";

import { useMemo, useState } from "react";
import { AdminButton } from "../common/AdminButton";
import { adminPageClasses, adminTableShellClasses } from "../common/adminStyles";
import type { AdminModalMode, AdminPageProps } from "../common/adminTypes";
import { ClientModal } from "./ClientModal";
import { ClientTable, type ClientRecord } from "./ClientTable";

const initialClients: ClientRecord[] = [
  { id: "cl-1", business: "Ocean Pearl Hotel", owner: "Nimal Perera", email: "owner@oceanpearl.lk", package: "Enterprise", status: "Active", notes: "Client business address and special notes" },
  { id: "cl-2", business: "Cafe Noir", owner: "Ayesha Fernando", email: "hello@cafenoir.lk", package: "Pro", status: "Active", notes: "Client business address and special notes" },
  { id: "cl-3", business: "Spice Garden", owner: "Ruwan Silva", email: "admin@spicegarden.lk", package: "Business", status: "Pending", notes: "Client business address and special notes" },
  { id: "cl-4", business: "Urban Bites", owner: "Kavindu Jay", email: "contact@urbanbites.lk", package: "Starter", status: "Active", notes: "Client business address and special notes" },
  { id: "cl-5", business: "Lake View Resort", owner: "Maya Senanayake", email: "info@lakeview.lk", package: "Enterprise", status: "Inactive", notes: "Client business address and special notes" },
];

export function ClientsPage({ scheme, searchQuery }: AdminPageProps) {
  const [clients, setClients] = useState<ClientRecord[]>(initialClients);
  const [modalMode, setModalMode] = useState<AdminModalMode>("add");
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const filteredClients = useMemo(() => clients.filter((client) => Object.values(client).join(" ").toLowerCase().includes(searchQuery.toLowerCase())), [clients, searchQuery]);

  function openModal(mode: AdminModalMode, client: ClientRecord | null = null) {
    setModalMode(mode);
    setSelectedClient(client);
    setModalOpen(true);
  }

  function handleSave(client: ClientRecord) {
    setClients((current) => current.some((item) => item.id === client.id) ? current.map((item) => item.id === client.id ? client : item) : [client, ...current]);
    setModalOpen(false);
  }

  return (
    <section className={adminPageClasses()}>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-extrabold">Clients</h2>
        <AdminButton scheme={scheme} variant="primary" onClick={() => openModal("add")}>+ Add Client</AdminButton>
      </div>
      <div className={adminTableShellClasses(scheme)}>
        <ClientTable scheme={scheme} clients={filteredClients} onEdit={(client) => openModal("edit", client)} onDelete={(client) => openModal("delete", client)} />
      </div>
      <ClientModal key={`${modalMode}-${selectedClient?.id ?? "new"}-${modalOpen}`} scheme={scheme} mode={modalMode} client={selectedClient} open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} onConfirmDelete={(id) => { setClients((current) => current.filter((client) => client.id !== id)); setModalOpen(false); }} />
    </section>
  );
}
