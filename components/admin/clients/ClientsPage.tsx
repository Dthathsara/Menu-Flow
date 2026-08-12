"use client";

import { useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "@/lib/error-handler";
import {
  type AdminClient,
  type CreateAdminClientInput,
  type UpdateAdminClientInput,
  createAdminClient,
  deleteAdminClient,
  getAdminClients,
  updateAdminClient,
} from "@/lib/system-admin-api";
import { AdminButton } from "../common/AdminButton";
import { adminMutedClasses, adminPageClasses, adminTableShellClasses } from "../common/adminStyles";
import type { AdminModalMode, AdminPageProps } from "../common/adminTypes";
import { ClientModal } from "./ClientModal";
import { ClientTable } from "./ClientTable";

export function ClientsPage({ scheme, searchQuery }: AdminPageProps) {
  const [clients, setClients] = useState<AdminClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [modalMode, setModalMode] = useState<AdminModalMode>("add");
  const [selectedClient, setSelectedClient] = useState<AdminClient | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalError, setModalError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const filteredClients = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    if (!normalizedSearch) {
      return clients;
    }

    return clients.filter((client) =>
      [
        client.restaurantName,
        client.ownerName,
        client.loginEmail,
        client.businessEmail,
        client.location,
        client.packageName,
        client.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [clients, searchQuery]);

  async function loadClients() {
    setLoading(true);
    setError("");

    try {
      setClients(await getAdminClients());
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, "Unable to load clients."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadClients();
  }, []);

  function openModal(mode: AdminModalMode, client: AdminClient | null = null) {
    setModalMode(mode);
    setSelectedClient(client);
    setModalError("");
    setSuccessMessage("");
    setModalOpen(true);
  }

  async function handleSave(clientId: string | null, values: CreateAdminClientInput | UpdateAdminClientInput) {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setModalError("");

    try {
      if (clientId) {
        const updated = await updateAdminClient(clientId, values as UpdateAdminClientInput);
        if (updated) {
          setClients((current) => current.map((client) => client.id === clientId ? updated : client));
        }
        setSuccessMessage("Client updated successfully.");
      } else {
        const created = await createAdminClient(values as CreateAdminClientInput);
        if (created) {
          setClients((current) => [created, ...current.filter((client) => client.id !== created.id)]);
        }
        setSuccessMessage("Client created successfully.");
      }

      await loadClients();
      setModalOpen(false);
      setSelectedClient(null);
    } catch (saveError) {
      setModalError(getApiErrorMessage(saveError, "Unable to save client."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setModalError("");

    try {
      await deleteAdminClient(id);
      setClients((current) => current.filter((client) => client.id !== id));
      setSuccessMessage("Client deleted successfully.");
      setModalOpen(false);
      setSelectedClient(null);
      await loadClients();
    } catch (deleteError) {
      setModalError(getApiErrorMessage(deleteError, "Unable to delete client."));
    } finally {
      setSubmitting(false);
    }
  }

  const emptyText = searchQuery.trim()
    ? "No clients match your search."
    : "No restaurant client accounts were returned by the backend.";

  return (
    <section className={adminPageClasses()}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold">Clients</h2>
          {successMessage ? <p className="mt-2 text-sm font-semibold text-emerald-400">{successMessage}</p> : null}
        </div>
        <AdminButton scheme={scheme} variant="primary" onClick={() => openModal("add")}>+ Add Client</AdminButton>
      </div>

      {error ? (
        <div className={adminTableShellClasses(scheme)}>
          <p className="text-sm font-semibold text-rose-400">{error}</p>
          <AdminButton scheme={scheme} className="mt-4" onClick={() => void loadClients()}>Retry</AdminButton>
        </div>
      ) : (
        <div className={adminTableShellClasses(scheme)}>
          {loading ? (
            <p className={adminMutedClasses(scheme)}>Loading clients...</p>
          ) : (
            <ClientTable
              scheme={scheme}
              clients={filteredClients}
              emptyText={emptyText}
              onEdit={(client) => openModal("edit", client)}
              onDelete={(client) => openModal("delete", client)}
            />
          )}
        </div>
      )}

      <ClientModal
        key={`${modalMode}-${selectedClient?.id ?? "new"}-${modalOpen}`}
        scheme={scheme}
        mode={modalMode}
        client={selectedClient}
        open={modalOpen}
        submitting={submitting}
        error={modalError}
        onClose={() => !submitting && setModalOpen(false)}
        onSave={handleSave}
        onConfirmDelete={handleDelete}
      />
    </section>
  );
}
