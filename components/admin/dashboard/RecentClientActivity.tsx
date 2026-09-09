"use client";

import { cn } from "@/components/manager/managerUtils";
import type { AdminRecentClientRow } from "@/lib/system-admin-dashboard-api";
import { AdminButton } from "../common/AdminButton";
import { AdminStatusBadge } from "../common/AdminStatusBadge";
import { adminCardClasses, adminMutedClasses } from "../common/adminStyles";
import type { AdminScheme } from "../common/adminTypes";

interface RecentClientActivityProps {
  scheme: AdminScheme;
  searchQuery: string;
  data?: AdminRecentClientRow[];
  onViewClients: () => void;
}

export function RecentClientActivity({
  scheme,
  searchQuery,
  data = [],
  onViewClients,
}: RecentClientActivityProps) {
  const rows = data.filter((row) =>
    Object.values(row).join(" ").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className={cn(adminCardClasses(scheme), "p-5 sm:p-6")}>
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-extrabold">Recent Client Activity</h3>
        <AdminButton scheme={scheme} variant="table" onClick={onViewClients}>View Clients</AdminButton>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-[900px] w-full">
          <thead>
            <tr className={cn("text-left text-xs font-extrabold uppercase tracking-[0.16em]", adminMutedClasses(scheme))}>
              {["CLIENT", "PACKAGE", "ORDERS", "REVENUE", "STATUS"].map((heading) => (
                <th key={heading} className={cn("border-b px-4 py-4", scheme === "dark" ? "border-[#263650]" : "border-slate-200")}>{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row, idx) => (
                <tr key={`${row.client}-${idx}`} className={cn("text-sm transition-colors duration-150", scheme === "dark" ? "hover:bg-white/[0.05]" : "hover:bg-slate-50")}>
                  <td className={cn("border-b px-4 py-4 font-semibold", scheme === "dark" ? "border-[#263650]" : "border-slate-200")}>{row.client}</td>
                  <td className={cn("border-b px-4 py-4", scheme === "dark" ? "border-[#263650]" : "border-slate-200")}>{row.package}</td>
                  <td className={cn("border-b px-4 py-4", scheme === "dark" ? "border-[#263650]" : "border-slate-200")}>{row.orders}</td>
                  <td className={cn("border-b px-4 py-4", scheme === "dark" ? "border-[#263650]" : "border-slate-200")}>{row.revenue}</td>
                  <td className={cn("border-b px-4 py-4", scheme === "dark" ? "border-[#263650]" : "border-slate-200")}><AdminStatusBadge scheme={scheme} status={row.status} /></td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className={cn("border-b px-4 py-8 text-center text-sm", adminMutedClasses(scheme))}>
                  No client activity recorded.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

