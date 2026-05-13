"use client";

import { useMemo, useState } from "react";
import { AdminButton } from "../common/AdminButton";
import { adminPageClasses, adminTableShellClasses } from "../common/adminStyles";
import type { AdminModalMode, AdminPageProps } from "../common/adminTypes";
import { UserModal } from "./UserModal";
import { UsersTable, type StaffUserRecord } from "./UsersTable";

const initialUsers: StaffUserRecord[] = [
  { id: "su-1", name: "Dulnith Thathsara", email: "dragon6@gmail.com", role: "Super Admin", lastLogin: "Today 10:20 AM", status: "Active" },
  { id: "su-2", name: "Kasun Admin", email: "kasun@menuflow.lk", role: "Admin", lastLogin: "Yesterday", status: "Active" },
  { id: "su-3", name: "Support Agent", email: "support@menuflow.lk", role: "Support", lastLogin: "May 05, 2026", status: "Active" },
  { id: "su-4", name: "Finance User", email: "finance@menuflow.lk", role: "Finance", lastLogin: "May 03, 2026", status: "Inactive" },
];

export function UsersPage({ scheme, searchQuery }: AdminPageProps) {
  const [users, setUsers] = useState<StaffUserRecord[]>(initialUsers);
  const [modalMode, setModalMode] = useState<AdminModalMode>("add");
  const [selectedUser, setSelectedUser] = useState<StaffUserRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const filteredUsers = useMemo(() => users.filter((user) => Object.values(user).join(" ").toLowerCase().includes(searchQuery.toLowerCase())), [users, searchQuery]);

  function openModal(mode: AdminModalMode, user: StaffUserRecord | null = null) {
    setModalMode(mode);
    setSelectedUser(user);
    setModalOpen(true);
  }

  function handleSave(user: StaffUserRecord) {
    setUsers((current) => current.some((item) => item.id === user.id) ? current.map((item) => item.id === user.id ? user : item) : [user, ...current]);
    setModalOpen(false);
  }

  return (
    <section className={adminPageClasses()}>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-extrabold">System Staff Users</h2>
        <AdminButton scheme={scheme} variant="primary" onClick={() => openModal("add")}>+ Add User</AdminButton>
      </div>
      <div className={adminTableShellClasses(scheme)}>
        <UsersTable scheme={scheme} users={filteredUsers} onEdit={(user) => openModal("edit", user)} onDelete={(user) => openModal("delete", user)} />
      </div>
      <UserModal key={`${modalMode}-${selectedUser?.id ?? "new"}-${modalOpen}`} scheme={scheme} mode={modalMode} user={selectedUser} open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} onConfirmDelete={(id) => { setUsers((current) => current.filter((user) => user.id !== id)); setModalOpen(false); }} />
    </section>
  );
}
