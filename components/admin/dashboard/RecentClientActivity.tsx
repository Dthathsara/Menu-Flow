"use client";

import { cn } from "@/components/manager/managerUtils";
import { AdminButton } from "../common/AdminButton";
import { AdminStatusBadge } from "../common/AdminStatusBadge";
import { adminCardClasses, adminMutedClasses } from "../common/adminStyles";
import type { AdminScheme } from "../common/adminTypes";

const activityRows = [
  { client: "Ocean Pearl Hotel", package: "Enterprise", orders: "1,284", revenue: "Rs. 384,200", status: "Active" },
  { client: "Cafe Noir", package: "Pro", orders: "864", revenue: "Rs. 142,900", status: "Active" },
  { client: "Spice Garden", package: "Business", orders: "528", revenue: "Rs. 88,400", status: "Pending" },
];

export function RecentClientActivity({
  scheme,
  searchQuery,
  onViewClients,
}: {
  scheme: AdminScheme;
  searchQuery: string;
  onViewClients: () => void;
}) {
  const rows = activityRows.filter((row) =>
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
            {rows.map((row) => (
              <tr key={row.client} className={cn("text-sm transition-colors duration-150", scheme === "dark" ? "hover:bg-white/[0.05]" : "hover:bg-slate-50")}>
                <td className={cn("border-b px-4 py-4", scheme === "dark" ? "border-[#263650]" : "border-slate-200")}>{row.client}</td>
                <td className={cn("border-b px-4 py-4", scheme === "dark" ? "border-[#263650]" : "border-slate-200")}>{row.package}</td>
                <td className={cn("border-b px-4 py-4", scheme === "dark" ? "border-[#263650]" : "border-slate-200")}>{row.orders}</td>
                <td className={cn("border-b px-4 py-4", scheme === "dark" ? "border-[#263650]" : "border-slate-200")}>{row.revenue}</td>
                <td className={cn("border-b px-4 py-4", scheme === "dark" ? "border-[#263650]" : "border-slate-200")}><AdminStatusBadge scheme={scheme} status={row.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
