"use client";

import { AdminButton } from "../common/AdminButton";
import { AdminStatusBadge } from "../common/AdminStatusBadge";
import { AdminTable, type AdminTableColumn } from "../common/AdminTable";
import type { AdminScheme } from "../common/adminTypes";
import { formatInvoiceDate, formatLKR } from "./invoice.helpers";
import type { AdminInvoice } from "./invoice.types";

interface InvoicesTableProps {
  scheme: AdminScheme;
  invoices: AdminInvoice[];
  isLoading?: boolean;
  onEdit: (invoice: AdminInvoice) => void;
  onDelete: (invoice: AdminInvoice) => void;
}

export function InvoicesTable({
  scheme,
  invoices,
  isLoading = false,
  onEdit,
  onDelete,
}: InvoicesTableProps) {
  const columns: Array<AdminTableColumn<AdminInvoice>> = [
    {
      key: "invoiceId",
      label: "INVOICE ID",
      render: (row) => (
        <span className="font-mono font-semibold tracking-tight text-current">
          {row.invoiceId || row.id}
        </span>
      ),
    },
    {
      key: "client",
      label: "CLIENT",
      render: (row) => (
        <div>
          <div className="font-bold text-current">{row.clientName}</div>
          {row.planName ? (
            <div className="text-xs font-medium opacity-70">{row.planName}</div>
          ) : null}
        </div>
      ),
    },
    {
      key: "managerAccount",
      label: "MANAGER / ACCOUNT",
      render: (row) => (
        <div>
          <div className="font-semibold text-current">
            {row.manager?.name || row.clientName}
          </div>
          {row.manager?.email ? (
            <div className="text-xs font-medium opacity-70">{row.manager.email}</div>
          ) : null}
        </div>
      ),
    },
    {
      key: "amount",
      label: "AMOUNT",
      render: (row) => (
        <span className="font-bold tracking-tight text-emerald-400">
          {formatLKR(row.amount)}
        </span>
      ),
    },
    {
      key: "dueDate",
      label: "DUE DATE",
      render: (row) => (
        <span className="text-sm font-medium">{formatInvoiceDate(row.dueDate)}</span>
      ),
    },
    {
      key: "status",
      label: "STATUS",
      render: (row) => <AdminStatusBadge scheme={scheme} status={row.status} />,
    },
    {
      key: "actions",
      label: "ACTIONS",
      render: (row) => (
        <div className="flex gap-2">
          <AdminButton scheme={scheme} variant="table" onClick={() => onEdit(row)}>
            Edit
          </AdminButton>
          <AdminButton scheme={scheme} variant="danger" onClick={() => onDelete(row)}>
            Delete
          </AdminButton>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3, 4, 5].map((idx) => (
          <div
            key={idx}
            className="h-12 w-full animate-pulse rounded-lg bg-slate-400/10"
          />
        ))}
      </div>
    );
  }

  return (
    <AdminTable
      scheme={scheme}
      columns={columns}
      data={invoices}
      getRowKey={(row) => row.id || row.invoiceId}
      emptyText="No invoices found matching your criteria."
    />
  );
}
