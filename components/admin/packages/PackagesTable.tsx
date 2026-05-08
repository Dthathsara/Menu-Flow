import { AdminButton } from "../common/AdminButton";
import { AdminStatusBadge } from "../common/AdminStatusBadge";
import { AdminTable, type AdminTableColumn } from "../common/AdminTable";
import type { AdminScheme } from "../common/adminTypes";

export interface PackageRecord {
  id: string;
  packageName: string;
  price: string;
  clients: number;
  features: string;
  status: "Active" | "Inactive";
}

interface PackagesTableProps {
  scheme: AdminScheme;
  packages: PackageRecord[];
  onEdit: (item: PackageRecord) => void;
  onDelete: (item: PackageRecord) => void;
}

export function PackagesTable({ scheme, packages, onEdit, onDelete }: PackagesTableProps) {
  const columns: Array<AdminTableColumn<PackageRecord>> = [
    { key: "package", label: "PACKAGE", render: (row) => row.packageName },
    { key: "price", label: "PRICE", render: (row) => row.price },
    { key: "clients", label: "CLIENTS", render: (row) => row.clients },
    { key: "features", label: "FEATURES", render: (row) => row.features },
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
  return <AdminTable scheme={scheme} columns={columns} data={packages} getRowKey={(row) => row.id} />;
}

