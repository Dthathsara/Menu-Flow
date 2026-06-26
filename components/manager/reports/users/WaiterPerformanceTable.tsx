import { ChevronDownIcon, SearchIcon } from "../../icons";
import {
  cn,
  getManagerAccentPillClasses,
  getManagerBodyTextClasses,
  getManagerCardShellClasses,
  getManagerControlShellClasses,
  getManagerSectionSubtitleClasses,
  getManagerSectionTitleClasses,
  getManagerStrongTextClasses,
  getManagerTableCellPaddingClasses,
  getManagerTableHeadSurfaceClasses,
  getManagerTableHeaderClasses,
  getManagerTableHeaderPaddingClasses,
  getManagerTableRowClasses,
} from "../../managerUtils";
import type { ManagerSettings } from "../../managerTypes";
import { getReportsRoleBadgeClasses } from "../reports.helpers";
import type { UserReportFilters, UserReportPerformanceRow } from "../reports.types";

interface WaiterPerformanceTableProps {
  settings: ManagerSettings;
  rows: UserReportPerformanceRow[];
  filters: UserReportFilters;
  search: string;
  role: string;
  period: string;
  isLoading: boolean;
  onSearchChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onPeriodChange: (value: string) => void;
}

export function WaiterPerformanceTable({
  settings,
  rows,
  filters,
  search,
  role,
  period,
  isLoading,
  onSearchChange,
  onRoleChange,
  onPeriodChange,
}: WaiterPerformanceTableProps) {
  return (
    <section
      className={cn(
        "self-start overflow-hidden",
        getManagerCardShellClasses(settings.scheme, { interactive: true }),
      )}
    >
      <div className="border-b border-black/5 px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className={getManagerSectionTitleClasses()}>Waiter Performance</h3>
            <p className={getManagerSectionSubtitleClasses(settings.scheme)}>
              Orders served, revenue handled, and tables covered by waiters.
            </p>
          </div>
          <span className={getManagerAccentPillClasses(settings.scheme, "brand")}>
            STAFF PERFORMANCE
          </span>
        </div>

        <div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-center">
          <label
            className={cn(
              "flex h-11 min-w-0 flex-1 items-center gap-2 rounded-lg border px-4",
              getManagerControlShellClasses(settings.scheme),
            )}
          >
            <SearchIcon className="size-4 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search staff, role, revenue..."
              className={cn(
                "w-full bg-transparent text-[15px] outline-none",
                settings.scheme === "dark"
                  ? "text-slate-100 placeholder:text-slate-400"
                  : "text-slate-900 placeholder:text-slate-400",
              )}
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-[180px_180px] xl:flex xl:items-center">
            <label
              className={cn(
                "relative",
                getManagerControlShellClasses(settings.scheme),
                "min-w-[180px] font-semibold",
              )}
            >
              <select
                value={role}
                onChange={(event) => onRoleChange(event.target.value)}
                className="h-full w-full appearance-none bg-transparent pr-7 outline-none"
                aria-label="Filter users report by role"
              >
                <option value="all">All Roles</option>
                {filters.roles.map((roleOption) => (
                  <option key={roleOption} value={roleOption}>
                    {roleOption}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="pointer-events-none absolute right-3 size-4 text-slate-400" />
            </label>

            <label
              className={cn(
                "relative",
                getManagerControlShellClasses(settings.scheme),
                "min-w-[180px] font-semibold",
              )}
            >
              <select
                value={period}
                onChange={(event) => onPeriodChange(event.target.value)}
                className="h-full w-full appearance-none bg-transparent pr-7 outline-none"
                aria-label="Filter users report by period"
              >
                <option value="all">All Periods</option>
                {filters.periods.map((periodOption) => (
                  <option key={periodOption.key} value={periodOption.key}>
                    {periodOption.label}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="pointer-events-none absolute right-3 size-4 text-slate-400" />
            </label>
          </div>

          <div className={cn("font-medium", getManagerBodyTextClasses(settings.scheme))}>
            {rows.length} result{rows.length === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      <div className="max-h-[430px] overflow-y-auto overflow-x-auto">
        <table className="min-w-[860px] w-full border-collapse">
          <thead className="sticky top-0 z-10">
            <tr
              className={cn(
                getManagerTableHeadSurfaceClasses(settings.scheme),
                getManagerTableHeaderClasses(settings.scheme),
              )}
            >
              {["STAFF", "ROLE", "ORDERS", "REVENUE", "TABLES", "PERIOD"].map((heading) => (
                <th
                  key={heading}
                  className={cn(
                    getManagerTableHeaderPaddingClasses(),
                    "text-left",
                    heading === "STAFF" && "pl-5",
                  )}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr className={getManagerTableRowClasses(settings.scheme)}>
                <td colSpan={6} className={cn(getManagerTableCellPaddingClasses(), "text-center")}>
                  Loading users report...
                </td>
              </tr>
            ) : rows.length ? rows.map((row) => (
              <tr key={row.id} className={getManagerTableRowClasses(settings.scheme)}>
                <td
                  className={cn(
                    getManagerTableCellPaddingClasses(),
                    "font-semibold",
                    getManagerStrongTextClasses(settings.scheme),
                  )}
                >
                  {row.staff}
                </td>
                <td className={getManagerTableCellPaddingClasses()}>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full border px-3 py-1 text-[12px] font-semibold",
                      getReportsRoleBadgeClasses(row.role, settings.scheme),
                    )}
                  >
                    {row.role}
                  </span>
                </td>
                <td
                  className={cn(
                    getManagerTableCellPaddingClasses(),
                    "font-semibold",
                    getManagerStrongTextClasses(settings.scheme),
                  )}
                >
                  {row.orders}
                </td>
                <td
                  className={cn(
                    getManagerTableCellPaddingClasses(),
                    "font-semibold",
                    getManagerStrongTextClasses(settings.scheme),
                  )}
                >
                  {row.revenueLabel}
                </td>
                <td
                  className={cn(
                    getManagerTableCellPaddingClasses(),
                    "font-semibold",
                    getManagerStrongTextClasses(settings.scheme),
                  )}
                >
                  {row.tables}
                </td>
                <td
                  className={cn(
                    getManagerTableCellPaddingClasses(),
                    "font-semibold",
                    getManagerStrongTextClasses(settings.scheme),
                  )}
                >
                  {row.periodLabel}
                </td>
              </tr>
            )) : (
              <tr className={getManagerTableRowClasses(settings.scheme)}>
                <td colSpan={6} className={cn(getManagerTableCellPaddingClasses(), "text-center")}>
                  No users report data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
