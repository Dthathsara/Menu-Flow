import { AdminButton } from "../common/AdminButton";
import { AdminStatusBadge } from "../common/AdminStatusBadge";
import { AdminTable, type AdminTableColumn } from "../common/AdminTable";
import type { AdminScheme } from "../common/adminTypes";
import type { SystemAdminPackage } from "@/lib/system-admin-api";

export type PackageRecord = SystemAdminPackage;

interface PackagesTableProps {
  scheme: AdminScheme;
  packages: PackageRecord[];
  onEdit: (item: PackageRecord) => void;
  onDelete: (item: PackageRecord) => void;
}

export function PackagesTable({ scheme, packages, onEdit, onDelete }: PackagesTableProps) {
  const columns: Array<AdminTableColumn<PackageRecord>> = [
    { key: "package", label: "PACKAGE", render: (row) => row.packageName },
    { key: "price", label: "PRICE", render: (row) => row.priceDisplay || (row.isCustomPrice ? "Custom price" : `Rs. ${row.price?.toLocaleString() || 0}`) },
    { key: "clients", label: "CLIENTS", render: (row) => row.clients ?? 0 },
    { key: "features", label: "FEATURES", render: (row) => row.featuresSummary || row.features?.join(", ") || "-" },
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


