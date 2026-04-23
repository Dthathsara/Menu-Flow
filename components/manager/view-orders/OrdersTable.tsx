import { cn, getMutedTextClasses } from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import { EyeIcon } from "./order-icons";
import { calculateOrderGrandTotal, getOrderItemCount } from "./order-data";
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
  onViewDetails: (order: OrderRecord) => void;
}

export function OrdersTable({ settings, orders, onViewDetails }: OrdersTableProps) {
  if (!orders.length) {
    return (
      <div className="px-5 py-16 text-center sm:px-6">
        <div className="text-base font-semibold">No orders match the current filters.</div>
        <div className={cn("mt-2 text-sm", getMutedTextClasses(settings.scheme))}>
          Try broadening the search or clearing filters to see more orders.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full border-collapse">
            <thead className="sticky top-0 z-10">
              <tr
                className={cn(
                  "border-y border-black/5 text-left text-[11px] font-semibold uppercase tracking-[0.22em] backdrop-blur",
                  settings.scheme === "dark" ? "bg-slate-950/92" : "bg-white/92",
                  getMutedTextClasses(settings.scheme),
                )}
              >
                <th className="px-5 py-4">Order ID</th>
                <th className="px-5 py-4">Table Number</th>
                <th className="px-5 py-4">Customer Name</th>
                <th className="px-5 py-4">Order Date</th>
                <th className="px-5 py-4">Order Status</th>
                <th className="px-5 py-4">Grand Total</th>
                <th className="px-5 py-4">Payment Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const itemCount = getOrderItemCount(order);

                return (
                  <tr
                    key={order.id}
                    className={cn(
                      "group/row border-b border-black/5 transition-all duration-200 ease-out",
                      settings.scheme === "dark"
                        ? "hover:bg-white/[0.045]"
                        : "hover:bg-slate-50/90",
                    )}
                  >
                    <td className="px-5 py-4 align-top">
                      <div className="font-semibold">{order.orderId}</div>
                      <div className={cn("mt-1 text-sm", getMutedTextClasses(settings.scheme))}>
                        {itemCount} item{itemCount === 1 ? "" : "s"}
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top font-medium">{order.tableNumber}</td>
                    <td className="px-5 py-4 align-top">
                      <div className="font-medium">{order.customerName}</div>
                      <div className={cn("mt-1 text-sm", getMutedTextClasses(settings.scheme))}>
                        {order.waiterName}
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div className="font-medium">{getRelativeDateLabel(order.createdAt)}</div>
                      <div className={cn("mt-1 text-sm", getMutedTextClasses(settings.scheme))}>
                        {formatDisplayDate(order.createdAt)}
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <StatusBadge settings={settings} type="order" value={order.orderStatus} />
                    </td>
                    <td className="px-5 py-4 align-top font-semibold">
                      {formatCurrency(calculateOrderGrandTotal(order))}
                    </td>
                    <td className="px-5 py-4 align-top">
                      <StatusBadge
                        settings={settings}
                        type="payment"
                        value={order.paymentStatus}
                      />
                    </td>
                    <td className="px-5 py-4 align-top text-right">
                      <button
                        type="button"
                        onClick={() => onViewDetails(order)}
                        className={cn(secondaryButtonClassName(settings), "h-10 px-4")}
                        aria-label={`View details for ${order.orderId}`}
                      >
                        <EyeIcon className="mr-2 size-4" />
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-3 md:hidden">
        {orders.map((order) => {
          const itemCount = getOrderItemCount(order);

          return (
            <article
              key={order.id}
              className={cn(
                "rounded-[18px] border p-4 transition-all duration-200 ease-out",
                settings.scheme === "dark"
                  ? "border-white/10 bg-slate-900/72 hover:border-white/16 hover:bg-slate-900/86"
                  : "border-slate-200/80 bg-slate-50/90 hover:border-slate-300 hover:bg-white",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold">{order.orderId}</div>
                  <div className={cn("mt-1 text-sm", getMutedTextClasses(settings.scheme))}>
                    {order.customerName}
                  </div>
                </div>
                <StatusBadge settings={settings} type="order" value={order.orderStatus} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <MobileMeta label="Table Number" value={order.tableNumber} settings={settings} />
                <MobileMeta
                  label="Order Date"
                  value={getRelativeDateLabel(order.createdAt)}
                  settings={settings}
                />
                <MobileMeta
                  label="Grand Total"
                  value={formatCurrency(calculateOrderGrandTotal(order))}
                  settings={settings}
                />
                <MobileMeta
                  label="Payment"
                  value={
                    <StatusBadge
                      settings={settings}
                      type="payment"
                      value={order.paymentStatus}
                    />
                  }
                  settings={settings}
                />
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div className={cn("text-sm", getMutedTextClasses(settings.scheme))}>
                  {itemCount} item{itemCount === 1 ? "" : "s"}
                </div>
                <button
                  type="button"
                  onClick={() => onViewDetails(order)}
                  className={cn(secondaryButtonClassName(settings), "h-10 px-4")}
                  aria-label={`View details for ${order.orderId}`}
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
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}
