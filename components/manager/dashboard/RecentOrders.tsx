import {
  cn,
  getContentSurfaceClasses,
  getFocusRingClasses,
  getManagerSectionSubtitleClasses,
  getManagerSectionTitleClasses,
  getMutedTextClasses,
} from "@/components/manager/managerUtils";
import type { ManagerSettings } from "@/components/manager/managerTypes";
import type { RecentOrder } from "@/lib/manager-dashboard-api";

const currencyFormatter = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR",
  maximumFractionDigits: 0,
});

function formatTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unavailable";
  }

  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getStatusBadgeClasses(status: string, scheme: ManagerSettings["scheme"]) {
  const normalized = status.trim().toLowerCase();

  if (normalized === "preparing") {
    return scheme === "dark"
      ? "bg-amber-500/16 text-amber-200 ring-1 ring-inset ring-amber-400/30"
      : "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200";
  }

  if (normalized === "ready") {
    return scheme === "dark"
      ? "bg-violet-500/16 text-violet-200 ring-1 ring-inset ring-violet-400/30"
      : "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200";
  }

  if (normalized === "accepted" || normalized === "pending") {
    return scheme === "dark"
      ? "bg-sky-500/16 text-sky-200 ring-1 ring-inset ring-sky-400/30"
      : "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200";
  }

  return scheme === "dark"
    ? "bg-emerald-500/16 text-emerald-200 ring-1 ring-inset ring-emerald-400/30"
    : "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";
}

export function RecentOrders({
  settings,
  orders,
}: {
  settings: ManagerSettings;
  orders: RecentOrder[];
}) {
  return (
    <div className={cn("rounded-[22px] border p-5 sm:p-6", getContentSurfaceClasses(settings.scheme))}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className={getManagerSectionTitleClasses()}>Recent Orders</h3>
          <p className={getManagerSectionSubtitleClasses(settings.scheme)}>
            Operational view of the latest customer orders
          </p>
        </div>
        <span className={cn("inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]", settings.scheme === "dark" ? "bg-white/8 text-slate-300" : "bg-slate-100 text-slate-500")}>
          Live
        </span>
      </div>

      {orders.length ? (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-y-3">
            <thead>
              <tr className={cn("text-left text-xs font-semibold uppercase tracking-[0.22em]", getMutedTextClasses(settings.scheme))}>
                <th className="px-4 py-2">Order ID</th>
                <th className="px-4 py-2">Table / Customer</th>
                <th className="px-4 py-2">Items</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  tabIndex={0}
                  className={cn(
                    "group/order cursor-pointer rounded-[14px] transition-all duration-200 ease-out focus-visible:outline-none",
                    settings.scheme === "dark"
                      ? "bg-white/5 hover:bg-white/8 hover:shadow-[0_16px_28px_rgba(2,6,23,0.18)]"
                      : "bg-slate-50/90 hover:bg-white hover:shadow-[0_16px_28px_rgba(15,23,42,0.08)]",
                    "hover:-translate-y-0.5",
                    getFocusRingClasses(settings.scheme),
                  )}
                >
                  <td className="rounded-l-[14px] px-4 py-4 font-semibold">{order.orderNumber}</td>
                  <td className="px-4 py-4">{order.tableNumber || order.customerName}</td>
                  <td className="px-4 py-4">{order.itemCount} items</td>
                  <td className="px-4 py-4 font-semibold">{currencyFormatter.format(order.total)}</td>
                  <td className="px-4 py-4">
                    <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize", getStatusBadgeClasses(order.status, settings.scheme))}>
                      {order.status}
                    </span>
                  </td>
                  <td className="rounded-r-[14px] px-4 py-4">{formatTime(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className={cn("mt-6 text-sm", getMutedTextClasses(settings.scheme))}>
          No recent orders are available.
        </p>
      )}
    </div>
  );
}
