import {
  cn,
  getManagerStrongTextClasses,
  getManagerTableCellPaddingClasses,
  getManagerTableHeadSurfaceClasses,
  getManagerTableHeaderClasses,
  getManagerTableHeaderPaddingClasses,
} from "../../managerUtils";
import type { ManagerSettings } from "../../managerTypes";
import { ReportsSectionCard } from "../ReportsSectionCard";
import type { OrdersReportTopSellingItem } from "../reports.types";

interface TopSellingItemsTableProps {
  settings: ManagerSettings;
  rows: OrdersReportTopSellingItem[];
  isLoading?: boolean;
}

export function TopSellingItemsTable({ settings, rows, isLoading = false }: TopSellingItemsTableProps) {
  return (
    <ReportsSectionCard
      settings={settings}
      title="Top Selling Items"
      description="Highest-performing menu items by quantity sold and revenue."
      tag="MENU PERFORMANCE"
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
              <th className={getManagerTableHeaderPaddingClasses()}>Item</th>
              <th className={getManagerTableHeaderPaddingClasses()}>Qty</th>
              <th className={getManagerTableHeaderPaddingClasses()}>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={3} className={cn(getManagerTableCellPaddingClasses(), "text-center")}>
                  Loading top items...
                </td>
              </tr>
            ) : rows.length ? rows.map((row) => (
              <tr key={row.item} className="border-b border-black/5 last:border-b-0">
                <td
                  className={cn(
                    getManagerTableCellPaddingClasses(),
                    "text-[14px] font-medium",
                    getManagerStrongTextClasses(settings.scheme),
                  )}
                >
                  {row.item}
                </td>
                <td
                  className={cn(
                    getManagerTableCellPaddingClasses(),
                    "text-[14px] font-semibold",
                    getManagerStrongTextClasses(settings.scheme),
                  )}
                >
                  {row.quantity}
                </td>
                <td
                  className={cn(
                    getManagerTableCellPaddingClasses(),
                    "text-[14px] font-semibold",
                    getManagerStrongTextClasses(settings.scheme),
                  )}
                >
                  {row.revenueLabel}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={3} className={cn(getManagerTableCellPaddingClasses(), "text-center")}>
                  No top selling item data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </ReportsSectionCard>
  );
}
