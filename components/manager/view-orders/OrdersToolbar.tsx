import { SearchIcon, XIcon } from "../icons";
import { cn, getMutedTextClasses } from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import { ORDER_STATUS_OPTIONS, PAYMENT_STATUS_OPTIONS } from "./order-data";
import { FilterDropdown } from "./FilterDropdown";
import { ControlShell, SectionPill, secondaryButtonClassName } from "./shared";
import type { OrderStatusFilter, PaymentStatusFilter } from "./types";

interface OrdersToolbarProps {
  settings: ManagerSettings;
  query: string;
  paymentStatus: PaymentStatusFilter;
  orderStatus: OrderStatusFilter;
  resultCount: number;
  hasActiveFilters: boolean;
  onQueryChange: (value: string) => void;
  onPaymentStatusChange: (value: PaymentStatusFilter) => void;
  onOrderStatusChange: (value: OrderStatusFilter) => void;
  onClearFilters: () => void;
}

export function OrdersToolbar({
  settings,
  query,
  paymentStatus,
  orderStatus,
  resultCount,
  hasActiveFilters,
  onQueryChange,
  onPaymentStatusChange,
  onOrderStatusChange,
  onClearFilters,
}: OrdersToolbarProps) {
  const activeChips = [
    query ? `Search: ${query}` : null,
    paymentStatus !== "All Payments" ? `Payment: ${paymentStatus}` : null,
    orderStatus !== "All Statuses" ? `Status: ${orderStatus}` : null,
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-3 lg:flex-row">
          <label className="min-w-0 flex-1">
            <span className="sr-only">Search orders</span>
            <ControlShell settings={settings}>
              <SearchIcon className="size-4 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Search by Order ID, Table Number, or Customer Name"
                className="w-full bg-transparent text-sm outline-none placeholder:text-inherit"
                aria-label="Search by order ID, table number, or customer name"
              />
            </ControlShell>
          </label>

          <div className="min-w-0 lg:w-[220px]">
            <FilterDropdown
              label="Filter by payment status"
              options={PAYMENT_STATUS_OPTIONS.map((option) => ({
                label: option,
                value: option,
              }))}
              value={paymentStatus}
              onChange={onPaymentStatusChange}
              placeholder="All Payments"
              settings={settings}
            />
          </div>

          <div className="min-w-0 lg:w-[220px]">
            <FilterDropdown
              label="Filter by order status"
              options={ORDER_STATUS_OPTIONS.map((option) => ({
                label: option,
                value: option,
              }))}
              value={orderStatus}
              onChange={onOrderStatusChange}
              placeholder="All Statuses"
              settings={settings}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className={cn("text-sm font-medium", getMutedTextClasses(settings.scheme))}>
            {resultCount} result{resultCount === 1 ? "" : "s"}
          </div>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={onClearFilters}
              className={secondaryButtonClassName(settings)}
              aria-label="Clear all order filters"
            >
              <XIcon className="mr-2 size-4" />
              Clear Filters
            </button>
          ) : null}
        </div>
      </div>

      {activeChips.length ? (
        <div className="flex flex-wrap items-center gap-2">
          <div
            className={cn(
              "text-[11px] font-semibold uppercase tracking-[0.22em]",
              getMutedTextClasses(settings.scheme),
            )}
          >
            Active Filters
          </div>
          {activeChips.map((chip) => (
            <SectionPill key={chip} settings={settings}>
              {chip}
            </SectionPill>
          ))}
        </div>
      ) : null}
    </div>
  );
}
