"use client";

import { useState } from "react";
import {
  cn,
  getManagerSecondaryButtonClasses,
  getManagerTextInputClasses,
} from "@/components/manager/managerUtils";
import type { ManagerSettings } from "@/components/manager/managerTypes";
import { WaiterOrderModal } from "@/components/waiter/WaiterOrderModal";
import { WaiterStatusBadge } from "@/components/waiter/WaiterStatusBadge";
import type { WaiterOrder } from "@/components/waiter/types";
import { formatChefTime } from "./chef-utils";
import type { ChefOrder, ChefOrderStatus } from "./types";

const MY_ORDER_FLOW: ChefOrderStatus[] = ["preparing", "ready", "delivered"];

function toWaiterOrder(order: ChefOrder): WaiterOrder {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    table: order.table,
    customer: order.customer,
    items: order.items.map((item) => ({
      name: item.size ? `${item.name} (${item.size})` : item.name,
      quantity: item.quantity,
      note: item.note,
    })),
    notes: order.notes,
    status: order.status,
    time: order.time,
    paymentStatus: "pending",
    waiterId: order.chefId,
    waiterName: order.chefName,
  };
}

function nextStatusFor(status: ChefOrderStatus) {
  if (status === "preparing") {
    return "ready";
  }

  if (status === "ready") {
    return "delivered";
  }

  return null;
}

export function ChefOrderTable({
  settings,
  orders,
  mode,
  pendingOrderId,
  onStartPreparing,
  onMoveToReady,
  onMoveToDelivered,
}: {
  settings: ManagerSettings;
  orders: ChefOrder[];
  mode: "accepted" | "assigned" | "readonly";
  pendingOrderId: string;
  onStartPreparing?: (orderId: string) => Promise<void>;
  onMoveToReady?: (orderId: string) => Promise<void>;
  onMoveToDelivered?: (orderId: string) => Promise<void>;
}) {
  const [selectedOrder, setSelectedOrder] = useState<ChefOrder | null>(null);

  async function handleStatusChange(order: ChefOrder, status: ChefOrderStatus) {
    if (status === order.status) {
      return;
    }

    if (order.status === "preparing" && status === "ready") {
      await onMoveToReady?.(order.id);
      return;
    }

    if (order.status === "ready" && status === "delivered") {
      await onMoveToDelivered?.(order.id);
    }
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-[980px] w-full text-left text-sm">
          <thead className={cn("border-b text-xs uppercase tracking-[0.18em]", settings.scheme === "dark" ? "border-white/10 text-slate-400" : "border-slate-200 text-slate-500")}>
            <tr>
              <th className="px-3 py-3 font-semibold">Order</th>
              <th className="px-3 py-3 font-semibold">Table</th>
              <th className="px-3 py-3 font-semibold">Customer</th>
              <th className="px-3 py-3 font-semibold">Items</th>
              <th className="px-3 py-3 font-semibold">Time</th>
              <th className="px-3 py-3 font-semibold">Status</th>
              <th className="px-3 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className={cn("divide-y", settings.scheme === "dark" ? "divide-white/10" : "divide-slate-100")}>
            {orders.map((order, index) => {
              const busy = pendingOrderId === order.id;
              const nextStatus = nextStatusFor(order.status);

              return (
                <tr key={order.id || `${order.orderNumber}-${index}`} className={settings.scheme === "dark" ? "hover:bg-white/5" : "hover:bg-slate-50"}>
                  <td className="max-w-[180px] px-3 py-4 font-semibold">
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="max-w-full truncate text-left underline-offset-4 hover:underline"
                    >
                      {order.orderNumber}
                    </button>
                  </td>
                  <td className="px-3 py-4">{order.table}</td>
                  <td className="px-3 py-4">{order.customer}</td>
                  <td className="px-3 py-4">
                    {order.items.reduce((total, item) => total + item.quantity, 0)}
                  </td>
                  <td className="px-3 py-4">{formatChefTime(order.acceptedAt || order.time)}</td>
                  <td className="px-3 py-4">
                    <WaiterStatusBadge status={order.status} settings={settings} />
                  </td>
                  <td className="px-3 py-4">
                    {mode === "accepted" ? (
                      <button
                        type="button"
                        onClick={() => onStartPreparing?.(order.id)}
                        disabled={busy}
                        className={cn(getManagerSecondaryButtonClasses(settings.scheme), "h-10 rounded-[14px] px-4 text-sm disabled:cursor-not-allowed disabled:opacity-60")}
                      >
                        {busy ? "Starting..." : "Start Preparing"}
                      </button>
                    ) : mode === "assigned" && order.status !== "delivered" ? (
                      <select
                        value={order.status}
                        disabled={busy}
                        onChange={(event) => void handleStatusChange(order, event.target.value as ChefOrderStatus)}
                        className={cn(getManagerTextInputClasses(settings.scheme), "h-10 min-w-36 py-0 text-sm capitalize disabled:opacity-60")}
                      >
                        {MY_ORDER_FLOW.map((status) => (
                          <option
                            key={status}
                            value={status}
                            disabled={status !== order.status && status !== nextStatus}
                          >
                            {status}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-sm">Locked</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <WaiterOrderModal
        settings={settings}
        order={selectedOrder ? toWaiterOrder(selectedOrder) : null}
        onClose={() => setSelectedOrder(null)}
      />
    </>
  );
}
