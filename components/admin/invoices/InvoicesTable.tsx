import { AdminButton } from "../common/AdminButton";
import { AdminStatusBadge } from "../common/AdminStatusBadge";
import { AdminTable, type AdminTableColumn } from "../common/AdminTable";
import type { AdminScheme } from "../common/adminTypes";

export interface InvoiceRecord {
  id: string;
  invoiceId: string;
  client: string;
  amount: string;
  dueDate: string;
  status: "Paid" | "Pending" | "Overdue";
}

interface InvoicesTableProps {
  scheme: AdminScheme;
  invoices: InvoiceRecord[];
  onEdit: (invoice: InvoiceRecord) => void;
  onDelete: (invoice: InvoiceRecord) => void;
}

export function InvoicesTable({ scheme, invoices, onEdit, onDelete }: InvoicesTableProps) {
  const columns: Array<AdminTableColumn<InvoiceRecord>> = [
    { key: "invoiceId", label: "INVOICE ID", render: (row) => row.invoiceId },
    { key: "client", label: "CLIENT", render: (row) => row.client },
    { key: "amount", label: "AMOUNT", render: (row) => row.amount },
    { key: "dueDate", label: "DUE DATE", render: (row) => row.dueDate },
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
  return <AdminTable scheme={scheme} columns={columns} data={invoices} getRowKey={(row) => row.id} />;
}

