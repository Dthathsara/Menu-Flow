import { AdminButton } from "../common/AdminButton";
import { AdminStatusBadge } from "../common/AdminStatusBadge";
import { AdminTable, type AdminTableColumn } from "../common/AdminTable";
import type { AdminScheme } from "../common/adminTypes";
import type { AdminClient } from "@/lib/system-admin-api";

interface ClientTableProps {
  scheme: AdminScheme;
  clients: AdminClient[];
  onEdit: (client: AdminClient) => void;
  onDelete: (client: AdminClient) => void;
  emptyText?: string;
}

export function ClientTable({ scheme, clients, onEdit, onDelete, emptyText }: ClientTableProps) {
  const columns: Array<AdminTableColumn<AdminClient>> = [
    { key: "restaurantName", label: "BUSINESS", render: (row) => row.restaurantName || "Unavailable" },
    { key: "ownerName", label: "OWNER", render: (row) => row.ownerName || "Unavailable" },
    { key: "loginEmail", label: "LOGIN EMAIL", render: (row) => row.loginEmail || "Unavailable" },
    { key: "businessEmail", label: "BUSINESS EMAIL", render: (row) => row.businessEmail || "Unavailable" },
    { key: "location", label: "LOCATION", render: (row) => row.location || "Unavailable" },
    { key: "packageName", label: "PACKAGE", render: (row) => row.packageName },
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

  return <AdminTable scheme={scheme} columns={columns} data={clients} getRowKey={(row) => row.id} emptyText={emptyText} />;
}
