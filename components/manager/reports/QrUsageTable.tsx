import {
  cn,
  getManagerTableCellPaddingClasses,
  getManagerTableHeaderClasses,
  getManagerTableHeaderPaddingClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import { QR_USAGE_ROWS } from "./reports.data";
import { ReportsSectionCard } from "./ReportsSectionCard";

interface QrUsageTableProps {
  settings: ManagerSettings;
}

export function QrUsageTable({ settings }: QrUsageTableProps) {
  return (
    <ReportsSectionCard
      settings={settings}
      title="QR Usage Per Table"
      description="How many times each QR was used and how many orders it produced."
      tag="QR ANALYTICS"
      tagAlign="left"
      className="h-full"
      bodyClassName="px-0 py-0"
    >
      <div className="overflow-x-auto px-5 pb-4 pt-2 sm:px-6 sm:pb-5">
        <table className="min-w-[340px] w-full border-collapse">
          <thead>
            <tr className={cn("border-b border-black/5", getManagerTableHeaderClasses(settings.scheme))}>
              <th className={getManagerTableHeaderPaddingClasses()}>Table</th>
              <th className={getManagerTableHeaderPaddingClasses()}>Scans / Day</th>
              <th className={getManagerTableHeaderPaddingClasses()}>Orders</th>
              <th className={getManagerTableHeaderPaddingClasses()}>Conversion</th>
            </tr>
          </thead>
          <tbody>
            {QR_USAGE_ROWS.map((row) => (
              <tr key={row.table} className="border-b border-black/5 last:border-b-0">
                <td className={cn(getManagerTableCellPaddingClasses(), "text-[14px] font-semibold text-white")}>
                  {row.table}
                </td>
                <td className={cn(getManagerTableCellPaddingClasses(), "text-[14px] font-semibold text-white")}>
                  {row.scansPerDay}
                </td>
                <td className={cn(getManagerTableCellPaddingClasses(), "text-[14px] font-semibold text-white")}>
                  {row.orders}
                </td>
                <td className={getManagerTableCellPaddingClasses()}>
                  <span
                    className={cn(
                      "inline-flex h-7 items-center rounded-full border px-3 text-[12px] font-semibold",
                      settings.scheme === "dark"
                        ? "border-emerald-400/18 bg-emerald-500/12 text-emerald-200"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700",
                    )}
                  >
                    {row.conversion}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ReportsSectionCard>
  );
}
