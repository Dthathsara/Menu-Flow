import {
  cn,
  getManagerBadgeClasses,
  getManagerStrongTextClasses,
  getManagerTableCellPaddingClasses,
  getManagerTableHeadSurfaceClasses,
  getManagerTableHeaderClasses,
  getManagerTableHeaderPaddingClasses,
} from "../../managerUtils";
import type { ManagerSettings } from "../../managerTypes";
import { ReportsSectionCard } from "../ReportsSectionCard";
import type { OrdersReportQrUsageRow } from "../reports.types";

interface QrUsageTableProps {
  settings: ManagerSettings;
  rows: OrdersReportQrUsageRow[];
  isLoading?: boolean;
}

export function QrUsageTable({ settings, rows, isLoading = false }: QrUsageTableProps) {
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
            <tr
              className={cn(
                getManagerTableHeadSurfaceClasses(settings.scheme),
                getManagerTableHeaderClasses(settings.scheme),
              )}
            >
              <th className={getManagerTableHeaderPaddingClasses()}>Table</th>
              <th className={getManagerTableHeaderPaddingClasses()}>Scans / Day</th>
              <th className={getManagerTableHeaderPaddingClasses()}>Orders</th>
              <th className={getManagerTableHeaderPaddingClasses()}>Conversion</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className={cn(getManagerTableCellPaddingClasses(), "text-center")}>
                  Loading QR usage...
                </td>
              </tr>
            ) : rows.length ? rows.map((row) => (
              <tr key={row.table} className="border-b border-black/5 last:border-b-0">
                <td
                  className={cn(
                    getManagerTableCellPaddingClasses(),
                    "text-[14px] font-semibold",
                    getManagerStrongTextClasses(settings.scheme),
                  )}
                >
                  {row.table}
                </td>
                <td
                  className={cn(
                    getManagerTableCellPaddingClasses(),
                    "text-[14px] font-semibold",
                    getManagerStrongTextClasses(settings.scheme),
                  )}
                >
                  {row.scansPerDay}
                </td>
                <td
                  className={cn(
                    getManagerTableCellPaddingClasses(),
                    "text-[14px] font-semibold",
                    getManagerStrongTextClasses(settings.scheme),
                  )}
                >
                  {row.orders}
                </td>
                <td className={getManagerTableCellPaddingClasses()}>
                  <span
                    className={cn(
                      "inline-flex h-7 items-center rounded-full border px-3 text-[12px] font-semibold",
                      getManagerBadgeClasses("success", settings.scheme),
                    )}
                  >
                    {row.conversion}
                  </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className={cn(getManagerTableCellPaddingClasses(), "text-center")}>
                  No QR usage data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </ReportsSectionCard>
  );
}
