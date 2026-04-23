import {
  cn,
  getManagerStrongTextClasses,
  getManagerTableCellPaddingClasses,
  getManagerTableHeadSurfaceClasses,
  getManagerTableHeaderClasses,
  getManagerTableHeaderPaddingClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import { WAITER_PERFORMANCE_ROWS } from "./reports.data";
import { getReportsRoleBadgeClasses } from "./reports.helpers";
import { ReportsSectionCard } from "./ReportsSectionCard";

interface WaiterPerformanceTableProps {
  settings: ManagerSettings;
}

export function WaiterPerformanceTable({ settings }: WaiterPerformanceTableProps) {
  return (
    <ReportsSectionCard
      settings={settings}
      title="Waiter Performance"
      description="Orders served, revenue handled, and tables covered by waiters."
      tag="STAFF PERFORMANCE"
      className="h-full"
      bodyClassName="px-0 py-0"
    >
      <div className="overflow-x-auto px-5 pb-4 pt-2 sm:px-6 sm:pb-5">
        <table className="min-w-[640px] w-full border-collapse">
          <thead>
            <tr
              className={cn(
                getManagerTableHeadSurfaceClasses(settings.scheme),
                getManagerTableHeaderClasses(settings.scheme),
              )}
            >
              <th className={getManagerTableHeaderPaddingClasses()}>Staff</th>
              <th className={getManagerTableHeaderPaddingClasses()}>Role</th>
              <th className={getManagerTableHeaderPaddingClasses()}>Orders</th>
              <th className={getManagerTableHeaderPaddingClasses()}>Revenue</th>
              <th className={getManagerTableHeaderPaddingClasses()}>Tables</th>
            </tr>
          </thead>
          <tbody>
            {WAITER_PERFORMANCE_ROWS.map((row) => (
              <tr key={row.staff} className="border-b border-black/5 last:border-b-0">
                <td
                  className={cn(
                    getManagerTableCellPaddingClasses(),
                    "text-[14px] font-medium",
                    getManagerStrongTextClasses(settings.scheme),
                  )}
                >
                  {row.staff}
                </td>
                <td className={getManagerTableCellPaddingClasses()}>
                  <span
                    className={cn(
                      "inline-flex h-7 items-center rounded-full border px-3 text-[12px] font-semibold",
                      getReportsRoleBadgeClasses(row.role, settings.scheme),
                    )}
                  >
                    {row.role}
                  </span>
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
                <td
                  className={cn(
                    getManagerTableCellPaddingClasses(),
                    "text-[14px] font-semibold",
                    getManagerStrongTextClasses(settings.scheme),
                  )}
                >
                  {row.revenue}
                </td>
                <td
                  className={cn(
                    getManagerTableCellPaddingClasses(),
                    "text-[14px] font-medium",
                    getManagerStrongTextClasses(settings.scheme),
                  )}
                >
                  {row.tables}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ReportsSectionCard>
  );
}
