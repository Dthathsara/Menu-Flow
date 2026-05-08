import {
  cn,
} from "@/components/manager/managerUtils";
import { adminMutedClasses } from "./adminStyles";
import type { AdminScheme } from "./adminTypes";

export interface AdminTableColumn<T> {
  key: string;
  label: string;
  className?: string;
  render: (row: T) => React.ReactNode;
}

interface AdminTableProps<T> {
  scheme: AdminScheme;
  columns: Array<AdminTableColumn<T>>;
  data: T[];
  getRowKey: (row: T) => string;
  emptyText?: string;
}

export function AdminTable<T>({
  scheme,
  columns,
  data,
  getRowKey,
  emptyText = "No records found.",
}: AdminTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[900px] w-full border-separate border-spacing-0">
        <thead>
          <tr className={cn("text-left text-xs font-extrabold uppercase tracking-[0.16em]", adminMutedClasses(scheme))}>
            {columns.map((column) => (
              <th key={column.key} className={cn("px-4 py-4", column.className)}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={getRowKey(row)} className={cn("border-t text-sm transition-colors duration-150", scheme === "dark" ? "border-[#263650] hover:bg-white/[0.05]" : "border-slate-200 hover:bg-slate-50")}>
              {columns.map((column) => (
                <td key={column.key} className={cn("border-t px-4 py-4", scheme === "dark" ? "border-[#263650]" : "border-slate-200", column.className)}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 ? (
        <div className={cn("px-5 py-10 text-center text-sm", scheme === "dark" ? "text-slate-400" : "text-slate-500")}>
          {emptyText}
        </div>
      ) : null}
    </div>
  );
}
