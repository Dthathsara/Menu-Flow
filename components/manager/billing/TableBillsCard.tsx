import { SearchIcon } from "../icons";
import {
  cn,
  getManagerAccentPillClasses,
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
  getMutedTextClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import { BillingSelect } from "./BillingSelect";
import { BILLING_METHOD_OPTIONS, BILLING_STATUS_OPTIONS } from "./billing.data";
import {
  formatCurrency,
  getBillStatusBadgeClasses,
  getBrandTableButtonClasses,
  getPrimaryTableButtonClasses,
  getMethodBadgeLabel,
} from "./billing.helpers";
import type { BillMethodFilter, BillRecord, BillStatusFilter } from "./billing.types";

interface TableBillsCardProps {
  settings: ManagerSettings;
  bills: BillRecord[];
  query: string;
  statusFilter: BillStatusFilter;
  methodFilter: BillMethodFilter;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: BillStatusFilter) => void;
  onMethodChange: (value: BillMethodFilter) => void;
  onCreateBill: () => void;
  onView: (bill: BillRecord) => void;
  onCollectPayment: (bill: BillRecord) => void;
  onRefund: (bill: BillRecord) => void;
}

export function TableBillsCard({
  settings,
  bills,
  query,
  statusFilter,
  methodFilter,
  onQueryChange,
  onStatusChange,
  onMethodChange,
  onCreateBill,
  onView,
  onCollectPayment,
  onRefund,
}: TableBillsCardProps) {
  return (
    <section
      className={cn(
        "overflow-hidden",
        getManagerCardShellClasses(settings.scheme, { interactive: true }),
      )}
    >
      <div className="border-b border-black/5 px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className={getManagerSectionTitleClasses()}>Table Bills</h3>
            <p className={getManagerSectionSubtitleClasses(settings.scheme)}>
              Live billing list from QR orders, waiter-served tables, and completed
              customer sessions.
            </p>
          </div>
          <span className={getManagerAccentPillClasses(settings.scheme, "brand")}>
            LIVE BILLS
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
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search bill, table, waiter..."
              className={cn(
                "w-full bg-transparent text-[15px] outline-none",
                settings.scheme === "dark"
                  ? "text-slate-100 placeholder:text-slate-400"
                  : "text-slate-900 placeholder:text-slate-400",
              )}
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-[180px_180px_auto] xl:flex xl:items-center">
            <BillingSelect
              label="Status"
              options={BILLING_STATUS_OPTIONS.map((option) => ({ label: option, value: option }))}
              value={statusFilter}
              onChange={onStatusChange}
              settings={settings}
            />
            <BillingSelect
              label="Method"
              options={BILLING_METHOD_OPTIONS.map((option) => ({ label: option, value: option }))}
              value={methodFilter}
              onChange={onMethodChange}
              settings={settings}
            />
            <button
              type="button"
              onClick={onCreateBill}
              className={cn(getBrandTableButtonClasses(settings.scheme), "h-11 rounded-[14px] px-5 text-[14px]")}
            >
              Create Bill
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[860px] w-full border-collapse">
          <thead className="sticky top-0 z-10">
            <tr
              className={cn(
                getManagerTableHeadSurfaceClasses(settings.scheme),
                getManagerTableHeaderClasses(settings.scheme),
              )}
            >
              {["BILL", "TABLE", "WAITER", "ITEMS", "TOTAL", "METHOD", "STATUS", "ACTIONS"].map((heading) => (
                <th
                  key={heading}
                  className={cn(
                    getManagerTableHeaderPaddingClasses(),
                    "text-left",
                    heading === "BILL" && "pl-5",
                  )}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bills.length ? (
              bills.map((bill) => (
                <tr key={bill.id} className={getManagerTableRowClasses(settings.scheme)}>
                  <td className={cn(getManagerTableCellPaddingClasses(), "font-semibold", getManagerStrongTextClasses(settings.scheme))}>
                    {bill.billId}
                  </td>
                  <td className={cn(getManagerTableCellPaddingClasses(), "font-semibold", getManagerStrongTextClasses(settings.scheme))}>
                    {bill.tableNumber}
                  </td>
                  <td className={cn(getManagerTableCellPaddingClasses(), "font-semibold", getManagerStrongTextClasses(settings.scheme))}>
                    {bill.waiterName}
                  </td>
                  <td className={cn(getManagerTableCellPaddingClasses(), "font-semibold", getManagerStrongTextClasses(settings.scheme))}>
                    {bill.itemsCount}
                  </td>
                  <td className={cn(getManagerTableCellPaddingClasses(), "font-semibold", getManagerStrongTextClasses(settings.scheme))}>
                    {formatCurrency(bill.total)}
                  </td>
                  <td className={cn(getManagerTableCellPaddingClasses(), "font-medium", getManagerStrongTextClasses(settings.scheme))}>
                    {getMethodBadgeLabel(bill.method)}
                  </td>
                  <td className={getManagerTableCellPaddingClasses()}>
                    <span className={getBillStatusBadgeClasses(bill.status, settings.scheme)}>
                      {bill.status}
                    </span>
                  </td>
                  <td className={getManagerTableCellPaddingClasses()}>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onView(bill)}
                        className={getPrimaryTableButtonClasses(settings.scheme)}
                      >
                        View
                      </button>

                      {bill.status === "Pending" ? (
                        <button
                          type="button"
                          onClick={() => onCollectPayment(bill)}
                          className={getPrimaryTableButtonClasses(settings.scheme)}
                        >
                          Pay
                        </button>
                      ) : null}

                      {bill.status === "Paid" ? (
                        <button
                          type="button"
                          onClick={() => onRefund(bill)}
                          className={getPrimaryTableButtonClasses(settings.scheme)}
                        >
                          Refund
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className={cn(
                    "px-5 py-10 text-center text-[14px]",
                    getMutedTextClasses(settings.scheme),
                  )}
                >
                  No bills matched the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
