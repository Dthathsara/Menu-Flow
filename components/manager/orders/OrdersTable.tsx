import {
  cn,
  getManagerBodyTextClasses,
  getManagerTableCellPaddingClasses,
  getManagerTableHeaderClasses,
  getManagerTableHeaderPaddingClasses,
  getManagerTableRowTextClasses,
  getMutedTextClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import { EyeIcon } from "./order-icons";
import { getOrderItemCount } from "./order-data";
import {
  StatusBadge,
  formatCurrency,
  formatDisplayDate,
  getRelativeDateLabel,
  secondaryButtonClassName,
} from "./shared";
import type { OrderRecord } from "./types";

interface OrdersTableProps {
  settings: ManagerSettings;
  orders: OrderRecord[];
  isLoading: boolean;
  hasActiveFilters: boolean;
  onViewDetails: (order: OrderRecord) => void;
}

export function OrdersTable({
  settings,
  orders,
  isLoading,
  hasActiveFilters,
  onViewDetails,
}: OrdersTableProps) {
  if (!orders.length) {
    return (
      <div className="px-5 py-16 text-center sm:px-6">
        <div className="text-lg font-semibold">
          {isLoading ? "Loading orders..." : "No orders yet."}
        </div>
        {hasActiveFilters && !isLoading ? (
          <div className={cn("mt-2", getManagerBodyTextClasses(settings.scheme))}>
            Try clearing filters to see all backend orders.
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <>
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="min-w-[1080px] w-full border-collapse">
            <thead className="sticky top-0 z-10">
              <tr
                className={cn(
                  "border-y border-black/5 backdrop-blur",
                  settings.scheme === "dark" ? "bg-slate-950/92" : "bg-white/92",
                  getManagerTableHeaderClasses(settings.scheme),
                )}
              >
                <th className={getManagerTableHeaderPaddingClasses()}>Order ID</th>
                <th className={getManagerTableHeaderPaddingClasses()}>Table Number</th>
                <th className={getManagerTableHeaderPaddingClasses()}>Customer Name</th>
                <th className={getManagerTableHeaderPaddingClasses()}>Order Date</th>
                <th className={getManagerTableHeaderPaddingClasses()}>Order Status</th>
                <th className={getManagerTableHeaderPaddingClasses()}>Grand Total</th>
                <th className={getManagerTableHeaderPaddingClasses()}>Payment Status</th>
                <th className={getManagerTableHeaderPaddingClasses()}>Items</th>
                <th className={cn(getManagerTableHeaderPaddingClasses(), "text-right")}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr
                  key={order.id || order.order_number || `order-${index}`}
                  className={cn(
                    "group/row border-b border-black/5 transition-all duration-200 ease-out",
                    getManagerTableRowTextClasses(),
                    settings.scheme === "dark"
                      ? "hover:bg-white/[0.045]"
                      : "hover:bg-slate-50/90",
                  )}
                >
                  <td className={cn(getManagerTableCellPaddingClasses(), "align-top")}>
                    <div className="font-semibold">{order.order_number}</div>
                  </td>
                  <td className={cn(getManagerTableCellPaddingClasses(), "align-top font-medium")}>
                    {order.table_id || "N/A"}
                  </td>
                  <td className={cn(getManagerTableCellPaddingClasses(), "align-top")}>
                    <div className="font-medium">{order.customer_name || "N/A"}</div>
                    <div className={cn("mt-1", getManagerBodyTextClasses(settings.scheme))}>
                      {order.customer_phone || "No phone"}
                    </div>
                  </td>
                  <td className={cn(getManagerTableCellPaddingClasses(), "align-top")}>
                    <div className="font-medium">{getRelativeDateLabel(order.placed_at)}</div>
                    <div className={cn("mt-1", getManagerBodyTextClasses(settings.scheme))}>
                      {formatDisplayDate(order.placed_at)}
                    </div>
                  </td>
                  <td className={cn(getManagerTableCellPaddingClasses(), "align-top")}>
                    <StatusBadge settings={settings} type="order" value={order.order_status} />
                  </td>
                  <td className={cn(getManagerTableCellPaddingClasses(), "align-top font-semibold")}>
                    {formatCurrency(order.total_amount)}
                  </td>
                  <td className={cn(getManagerTableCellPaddingClasses(), "align-top")}>
                    <StatusBadge
                      settings={settings}
                      type="payment"
                      value={order.payment_status}
                    />
                  </td>
                  <td className={cn(getManagerTableCellPaddingClasses(), "align-top")}>
                    {getOrderItemCount(order)}
                  </td>
                  <td className={cn(getManagerTableCellPaddingClasses(), "align-top text-right")}>
                    <button
                      type="button"
                      onClick={() => onViewDetails(order)}
                      className={secondaryButtonClassName(settings)}
                      aria-label={`View details for ${order.order_number}`}
                    >
                      <EyeIcon className="mr-2 size-4" />
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-3 md:hidden">
        {orders.map((order, index) => {
          const itemCount = getOrderItemCount(order);

          return (
            <article
              key={order.id || order.order_number || `order-${index}`}
              className={cn(
                "rounded-[18px] border p-5 transition-all duration-200 ease-out",
                settings.scheme === "dark"
                  ? "border-white/10 bg-slate-900/72 hover:border-white/16 hover:bg-slate-900/86"
                  : "border-slate-200/80 bg-slate-50/90 hover:border-slate-300 hover:bg-white",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[1.05rem] font-semibold">{order.order_number}</div>
                  <div className={cn("mt-1", getManagerBodyTextClasses(settings.scheme))}>
                    {order.customer_name || "N/A"}
                  </div>
                </div>
                <StatusBadge settings={settings} type="order" value={order.order_status} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <MobileMeta label="Table Number" value={order.table_id || "N/A"} settings={settings} />
                <MobileMeta
                  label="Order Date"
                  value={getRelativeDateLabel(order.placed_at)}
                  settings={settings}
                />
                <MobileMeta
                  label="Grand Total"
                  value={formatCurrency(order.total_amount)}
                  settings={settings}
                />
                <MobileMeta
                  label="Payment"
                  value={
                    <StatusBadge
                      settings={settings}
                      type="payment"
                      value={order.payment_status}
                    />
                  }
                  settings={settings}
                />
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div className={getManagerBodyTextClasses(settings.scheme)}>
                  {itemCount} item{itemCount === 1 ? "" : "s"}
                </div>
                <button
                  type="button"
                  onClick={() => onViewDetails(order)}
                  className={secondaryButtonClassName(settings)}
                  aria-label={`View details for ${order.order_number}`}
                >
                  <EyeIcon className="mr-2 size-4" />
                  View Details
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

function MobileMeta({
  label,
  value,
  settings,
}: {
  label: string;
  value: React.ReactNode;
  settings: ManagerSettings;
}) {
  return (
    <div className="space-y-1">
      <div
        className={cn(
          "text-[11px] font-semibold uppercase tracking-[0.22em]",
          getMutedTextClasses(settings.scheme),
        )}
      >
        {label}
      </div>
      <div className="text-[15px] font-medium">{value}</div>
    </div>
  );
}
