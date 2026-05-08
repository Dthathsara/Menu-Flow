import { AdminButton } from "../common/AdminButton";
import { AdminStatusBadge } from "../common/AdminStatusBadge";
import { AdminTable, type AdminTableColumn } from "../common/AdminTable";
import type { AdminScheme } from "../common/adminTypes";

export interface StaffUserRecord {
  id: string;
  name: string;
  email: string;
  role: "Super Admin" | "Admin" | "Support" | "Finance";
  lastLogin: string;
  status: "Active" | "Inactive";
}

interface UsersTableProps {
  scheme: AdminScheme;
  users: StaffUserRecord[];
  onEdit: (user: StaffUserRecord) => void;
  onDelete: (user: StaffUserRecord) => void;
}

export function UsersTable({ scheme, users, onEdit, onDelete }: UsersTableProps) {
  const columns: Array<AdminTableColumn<StaffUserRecord>> = [
    { key: "name", label: "NAME", render: (row) => row.name },
    { key: "email", label: "EMAIL", render: (row) => row.email },
    { key: "role", label: "ROLE", render: (row) => row.role },
    { key: "lastLogin", label: "LAST LOGIN", render: (row) => row.lastLogin },
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

  return <AdminTable scheme={scheme} columns={columns} data={users} getRowKey={(row) => row.id} />;
}

