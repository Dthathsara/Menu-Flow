import { cn, getManagerPrimaryButtonClasses, getManagerSecondaryButtonClasses, getMutedTextClasses } from "@/components/manager/managerUtils";
import type { ManagerSettings } from "@/components/manager/managerTypes";
import type { WaiterOrder, WaiterOrderStatus } from "./types";
import { WaiterStatusBadge } from "./WaiterStatusBadge";
import { formatWaiterTime, WaiterSurface } from "./waiter-utils";

const actionsByStatus: Record<WaiterOrderStatus, WaiterOrderStatus[]> = {
  pending: ["accepted"],
  accepted: ["preparing"],
  preparing: ["ready"],
  ready: ["delivered"],
  delivered: [],
};

function getActionLabel(status: WaiterOrderStatus) {
  if (status === "accepted") {
    return "Accept";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function WaiterOrderCard({
  settings,
  order,
  onView,
  onUpdateStatus,
}: {
  settings: ManagerSettings;
  order: WaiterOrder;
  onView: (order: WaiterOrder) => void;
  onUpdateStatus: (orderId: string, status: WaiterOrderStatus) => Promise<void>;
}) {
  const actions = actionsByStatus[order.status];

  return (
    <WaiterSurface settings={settings} className="p-4 sm:p-5">
      <button type="button" onClick={() => onView(order)} className="w-full text-left">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-base font-semibold">{order.orderNumber}</p>
            <p className={cn("mt-1 text-sm", getMutedTextClasses(settings.scheme))}>
              {order.table} · {order.customer} · {formatWaiterTime(order.time)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <WaiterStatusBadge status={order.status} settings={settings} />
            <WaiterStatusBadge status={order.paymentStatus} settings={settings} />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {order.items.map((item, index) => (
            <div key={`${item.name}-${index}`} className="flex justify-between gap-3 text-sm">
              <span>{item.name}</span>
              <span className="font-semibold">x{item.quantity}</span>
            </div>
          ))}
        </div>

        {order.notes ? (
          <p className={cn("mt-4 rounded-lg px-3 py-2 text-sm", settings.scheme === "dark" ? "bg-white/6 text-slate-300" : "bg-slate-50 text-slate-600")}>
            Notes: {order.notes}
          </p>
        ) : null}
      </button>

      {actions.length ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {actions.map((action, index) => (
            <button
              key={action}
              type="button"
              onClick={() => onUpdateStatus(order.id, action)}
              className={cn(
                index === 0
                  ? getManagerPrimaryButtonClasses(settings.scheme)
                  : getManagerSecondaryButtonClasses(settings.scheme),
                "h-10 rounded-[14px] px-4 text-sm",
              )}
            >
              {getActionLabel(action)}
            </button>
          ))}
        </div>
      ) : null}
    </WaiterSurface>
  );
}
