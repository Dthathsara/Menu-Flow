"use client";

import { BellIcon, ClockIcon, HomeIcon, OrdersIcon } from "@/components/manager/icons";
import {
  cn,
  getManagerPageSectionClasses,
  getManagerPageSubtitleClasses,
  getManagerPageTitleClasses,
  getManagerSectionSubtitleClasses,
  getManagerSectionTitleClasses,
  getMutedTextClasses,
} from "@/components/manager/managerUtils";
import { WaiterEmptyState } from "@/components/waiter/WaiterEmptyState";
import { WaiterLoading } from "@/components/waiter/WaiterLoading";
import { WaiterStatCard } from "@/components/waiter/WaiterStatCard";
import { getWorkspaceBadgeClasses, WaiterSurface } from "@/components/waiter/waiter-utils";
import { ChefOrderTable } from "./ChefOrderTable";
import type { ChefPageProps } from "./types";

function PageHero({ settings }: Pick<ChefPageProps, "settings">) {
  return (
    <WaiterSurface settings={settings}>
      <span className={getWorkspaceBadgeClasses(settings.scheme)}>
        Chef workspace
      </span>
      <h2 className={cn("mt-5", getManagerPageTitleClasses())}>Chef Dashboard</h2>
      <p className={getManagerPageSubtitleClasses(settings.scheme)}>
        Track today&apos;s accepted, preparing, ready, and completed kitchen activity.
      </p>
    </WaiterSurface>
  );
}

export function ChefDashboardOverview(props: ChefPageProps) {
  const summary = props.summary;
  const statusCounts = summary?.statusCounts ?? {
    accepted: 0,
    preparing: 0,
    ready: 0,
    delivered: 0,
  };
  const maxStatusValue = Math.max(...Object.values(statusCounts), 1);
  const maxHourlyValue = Math.max(...(summary?.hourlyActivity.map((item) => item.count) ?? [0]), 1);
  const recentOrders = (summary?.recentOrders.length
    ? summary.recentOrders
    : [...props.acceptedOrders, ...props.myOrders])
    .sort((left, right) => (Date.parse(right.updatedAt || right.time) || 0) - (Date.parse(left.updatedAt || left.time) || 0))
    .slice(0, 6);

  return (
    <section className={getManagerPageSectionClasses()}>
      <PageHero settings={props.settings} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <WaiterStatCard settings={props.settings} title="Today's Accepted" value={String(summary?.acceptedOrdersToday ?? 0)} note="Accepted orders from backend" icon={OrdersIcon} />
        <WaiterStatCard settings={props.settings} title="My Preparing" value={String(summary?.myPreparingOrders ?? 0)} note="Assigned to your account" icon={ClockIcon} />
        <WaiterStatCard settings={props.settings} title="Ready Orders" value={String(summary?.readyOrders ?? 0)} note="Ready for service" icon={BellIcon} />
        <WaiterStatCard settings={props.settings} title="Completed Today" value={String(summary?.completedToday ?? 0)} note="Delivered by kitchen flow" icon={HomeIcon} />
        <WaiterStatCard settings={props.settings} title="Avg Prep Time" value={`${summary?.averagePreparationTimeMinutes ?? 0}m`} note="From kitchen history" icon={ClockIcon} />
      </div>

      {props.isLoading ? <WaiterLoading settings={props.settings} /> : null}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <WaiterSurface settings={props.settings}>
          <h3 className={getManagerSectionTitleClasses()}>Recent Kitchen Orders</h3>
          <p className={getManagerSectionSubtitleClasses(props.settings.scheme)}>Accepted, preparing, ready, and delivered orders from the backend.</p>
          <div className="mt-5">
            {recentOrders.length ? (
              <ChefOrderTable
                settings={props.settings}
                orders={recentOrders}
                mode="readonly"
                pendingOrderId={props.pendingOrderId}
              />
            ) : (
              <WaiterEmptyState settings={props.settings} title="No kitchen orders" message="No accepted or assigned orders are available for today." />
            )}
          </div>
        </WaiterSurface>

        <WaiterSurface settings={props.settings}>
          <h3 className={getManagerSectionTitleClasses()}>Status Summary</h3>
          <div className="mt-5 space-y-4">
            {(["accepted", "preparing", "ready", "delivered"] as const).map((status) => {
              const value = statusCounts[status];
              const width = `${Math.max((value / maxStatusValue) * 100, value ? 8 : 0)}%`;

              return (
                <div key={status}>
                  <div className="mb-2 flex justify-between text-sm capitalize">
                    <span>{status}</span>
                    <strong>{value}</strong>
                  </div>
                  <div className={cn("h-3 overflow-hidden rounded-full", props.settings.scheme === "dark" ? "bg-white/8" : "bg-slate-100")}>
                    <div className="h-full rounded-full bg-[linear-gradient(135deg,#2563eb,#38bdf8)]" style={{ width }} />
                  </div>
                </div>
              );
            })}
          </div>
        </WaiterSurface>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <WaiterSurface settings={props.settings}>
          <h3 className={getManagerSectionTitleClasses()}>Hourly Activity</h3>
          <div className="mt-5 flex h-48 items-end gap-2 overflow-x-auto">
            {(summary?.hourlyActivity ?? []).map((item) => (
              <div key={item.hour} className="flex min-w-10 flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-md bg-[linear-gradient(180deg,#38bdf8,#2563eb)]"
                  style={{ height: `${Math.max((item.count / maxHourlyValue) * 160, item.count ? 12 : 2)}px` }}
                  title={`${item.hour}: ${item.count}`}
                />
                <span className={cn("text-[11px]", getMutedTextClasses(props.settings.scheme))}>{item.hour}</span>
              </div>
            ))}
            {summary?.hourlyActivity.length === 0 ? (
              <p className={getMutedTextClasses(props.settings.scheme)}>No hourly order activity is available yet.</p>
            ) : null}
          </div>
        </WaiterSurface>

        <WaiterSurface settings={props.settings}>
          <h3 className={getManagerSectionTitleClasses()}>Top Ordered Items</h3>
          <div className="mt-5 space-y-3">
            {(summary?.topItems ?? []).map((item, index) => (
              <div key={item.id || item.name} className={cn("flex items-center justify-between rounded-lg border px-4 py-3", props.settings.scheme === "dark" ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50")}>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{index + 1}. {item.name}</p>
                </div>
                <strong>{item.quantity}</strong>
              </div>
            ))}
            {summary?.topItems.length === 0 ? (
              <WaiterEmptyState settings={props.settings} title="No top items" message="Top item data will appear after orders are placed today." />
            ) : null}
          </div>
        </WaiterSurface>
      </section>
    </section>
  );
}
