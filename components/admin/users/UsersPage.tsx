"use client";

import { useEffect, useMemo, useState } from "react";
import { getStoredAuthUser } from "@/lib/auth-session";
import { getApiErrorMessage } from "@/lib/error-handler";
import {
  type CreateSystemStaffUserInput,
  type SystemStaffUser,
  type UpdateSystemStaffUserInput,
  createSystemStaffUser,
  deleteSystemStaffUser,
  formatSystemStaffRole,
  getSystemStaffUsers,
  updateSystemStaffUser,
} from "@/lib/system-admin-api";
import { AdminButton } from "../common/AdminButton";
import { adminMutedClasses, adminPageClasses, adminTableShellClasses } from "../common/adminStyles";
import type { AdminModalMode, AdminPageProps } from "../common/adminTypes";
import { UserModal } from "./UserModal";
import { UsersTable } from "./UsersTable";

export function UsersPage({ scheme, searchQuery }: AdminPageProps) {
  const [users, setUsers] = useState<SystemStaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [modalMode, setModalMode] = useState<AdminModalMode>("add");
  const [selectedUser, setSelectedUser] = useState<SystemStaffUser | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalError, setModalError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const currentUserId = getStoredAuthUser()?.id ?? "";

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    if (!normalizedSearch) {
      return users;
    }

    return users.filter((user) =>
      [
        user.fullName,
        user.email,
        user.role,
        formatSystemStaffRole(user.role),
        user.lastLogin,
        user.status,
        user.createdAt,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [searchQuery, users]);

  async function loadUsers() {
    setLoading(true);
    setError("");

    try {
      setUsers(await getSystemStaffUsers());
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, "Unable to load system staff users."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  function openModal(mode: AdminModalMode, user: SystemStaffUser | null = null) {
    setModalMode(mode);
    setSelectedUser(user);
    setModalError("");
    setSuccessMessage("");
    setModalOpen(true);
  }

  async function handleSave(userId: string | null, values: CreateSystemStaffUserInput | UpdateSystemStaffUserInput) {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setModalError("");

    try {
      if (userId) {
        const updated = await updateSystemStaffUser(userId, values as UpdateSystemStaffUserInput);
        if (updated) {
          setUsers((current) => current.map((user) => user.id === userId ? updated : user));
        }
        setSuccessMessage("System staff user updated successfully.");
      } else {
        const created = await createSystemStaffUser(values as CreateSystemStaffUserInput);
        if (created) {
          setUsers((current) => [created, ...current.filter((user) => user.id !== created.id)]);
        }
        setSuccessMessage("System staff user created successfully.");
      }

      await loadUsers();
      setModalOpen(false);
      setSelectedUser(null);
    } catch (saveError) {
      setModalError(getApiErrorMessage(saveError, "Unable to save system staff user."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (submitting) {
      return;
    }

    if (id === currentUserId) {
      setModalError("You cannot delete the currently authenticated account.");
      return;
    }

    setSubmitting(true);
    setModalError("");

    try {
      await deleteSystemStaffUser(id);
      setUsers((current) => current.filter((user) => user.id !== id));
      setSuccessMessage("System staff user deleted successfully.");
      setModalOpen(false);
      setSelectedUser(null);
      await loadUsers();
    } catch (deleteError) {
      setModalError(getApiErrorMessage(deleteError, "Unable to delete system staff user."));
    } finally {
      setSubmitting(false);
    }
  }

  const emptyText = searchQuery.trim()
    ? "No system staff users match your search."
    : "No system staff users were returned by the backend.";

  return (
    <section className={adminPageClasses()}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold">System Staff Users</h2>
          {successMessage ? <p className="mt-2 text-sm font-semibold text-emerald-400">{successMessage}</p> : null}
        </div>
        <AdminButton scheme={scheme} variant="primary" onClick={() => openModal("add")}>+ Add User</AdminButton>
      </div>

      {error ? (
        <div className={adminTableShellClasses(scheme)}>
          <p className="text-sm font-semibold text-rose-400">{error}</p>
          <AdminButton scheme={scheme} className="mt-4" onClick={() => void loadUsers()}>Retry</AdminButton>
        </div>
      ) : (
        <div className={adminTableShellClasses(scheme)}>
          {loading ? (
            <p className={adminMutedClasses(scheme)}>Loading system staff users...</p>
          ) : (
            <UsersTable
              scheme={scheme}
              users={filteredUsers}
              emptyText={emptyText}
              onEdit={(user) => openModal("edit", user)}
              onDelete={(user) => openModal("delete", user)}
            />
          )}
        </div>
      )}

      <UserModal
        key={`${modalMode}-${selectedUser?.id ?? "new"}-${modalOpen}`}
        scheme={scheme}
        mode={modalMode}
        user={selectedUser}
        currentUserId={currentUserId}
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
