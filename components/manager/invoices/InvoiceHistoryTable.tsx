import { ChevronDownIcon, SearchIcon } from "../icons";
import {
  cn,
  getManagerAccentPillClasses,
  getManagerCardShellClasses,
  getManagerSectionSubtitleClasses,
  getManagerSectionTitleClasses,
  getManagerTableActionButtonClasses,
  getManagerTableCellPaddingClasses,
  getManagerTableHeadSurfaceClasses,
  getManagerTableHeaderClasses,
  getManagerTableHeaderPaddingClasses,
  getManagerTableRowClasses,
  getManagerTextInputClasses,
  getManagerBadgeClasses,
  getManagerStrongTextClasses,
  getMutedTextClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import type {
  InvoiceHistoryStatusFilter,
  InvoiceRecord,
} from "./invoice.types";

interface InvoiceHistoryTableProps {
  settings: ManagerSettings;
  invoices: InvoiceRecord[];
  query: string;
  statusFilter: InvoiceHistoryStatusFilter;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: InvoiceHistoryStatusFilter) => void;
  onView: (invoiceId: string) => void;
  onDownload: (invoiceId: string) => void;
}

export function InvoiceHistoryTable({
  settings,
  invoices,
  query,
  statusFilter,
  onQueryChange,
  onStatusChange,
  onView,
  onDownload,
}: InvoiceHistoryTableProps) {
  return (
    <section
      className={cn(
        "p-5 sm:p-6",
        getManagerCardShellClasses(settings.scheme, { interactive: true }),
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className={getManagerSectionTitleClasses()}>Invoice History</h3>
          <p className={cn("text-[13px]", getManagerSectionSubtitleClasses(settings.scheme))}>
            Search, filter, view, print, download, or export subscription invoices.
          </p>
        </div>
        <span className={getManagerAccentPillClasses(settings.scheme, "brand")}>
          4 Invoices
        </span>
      </div>

      <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative block flex-1">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search invoice ID, package, status..."
            className={cn("pl-10", getManagerTextInputClasses(settings.scheme))}
          />
        </label>

        <div className="relative min-w-[180px]">
          <select
            value={statusFilter}
            onChange={(event) =>
              onStatusChange(event.target.value as InvoiceHistoryStatusFilter)
            }
            className={cn(
              "w-full appearance-none pr-10",
              getManagerTextInputClasses(settings.scheme),
            )}
          >
            <option value="All Status">All Status</option>
            <option value="Paid">Paid</option>
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-[860px] w-full border-separate border-spacing-0">
          <thead className={getManagerTableHeadSurfaceClasses(settings.scheme)}>
            <tr>
              {[
                "Invoice ID",
                "Package",
                "Billing Date",
                "Renewal Date",
                "Amount",
                "Status",
                "Actions",
              ].map((heading) => (
                <th
                  key={heading}
                  className={cn(
                    getManagerTableHeaderClasses(settings.scheme),
                    getManagerTableHeaderPaddingClasses(),
                  )}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className={cn(
                    "px-5 py-10 text-center text-[14px] text-slate-400",
                    getManagerTableRowClasses(settings.scheme),
                  )}
                >
                  No invoices match the current filters.
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr key={invoice.id} className={getManagerTableRowClasses(settings.scheme)}>
                  <td
                    className={cn(
                      getManagerTableCellPaddingClasses(),
                      "font-semibold",
                      getManagerStrongTextClasses(settings.scheme),
                    )}
                  >
                    #{invoice.id}
                  </td>
                  <td
                    className={cn(
                      getManagerTableCellPaddingClasses(),
                      "font-semibold",
                      settings.scheme === "dark" ? "text-slate-200" : "text-slate-800",
                    )}
                  >
                    {invoice.packageLabel}
                  </td>
                  <td className={cn(getManagerTableCellPaddingClasses(), getMutedTextClasses(settings.scheme))}>
                    {invoice.billingDate}
                  </td>
                  <td className={cn(getManagerTableCellPaddingClasses(), getMutedTextClasses(settings.scheme))}>
                    {invoice.renewalDate}
                  </td>
                  <td
                    className={cn(
                      getManagerTableCellPaddingClasses(),
                      "font-semibold",
                      getManagerStrongTextClasses(settings.scheme),
                    )}
                  >
                    {invoice.amount}
                  </td>
                  <td className={getManagerTableCellPaddingClasses()}>
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                        getManagerBadgeClasses("success", settings.scheme),
                      )}
                    >
                      Paid
                    </span>
                  </td>
                  <td className={getManagerTableCellPaddingClasses()}>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onView(invoice.id)}
                        className={cn(
                          getManagerTableActionButtonClasses(settings.scheme),
                          "h-9 rounded-[10px] px-4 text-[13px]",
                        )}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => onDownload(invoice.id)}
                        className={cn(
                          getManagerTableActionButtonClasses(settings.scheme),
                          "h-9 rounded-[10px] px-4 text-[13px]",
                        )}
                      >
                        Download
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
