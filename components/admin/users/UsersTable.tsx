import { AdminButton } from "../common/AdminButton";
import { AdminStatusBadge } from "../common/AdminStatusBadge";
import { AdminTable, type AdminTableColumn } from "../common/AdminTable";
import type { AdminScheme } from "../common/adminTypes";
import { formatSystemStaffRole, type SystemStaffUser } from "@/lib/system-admin-api";

interface UsersTableProps {
  scheme: AdminScheme;
  users: SystemStaffUser[];
  onEdit: (user: SystemStaffUser) => void;
  onDelete: (user: SystemStaffUser) => void;
  emptyText?: string;
}

export function UsersTable({ scheme, users, onEdit, onDelete, emptyText }: UsersTableProps) {
  const columns: Array<AdminTableColumn<SystemStaffUser>> = [
    { key: "fullName", label: "NAME", render: (row) => row.fullName || "Unavailable" },
    { key: "email", label: "EMAIL", render: (row) => row.email },
    { key: "role", label: "ROLE", render: (row) => formatSystemStaffRole(row.role) },
    { key: "lastLogin", label: "LAST LOGIN", render: (row) => row.lastLogin },
    { key: "createdAt", label: "CREATED", render: (row) => row.createdAt || "Unavailable" },
    { key: "status", label: "STATUS", render: (row) => <AdminStatusBadge scheme={scheme} status={row.status} /> },
    {
      key: "actions",
      label: "ACTIONS",
      render: (row) => (
        <div className="flex gap-2">
          <AdminButton scheme={scheme} variant="table" onClick={() => onEdit(row)}>Edit</AdminButton>
          <AdminButton scheme={scheme} variant="danger" onClick={() => onDelete(row)}>Delete</AdminButton>
        </div>
      ),
    },
  ];

  return <AdminTable scheme={scheme} columns={columns} data={users} getRowKey={(row) => row.id} emptyText={emptyText} />;
}
