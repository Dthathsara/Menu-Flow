"use client";

import { useMemo, useState } from "react";
import { BellIcon, ClockIcon, HomeIcon, OrdersIcon, SearchIcon } from "@/components/manager/icons";
import {
  cn,
  getManagerPageSectionClasses,
  getManagerPageSubtitleClasses,
  getManagerPageTitleClasses,
  getManagerPrimaryButtonClasses,
  getManagerSecondaryButtonClasses,
  getManagerSectionSubtitleClasses,
  getManagerSectionTitleClasses,
  getManagerTextInputClasses,
  getSearchInputClasses,
} from "@/components/manager/managerUtils";
import { getStoredWaiterIdentity } from "@/lib/waiter-api";
import type { WaiterNavKey, WaiterOrder, WaiterOrderStatus, WaiterPageProps, WaiterTable } from "./types";
import { WaiterEmptyState } from "./WaiterEmptyState";
import { WaiterLoading } from "./WaiterLoading";
import { WaiterOrderModal } from "./WaiterOrderModal";
import { WaiterQuickActions } from "./WaiterQuickActions";
import { WaiterStatCard } from "./WaiterStatCard";
import { formatWaiterTime, getWorkspaceBadgeClasses, WaiterSurface } from "./waiter-utils";
import { WaiterStatusBadge } from "./WaiterStatusBadge";
import { WaiterTableCard } from "./WaiterTableCard";

interface WaiterPagesProps extends WaiterPageProps {
  activeKey: WaiterNavKey;
}

const SERVICE_ORDER_STATUSES = ["accepted", "preparing", "ready", "delivered"] as const;
type ServiceOrderStatus = (typeof SERVICE_ORDER_STATUSES)[number];
const ORDER_FLOW = ["pending", ...SERVICE_ORDER_STATUSES] as const;
const SERVICE_ORDER_LABELS: Record<ServiceOrderStatus, string> = {
  accepted: "Accepted",
  preparing: "Preparing",
  ready: "Ready",
  delivered: "Delivered",
};
const ORDER_STATUS_RANK: Record<ServiceOrderStatus, number> = {
  accepted: 0,
  preparing: 1,
  ready: 2,
  delivered: 3,
};

const NEXT_STATUS_BY_STATUS: Partial<Record<WaiterOrderStatus, WaiterOrderStatus>> = {
  pending: "accepted",
  accepted: "preparing",
  preparing: "ready",
  ready: "delivered",
};

function PageHero({ title, subtitle, settings }: { title: string; subtitle: string; settings: WaiterPageProps["settings"] }) {
  return (
    <WaiterSurface settings={settings}>
      <span className={getWorkspaceBadgeClasses(settings.scheme)}>
        Waiter workspace
      </span>
      <h2 className={cn("mt-5", getManagerPageTitleClasses())}>{title}</h2>
      <p className={getManagerPageSubtitleClasses(settings.scheme)}>{subtitle}</p>
    </WaiterSurface>
  );
}

function isServiceOrderStatus(status: WaiterOrderStatus): status is ServiceOrderStatus {
  return SERVICE_ORDER_STATUSES.includes(status as ServiceOrderStatus);
}

function isTodayOrder(order: WaiterOrder) {
  if (!order.time) {
    return true;
  }

  const parsed = new Date(order.time);

  if (Number.isNaN(parsed.getTime())) {
    return true;
  }

  const today = new Date();
  return (
    parsed.getFullYear() === today.getFullYear() &&
    parsed.getMonth() === today.getMonth() &&
    parsed.getDate() === today.getDate()
  );
}

function sortServiceOrders(orders: WaiterOrder[]) {
  return [...orders].sort((left, right) => {
    const statusSort =
      ORDER_STATUS_RANK[left.status as ServiceOrderStatus] -
      ORDER_STATUS_RANK[right.status as ServiceOrderStatus];

    if (statusSort !== 0) {
      return statusSort;
    }

    const leftTime = Date.parse(left.time);
    const rightTime = Date.parse(right.time);
    return (Number.isFinite(rightTime) ? rightTime : 0) - (Number.isFinite(leftTime) ? leftTime : 0);
  });
}

function sortOldestOrders(orders: WaiterOrder[]) {
  return [...orders].sort((left, right) => {
    const leftTime = Date.parse(left.time);
    const rightTime = Date.parse(right.time);
    return (Number.isFinite(leftTime) ? leftTime : 0) - (Number.isFinite(rightTime) ? rightTime : 0);
  });
}

function isAssignedToCurrentWaiter(order: WaiterOrder) {
  const { waiterId, waiterName } = getStoredWaiterIdentity();

  if (waiterId && order.waiterId) {
    return order.waiterId === waiterId;
  }

  if (waiterName && order.waiterName) {
    return order.waiterName.trim().toLowerCase() === waiterName.trim().toLowerCase();
  }

  return !order.waiterId && !order.waiterName;
}

function getPendingOrders(orders: WaiterOrder[]) {
  return sortOldestOrders(orders.filter((order) => order.status === "pending"));
}

function getMyOrders(orders: WaiterOrder[]) {
  return sortServiceOrders(orders.filter((order) => isServiceOrderStatus(order.status) && isAssignedToCurrentWaiter(order)));
}

function getOrderCounts(orders: WaiterOrder[]) {
  return {
    today: orders.length,
    accepted: orders.filter((order) => order.status === "accepted").length,
    preparing: orders.filter((order) => order.status === "preparing").length,
    ready: orders.filter((order) => order.status === "ready").length,
    delivered: orders.filter((order) => order.status === "delivered").length,
  };
}

function OrderRows({
  settings,
  orders,
  onSelect,
  onUpdateOrderStatus,
  mode,
}: {
  settings: WaiterPageProps["settings"];
  orders: WaiterOrder[];
  onSelect?: (order: WaiterOrder) => void;
  onUpdateOrderStatus?: (orderId: string, status: WaiterOrderStatus) => Promise<void>;
  mode?: "pending" | "service" | "readonly";
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className={cn("border-b text-xs uppercase tracking-[0.18em]", settings.scheme === "dark" ? "border-white/10 text-slate-400" : "border-slate-200 text-slate-500")}>
          <tr>
            <th className="px-3 py-3 font-semibold">Order</th>
            <th className="px-3 py-3 font-semibold">Table</th>
            <th className="px-3 py-3 font-semibold">Customer</th>
            <th className="px-3 py-3 font-semibold">Items</th>
            <th className="px-3 py-3 font-semibold">Time</th>
            <th className="px-3 py-3 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody className={cn("divide-y", settings.scheme === "dark" ? "divide-white/10" : "divide-slate-100")}>
          {orders.map((order, index) => (
            <tr key={order.id || `${order.orderNumber || "order"}-${index}`} className={cn(onSelect && "cursor-pointer", settings.scheme === "dark" ? "hover:bg-white/5" : "hover:bg-slate-50")}>
              <td className="px-3 py-4 font-semibold" onClick={() => onSelect?.(order)}>{order.orderNumber}</td>
              <td className="px-3 py-4" onClick={() => onSelect?.(order)}>{order.table}</td>
              <td className="px-3 py-4" onClick={() => onSelect?.(order)}>{order.customer}</td>
              <td className="px-3 py-4" onClick={() => onSelect?.(order)}>
                {order.items.reduce((total, item) => total + item.quantity, 0)}
              </td>
              <td className="px-3 py-4" onClick={() => onSelect?.(order)}>{formatWaiterTime(order.time)}</td>
              <td className="px-3 py-4">
                {onUpdateOrderStatus && mode === "pending" ? (
                  <button
                    type="button"
                    onClick={() => onUpdateOrderStatus(order.id, "accepted")}
                    className={cn(getManagerSecondaryButtonClasses(settings.scheme), "h-10 rounded-[14px] px-4 text-sm")}
                  >
                    Accept
                  </button>
                ) : onUpdateOrderStatus && mode === "service" ? (
                  <select
                    value={order.status}
                    onChange={(event) => {
                      const nextStatus = event.target.value as WaiterOrderStatus;
                      if (nextStatus !== order.status) {
                        void onUpdateOrderStatus(order.id, nextStatus);
                      }
                    }}
                    className={cn(getManagerTextInputClasses(settings.scheme), "h-10 min-w-32 py-0 text-sm capitalize")}
                  >
                    {ORDER_FLOW.map((status) => (
                      <option
                        key={status}
                        value={status}
                        disabled={status !== order.status && status !== NEXT_STATUS_BY_STATUS[order.status]}
                      >
                        {status === "pending" ? "Pending" : SERVICE_ORDER_LABELS[status]}
                      </option>
                    ))}
                  </select>
                ) : (
                  <WaiterStatusBadge status={order.status} settings={settings} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DashboardPage(props: WaiterPagesProps) {
  const todayOrders = getMyOrders(props.orders.filter(isTodayOrder));
  const counts = getOrderCounts(todayOrders);
  const readyTables = props.tables.filter((table) => table.status === "ready").length;
  const occupiedTables = props.tables.filter((table) => table.status !== "available").length;
  const recentOrders = todayOrders.slice(0, 6);
  const maxChartValue = Math.max(counts.accepted, counts.preparing, counts.ready, counts.delivered, 1);

  return (
    <section className={getManagerPageSectionClasses()}>
      <PageHero title="Waiter Dashboard" subtitle="Track today's orders, table state, quick actions, and ready-to-serve tickets." settings={props.settings} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <WaiterStatCard settings={props.settings} title="Today's Orders" value={String(counts.today)} note="Accepted through delivered only" icon={OrdersIcon} />
        <WaiterStatCard settings={props.settings} title="Accepted" value={String(counts.accepted)} note="Ready for waiter action" icon={ClockIcon} />
        <WaiterStatCard settings={props.settings} title="Preparing" value={String(counts.preparing)} note="Kitchen is working" icon={OrdersIcon} />
        <WaiterStatCard settings={props.settings} title="Ready" value={String(counts.ready)} note="Ready to serve" icon={BellIcon} />
        <WaiterStatCard settings={props.settings} title="Delivered" value={String(counts.delivered)} note="Completed tables" icon={HomeIcon} />
      </div>
      <WaiterSurface settings={props.settings}>
        <h3 className={getManagerSectionTitleClasses()}>Quick Actions</h3>
        <p className={getManagerSectionSubtitleClasses(props.settings.scheme)}>Common waiter actions for a busy service shift.</p>
        <div className="mt-5"><WaiterQuickActions settings={props.settings} /></div>
      </WaiterSurface>
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <WaiterSurface settings={props.settings}>
          <h3 className={getManagerSectionTitleClasses()}>Recent Orders</h3>
          <p className={getManagerSectionSubtitleClasses(props.settings.scheme)}>Today&apos;s accepted, preparing, ready, and delivered orders.</p>
          <div className="mt-5">
            {recentOrders.length ? (
              <OrderRows settings={props.settings} orders={recentOrders} onUpdateOrderStatus={props.onUpdateOrderStatus} mode="service" />
            ) : (
              <WaiterEmptyState settings={props.settings} title="No orders today" message="No accepted, preparing, ready, or delivered orders are available for today." />
            )}
          </div>
        </WaiterSurface>
        <WaiterSurface settings={props.settings}>
          <h3 className={getManagerSectionTitleClasses()}>Summary Chart</h3>
          <div className="mt-5 space-y-4">
            {SERVICE_ORDER_STATUSES.map((status) => {
              const value = counts[status];
              const width = `${Math.max((value / maxChartValue) * 100, value ? 8 : 0)}%`;
              return (
                <div key={status}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>{SERVICE_ORDER_LABELS[status]}</span>
                    <strong>{value}</strong>
                  </div>
                  <div className={cn("h-3 overflow-hidden rounded-full", props.settings.scheme === "dark" ? "bg-white/8" : "bg-slate-100")}>
                    <div className="h-full rounded-full bg-[linear-gradient(135deg,#2563eb,#38bdf8)]" style={{ width }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 space-y-4 border-t border-white/10 pt-5">
            <div className="flex justify-between"><span>Occupied</span><strong>{occupiedTables}</strong></div>
            <div className="flex justify-between"><span>Ready to serve</span><strong>{readyTables}</strong></div>
            <div className="flex justify-between"><span>Total tables</span><strong>{props.tables.length}</strong></div>
          </div>
        </WaiterSurface>
      </section>
    </section>
  );
}

function OrdersPage(props: WaiterPagesProps) {
  const [query, setQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<WaiterOrder | null>(null);
  const visibleOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return getPendingOrders(props.orders).filter((order) => {
      const matchesQuery =
        !normalizedQuery ||
        [order.orderNumber, order.table, order.customer, order.notes]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      return matchesQuery;
    });
  }, [props.orders, query]);

  return (
    <>
      <section className={getManagerPageSectionClasses()}>
        <PageHero title="Orders" subtitle="Accept pending orders from the backend queue, oldest first." settings={props.settings} />
        <WaiterSurface settings={props.settings}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <label className={cn("flex h-11 min-w-0 items-center gap-2 rounded-lg border px-3 lg:w-[360px]", getSearchInputClasses(props.settings.topbar, props.settings.scheme))}>
              <SearchIcon className="size-4" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search orders, tables, customers..."
                className="w-full bg-transparent text-sm outline-none placeholder:inherit"
              />
            </label>
            <button type="button" onClick={props.onRefresh} className={cn(getManagerSecondaryButtonClasses(props.settings.scheme), "h-11 rounded-[14px] px-4 text-sm")}>
              Refresh
            </button>
          </div>
          <div className="mt-5">
            {props.isLoading ? <WaiterLoading settings={props.settings} /> : null}
            {visibleOrders.length ? (
              <OrderRows settings={props.settings} orders={visibleOrders} onSelect={setSelectedOrder} onUpdateOrderStatus={props.onUpdateOrderStatus} mode="pending" />
            ) : (
              <WaiterEmptyState settings={props.settings} title="No pending orders" message="There are no pending backend orders matching your search." />
            )}
          </div>
        </WaiterSurface>
      </section>
      <WaiterOrderModal settings={props.settings} order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </>
  );
}

function MyOrdersPage(props: WaiterPagesProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | ServiceOrderStatus>("all");
  const [selectedOrder, setSelectedOrder] = useState<WaiterOrder | null>(null);
  const visibleOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return getMyOrders(props.orders).filter((order) => {
      const matchesStatus = status === "all" || order.status === status;
      const matchesQuery =
        !normalizedQuery ||
        [order.orderNumber, order.table, order.customer, order.notes]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      return matchesStatus && matchesQuery;
    });
  }, [props.orders, query, status]);

  return (
    <>
      <section className={getManagerPageSectionClasses()}>
        <PageHero title="My Orders" subtitle="Only orders accepted by your waiter account are shown here." settings={props.settings} />
        <WaiterSurface settings={props.settings}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <label className={cn("flex h-11 min-w-0 items-center gap-2 rounded-lg border px-3 lg:w-[360px]", getSearchInputClasses(props.settings.topbar, props.settings.scheme))}>
              <SearchIcon className="size-4" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search my orders, tables, customers..."
                className="w-full bg-transparent text-sm outline-none placeholder:inherit"
              />
            </label>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as "all" | ServiceOrderStatus)}
              className={cn(getManagerTextInputClasses(props.settings.scheme), "h-11 lg:w-52")}
            >
              <option value="all">All statuses</option>
              {SERVICE_ORDER_STATUSES.map((item) => (
                <option key={item} value={item}>{SERVICE_ORDER_LABELS[item]}</option>
              ))}
            </select>
          </div>
          <div className="mt-5">
            {props.isLoading ? <WaiterLoading settings={props.settings} /> : null}
            {visibleOrders.length ? (
              <OrderRows settings={props.settings} orders={visibleOrders} onSelect={setSelectedOrder} onUpdateOrderStatus={props.onUpdateOrderStatus} mode="service" />
            ) : (
              <WaiterEmptyState settings={props.settings} title="No assigned orders" message="Accepted orders assigned to you will appear here." />
            )}
          </div>
        </WaiterSurface>
      </section>
      <WaiterOrderModal settings={props.settings} order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </>
  );
}

function TablesPage(props: WaiterPagesProps) {
  const [selectedOrder, setSelectedOrder] = useState<WaiterOrder | null>(null);

  function handleSelectTable(table: WaiterTable) {
    const order = props.orders.find((item) => item.id === table.currentOrderId);
    setSelectedOrder(order ?? null);
  }

  return (
    <>
      <section className={getManagerPageSectionClasses()}>
        <PageHero title="Tables" subtitle="Tap a table to open its current order when one is attached." settings={props.settings} />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {props.tables.map((table, index) => (
            <WaiterTableCard key={table.id || `${table.name || "table"}-${index}`} settings={props.settings} table={table} onSelect={handleSelectTable} />
          ))}
        </div>
      </section>
      <WaiterOrderModal settings={props.settings} order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </>
  );
}

function NotificationsPage(props: WaiterPagesProps) {
  const [query, setQuery] = useState("");
  const acceptedOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return sortServiceOrders(props.orders.filter((order) => {
      if (order.status !== "accepted") {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [order.orderNumber, order.table, order.customer, order.notes]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    }));
  }, [props.orders, query]);

  return (
    <section className={getManagerPageSectionClasses()}>
      <PageHero title="Notifications" subtitle="New accepted orders for your restaurant only." settings={props.settings} />
      <WaiterSurface settings={props.settings}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className={getManagerSectionTitleClasses()}>Accepted Orders</h3>
            <p className={getManagerSectionSubtitleClasses(props.settings.scheme)}>Pending orders are not shown here.</p>
          </div>
          <label className={cn("flex h-11 min-w-0 items-center gap-2 rounded-lg border px-3 lg:w-[360px]", getSearchInputClasses(props.settings.topbar, props.settings.scheme))}>
            <SearchIcon className="size-4" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search accepted orders..."
              className="w-full bg-transparent text-sm outline-none placeholder:inherit"
            />
          </label>
        </div>
        <div className="mt-5">
          {acceptedOrders.length ? (
            <OrderRows settings={props.settings} orders={acceptedOrders} />
          ) : (
            <WaiterEmptyState settings={props.settings} title="No new accepted orders" message="There are no accepted orders matching your search." />
          )}
        </div>
      </WaiterSurface>
    </section>
  );
}

function ProfilePage(props: WaiterPagesProps) {
  const [form, setForm] = useState({ name: "", phone: "", password: "", profilePictureUrl: "" });

  return (
    <section className={getManagerPageSectionClasses()}>
      <PageHero title="Profile" subtitle="Edit waiter profile picture, name, phone, and password." settings={props.settings} />
      <WaiterSurface settings={props.settings}>
        <div className="grid gap-4 md:grid-cols-2">
          <input className={getManagerTextInputClasses(props.settings.scheme)} placeholder="Profile picture URL" value={form.profilePictureUrl} onChange={(event) => setForm((current) => ({ ...current, profilePictureUrl: event.target.value }))} />
          <input className={getManagerTextInputClasses(props.settings.scheme)} placeholder="Name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
          <input className={getManagerTextInputClasses(props.settings.scheme)} placeholder="Phone" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
          <input className={getManagerTextInputClasses(props.settings.scheme)} placeholder="New password" type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} />
        </div>
        <button type="button" className={cn("mt-5", getManagerPrimaryButtonClasses(props.settings.scheme))}>Save Profile</button>
      </WaiterSurface>
    </section>
  );
}

export function WaiterPages(props: WaiterPagesProps) {
  if (props.errorMessage) {
    return (
      <section className={getManagerPageSectionClasses()}>
        <WaiterEmptyState settings={props.settings} title="Backend unavailable" message={props.errorMessage} />
      </section>
    );
  }

  if (props.activeKey === "orders") {
    return <OrdersPage {...props} />;
  }

  if (props.activeKey === "my-orders") {
    return <MyOrdersPage {...props} />;
  }

  if (props.activeKey === "tables") {
    return <TablesPage {...props} />;
  }

  if (props.activeKey === "notifications") {
    return <NotificationsPage {...props} />;
  }

  if (props.activeKey === "profile") {
    return <ProfilePage {...props} />;
  }

  return <DashboardPage {...props} />;
}
