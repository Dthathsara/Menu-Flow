import { AdminButton } from "../common/AdminButton";
import { AdminStatusBadge } from "../common/AdminStatusBadge";
import { AdminTable, type AdminTableColumn } from "../common/AdminTable";
import type { AdminScheme } from "../common/adminTypes";

export interface ClientRecord {
  id: string;
  business: string;
  owner: string;
  email: string;
  package: "Starter" | "Business" | "Pro" | "Enterprise";
  status: "Active" | "Pending" | "Inactive";
  notes: string;
}

interface ClientTableProps {
  scheme: AdminScheme;
  clients: ClientRecord[];
  onEdit: (client: ClientRecord) => void;
  onDelete: (client: ClientRecord) => void;
}

export function ClientTable({ scheme, clients, onEdit, onDelete }: ClientTableProps) {
  const columns: Array<AdminTableColumn<ClientRecord>> = [
    { key: "business", label: "BUSINESS", render: (row) => row.business },
    { key: "owner", label: "OWNER", render: (row) => row.owner },
    { key: "email", label: "EMAIL", render: (row) => row.email },
    { key: "package", label: "PACKAGE", render: (row) => row.package },
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

  return <AdminTable scheme={scheme} columns={columns} data={clients} getRowKey={(row) => row.id} />;
}

