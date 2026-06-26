"use client";

import { useEffect, useState } from "react";
import {
  BellIcon,
  DashboardIcon,
  MenuBookIcon,
  OrdersIcon,
  QrCodeIcon,
  ReportsIcon,
  SettingsIcon,
  UsersIcon,
} from "./icons";
import {
  cn,
  getContentSurfaceClasses,
  getFocusRingClasses,
  getInteractiveCardClasses,
  getInteractiveRowClasses,
  getInteractiveSecondaryButtonClasses,
  getManagerBodyTextClasses,
  getManagerPageSectionClasses,
  getManagerPageTitleClasses,
  getManagerPrimaryButtonClasses,
  getManagerSecondaryButtonClasses,
  getManagerSectionSubtitleClasses,
  getManagerSectionTitleClasses,
  getMutedTextClasses,
  getSecondarySurfaceClasses,
} from "./managerUtils";
import type { ManagerSettings } from "./managerTypes";

interface DashboardContentProps {
  settings: ManagerSettings;
}

type LoggedInUser = {
  contactPersonName?: string;
  firstName?: string;
  lastName?: string;
  businessEmail?: string;
};

interface StatCardItem {
  title: string;
  value: string;
  note: string;
}

interface StatusRowItem {
  label: string;
  count: number;
  progress: number;
  tone: string;
}

interface KpiItem {
  title: string;
  value: string;
  note: string;
  tag: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}

interface TopSellingItem {
  rank: number;
  name: string;
  sold: string;
  revenue: string;
}

type OrderState = "Preparing" | "Ready" | "Accepted" | "Delivered";

interface RecentOrderRow {
  orderId: string;
  tableOrCustomer: string;
  items: string;
  total: string;
  status: OrderState;
  time: string;
}

const heroStats: StatCardItem[] = [
  {
    title: "Live Orders",
    value: "38",
    note: "+12% vs yesterday",
  },
  {
    title: "QR Scans",
    value: "214",
    note: "Peak at 12:30 PM",
  },
  {
    title: "Kitchen Load",
    value: "76%",
    note: "Healthy capacity",
  },
  {
    title: "Customer Rating",
    value: "4.8",
    note: "Stable this week",
  },
];

const orderStatusRows: StatusRowItem[] = [
  { label: "Accepted", count: 18, progress: 33, tone: "bg-sky-500" },
  { label: "Preparing", count: 26, progress: 48, tone: "bg-amber-500" },
  { label: "Ready", count: 12, progress: 22, tone: "bg-violet-500" },
  { label: "Delivered", count: 54, progress: 100, tone: "bg-emerald-500" },
];

const kpiItems: KpiItem[] = [
  {
    title: "Revenue Today",
    value: "Rs. 48,260",
    note: "+8.4% compared with yesterday",
    tag: "Today",
    icon: ReportsIcon,
    accent: "from-blue-500 to-cyan-400",
  },
  {
    title: "Total Orders Today",
    value: "186",
    note: "+14.2% lunch traffic improved",
    tag: "Orders",
    icon: OrdersIcon,
    accent: "from-violet-500 to-fuchsia-400",
  },
  {
    title: "Avg Prep Time",
    value: "13 min",
    note: "-2 min faster than weekly average",
    tag: "Kitchen",
    icon: DashboardIcon,
    accent: "from-amber-500 to-orange-400",
  },
  {
    title: "Active QR Sessions",
    value: "72",
    note: "+19.5% high table-side activity",
    tag: "Engagement",
    icon: QrCodeIcon,
    accent: "from-emerald-500 to-teal-400",
  },
];

const topSellingItems: TopSellingItem[] = [
  {
    rank: 1,
    name: "Grilled Chicken Bowl",
    sold: "42 sold",
    revenue: "Rs. 18,900",
  },
  {
    rank: 2,
    name: "Seafood Noodles",
    sold: "35 sold",
    revenue: "Rs. 15,400",
  },
  {
    rank: 3,
    name: "Classic Burger Combo",
    sold: "31 sold",
    revenue: "Rs. 13,200",
  },
  {
    rank: 4,
    name: "Caesar Salad",
    sold: "24 sold",
    revenue: "Rs. 8,700",
  },
];

const recentOrders: RecentOrderRow[] = [
  {
    orderId: "#ORD-1048",
    tableOrCustomer: "Table 08",
    items: "4 items",
    total: "Rs. 2,860",
    status: "Preparing",
    time: "12:42 PM",
  },
  {
    orderId: "#ORD-1047",
    tableOrCustomer: "Amaya R.",
    items: "2 items",
    total: "Rs. 1,220",
    status: "Ready",
    time: "12:39 PM",
  },
  {
    orderId: "#ORD-1046",
    tableOrCustomer: "Table 03",
    items: "5 items",
    total: "Rs. 3,440",
    status: "Accepted",
    time: "12:35 PM",
  },
  {
    orderId: "#ORD-1045",
    tableOrCustomer: "Noah P.",
    items: "3 items",
    total: "Rs. 1,980",
    status: "Delivered",
    time: "12:28 PM",
  },
];

const qrPerformanceRows = [
  {
    label: "QR Scans Today",
    value: "214",
    note: "Across all active tables",
  },
  {
    label: "Peak Scan Window",
    value: "12:00–1:00",
    note: "Highest customer activity",
  },
  {
    label: "Top Scanned Category",
    value: "Seafood",
    note: "Most viewed menu section",
  },
  {
    label: "Active Sessions",
    value: "72",
    note: "Customers currently browsing",
  },
];

const notifications = [
  {
    title: "New bulk order received",
    note: "Table 12 placed a high-value lunch order",
    time: "2 min ago",
  },
  {
    title: "Order marked ready",
    note: "Order #ORD-1047 is ready for pickup",
    time: "5 min ago",
  },
  {
    title: "QR scans passed lunch target",
    note: "Engagement exceeded expected noon traffic",
    time: "14 min ago",
  },
];

const branchSnapshotRows = [
  { label: "Active Staff", value: "18" },
  { label: "Kitchen Efficiency", value: "91%" },
  { label: "Dining Capacity Used", value: "68%" },
  { label: "Complaints Logged", value: "2" },
];

const quickActions = [
  "Add New Dish",
  "Generate QR Batch",
  "Open Orders Queue",
  "Download Daily Report",
];

const trendDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const revenueSeries = [38, 44, 47, 42, 51, 58, 54];
const orderSeries = [72, 88, 94, 86, 109, 122, 116];

function buildLinePoints(values: number[], width: number, height: number) {
  const paddingX = 34;
  const paddingTop = 22;
  const paddingBottom = 34;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  return values.map((value, index) => {
    const x =
      paddingX + (index * (width - paddingX * 2)) / Math.max(values.length - 1, 1);
    const y =
      paddingTop +
      ((max - value) / range) * (height - paddingTop - paddingBottom);

    return { x, y, value };
  });
}

function buildPath(points: Array<{ x: number; y: number }>) {
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
}

function getStatusBadgeClasses(status: OrderState, scheme: ManagerSettings["scheme"]) {
  if (status === "Preparing") {
    return scheme === "dark"
      ? "bg-amber-500/16 text-amber-200 ring-1 ring-inset ring-amber-400/30"
      : "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200";
  }

  if (status === "Ready") {
    return scheme === "dark"
      ? "bg-violet-500/16 text-violet-200 ring-1 ring-inset ring-violet-400/30"
      : "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200";
  }

  if (status === "Accepted") {
    return scheme === "dark"
      ? "bg-sky-500/16 text-sky-200 ring-1 ring-inset ring-sky-400/30"
      : "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200";
  }

  return scheme === "dark"
    ? "bg-emerald-500/16 text-emerald-200 ring-1 ring-inset ring-emerald-400/30"
    : "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";
}

function SectionPill({
  children,
  scheme,
}: {
  children: React.ReactNode;
  scheme: ManagerSettings["scheme"];
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase",
        scheme === "dark"
          ? "bg-white/8 text-slate-300"
          : "bg-slate-100 text-slate-500",
      )}
    >
      {children}
    </span>
  );
}

function getDisplayName(user: LoggedInUser | null) {
  return (
    user?.contactPersonName ||
    (user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.businessEmail || "User")
  );
}

function SurfaceCard({
  settings,
  className,
  children,
  interactive = true,
}: {
  settings: ManagerSettings;
  className?: string;
  children: React.ReactNode;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[22px] border p-5 sm:p-6",
        getContentSurfaceClasses(settings.scheme),
        interactive && getInteractiveCardClasses(settings.scheme),
        className,
      )}
    >
      {children}
    </div>
  );
}

function CardHeader({
  title,
  subtitle,
  scheme,
  action,
}: {
  title: string;
  subtitle: string;
  scheme: ManagerSettings["scheme"];
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h3 className={getManagerSectionTitleClasses()}>{title}</h3>
        <p className={getManagerSectionSubtitleClasses(scheme)}>{subtitle}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function HeroOverviewCard({
  settings,
  displayName,
}: {
  settings: ManagerSettings;
  displayName: string;
}) {
  const secondarySurface = getSecondarySurfaceClasses(settings.scheme);
  const mutedText = getMutedTextClasses(settings.scheme);

  return (
    <SurfaceCard settings={settings} className="overflow-hidden">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.9fr)]">
        <div className="relative rounded-[18px] border border-transparent bg-[linear-gradient(135deg,rgba(59,130,246,0.16),rgba(14,165,233,0.08),transparent)] p-5 sm:p-6">
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-52 rounded-l-[48px] bg-gradient-to-l from-blue-500/10 to-transparent lg:block" />
          <SectionPill scheme={settings.scheme}>Dashboard</SectionPill>
          <h2 className={cn("mt-5 max-w-2xl leading-tight", getManagerPageTitleClasses())}>
            Good afternoon, {displayName}. Downtown Branch is running smoothly.
          </h2>
          <p className={cn("mt-4 max-w-2xl", getManagerBodyTextClasses(settings.scheme))}>
            Lunch traffic is trending above target, kitchen throughput remains
            stable, and QR engagement is holding strong across active tables.
            Today&apos;s operational snapshot is ready for quick review.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className={getManagerPrimaryButtonClasses(settings.scheme)}
            >
              View Today&apos;s Performance
            </button>
            <button
              type="button"
              className={getManagerSecondaryButtonClasses(settings.scheme)}
            >
              Manage Menu
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          {heroStats.map((item) => (
            <div
              key={item.title}
              className={cn(
                "rounded-[16px] border p-4 sm:p-5",
                secondarySurface,
                getInteractiveCardClasses(settings.scheme),
              )}
            >
              <div className={cn("text-[15px] font-medium", mutedText)}>{item.title}</div>
              <div className="mt-4 text-[2rem] font-bold tracking-tight">{item.value}</div>
              <div className={cn("mt-3", getManagerBodyTextClasses(settings.scheme))}>{item.note}</div>
            </div>
          ))}
        </div>
      </div>
    </SurfaceCard>
  );
}

function OrderStatusCard({ settings }: { settings: ManagerSettings }) {
  const secondarySurface = getSecondarySurfaceClasses(settings.scheme);

  return (
    <SurfaceCard settings={settings}>
      <CardHeader
        title="Order Status Overview"
        subtitle="Live distribution of active and completed orders"
        scheme={settings.scheme}
      />

      <div className="mt-6 space-y-5">
        {orderStatusRows.map((row) => (
          <div key={row.label} className="space-y-2.5">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium">{row.label}</span>
              <span className={cn("font-semibold", getMutedTextClasses(settings.scheme))}>
                {row.count}
              </span>
            </div>
            <div className={cn("h-2.5 rounded-full", secondarySurface)}>
              <div
                className={cn("h-full rounded-full", row.tone)}
                style={{ width: `${row.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        {[
          "Generate New QR Code",
          "Open Kitchen Queue",
          "Add Menu Item",
          "View All Orders",
        ].map((action) => (
          <button
            key={action}
            type="button"
            className={cn(getManagerSecondaryButtonClasses(settings.scheme), "px-4")}
          >
            {action}
          </button>
        ))}
      </div>
    </SurfaceCard>
  );
}

function KpiCard({
  item,
  settings,
}: {
  item: KpiItem;
  settings: ManagerSettings;
}) {
  const Icon = item.icon;

  return (
    <SurfaceCard settings={settings} className="group/kpi h-full">
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex size-12 items-center justify-center rounded-md bg-gradient-to-br text-white shadow-[0_16px_28px_rgba(15,23,42,0.16)] transition-all duration-200 ease-out group-hover/kpi:scale-[1.03] group-hover/kpi:brightness-110",
            item.accent,
          )}
        >
          <Icon className="size-5" />
        </div>
        <SectionPill scheme={settings.scheme}>{item.tag}</SectionPill>
      </div>
      <div className="mt-5">
        <div className={cn("text-sm font-medium", getMutedTextClasses(settings.scheme))}>
          {item.title}
        </div>
        <div className="mt-2 text-[1.85rem] font-bold tracking-tight">{item.value}</div>
        <div className={cn("mt-3", getManagerBodyTextClasses(settings.scheme))}>
          {item.note}
        </div>
      </div>
    </SurfaceCard>
  );
}

function TrendChartCard({ settings }: { settings: ManagerSettings }) {
  const chartWidth = 720;
  const chartHeight = 260;
  const revenuePoints = buildLinePoints(revenueSeries, chartWidth, chartHeight);
  const orderPoints = buildLinePoints(orderSeries, chartWidth, chartHeight);
  const linePath = buildPath(revenuePoints);
  const orderPath = buildPath(orderPoints);
  const baseY = chartHeight - 34;
  const areaPath = `${linePath} L ${revenuePoints[revenuePoints.length - 1]?.x ?? 0} ${baseY} L ${revenuePoints[0]?.x ?? 0} ${baseY} Z`;

  return (
    <SurfaceCard settings={settings} className="h-full">
      <CardHeader
        title="Revenue & Orders Trend"
        subtitle="Daily performance across the last 7 days"
        scheme={settings.scheme}
        action={<SectionPill scheme={settings.scheme}>Orders / Revenue</SectionPill>}
      />

      <div
        className={cn(
          "mt-6 rounded-[18px] border p-5",
          getSecondarySurfaceClasses(settings.scheme),
          "transition-all duration-200 ease-out",
        )}
      >
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-blue-500" />
            <span className={getMutedTextClasses(settings.scheme)}>Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-cyan-400" />
            <span className={getMutedTextClasses(settings.scheme)}>Orders</span>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <div className="min-w-[620px]">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="h-[260px] w-full"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="revenueArea" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.24" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
                </linearGradient>
                <linearGradient id="ordersLine" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.65" />
                </linearGradient>
              </defs>

              {[0, 1, 2, 3].map((row) => {
                const y = 32 + row * 50;

                return (
                  <line
                    key={row}
                    x1="18"
                    x2={chartWidth - 18}
                    y1={y}
                    y2={y}
                    stroke={settings.scheme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(148,163,184,0.22)"}
                    strokeDasharray="6 8"
                  />
                );
              })}

              {orderPoints.map((point, index) => (
                <rect
                  key={trendDays[index]}
                  x={point.x - 20}
                  y={point.y}
                  width="40"
                  height={baseY - point.y}
                  rx="16"
                  fill={settings.scheme === "dark" ? "rgba(34,211,238,0.12)" : "rgba(34,211,238,0.16)"}
                />
              ))}

              <path d={areaPath} fill="url(#revenueArea)" />
              <path
                d={linePath}
                stroke="#3b82f6"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d={orderPath}
                stroke="url(#ordersLine)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                strokeDasharray="8 8"
              />

              {revenuePoints.map((point) => (
                <g key={`${point.x}-${point.y}`}>
                  <circle cx={point.x} cy={point.y} r="7" fill="#ffffff" />
                  <circle cx={point.x} cy={point.y} r="4" fill="#2563eb" />
                </g>
              ))}
            </svg>

            <div className="mt-3 grid grid-cols-7 gap-2">
              {trendDays.map((day) => (
                <div
                  key={day}
                  className={cn(
                    "text-center text-xs font-semibold uppercase tracking-[0.22em]",
                    getMutedTextClasses(settings.scheme),
                  )}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}

function TopSellingCard({ settings }: { settings: ManagerSettings }) {
  return (
    <SurfaceCard settings={settings} className="h-full">
      <CardHeader
        title="Top Selling Items"
        subtitle="Best performers today"
        scheme={settings.scheme}
        action={<SectionPill scheme={settings.scheme}>Live rank</SectionPill>}
      />

      <div className="mt-6 space-y-3">
        {topSellingItems.map((item) => (
          <button
            key={item.rank}
            type="button"
            className={cn(
              "group/sell flex w-full items-center gap-4 rounded-[18px] border p-4 text-left",
              getSecondarySurfaceClasses(settings.scheme),
              getInteractiveRowClasses(settings.scheme),
              "hover:translate-x-1",
            )}
          >
            <div className="flex size-11 items-center justify-center rounded-md bg-[linear-gradient(135deg,#2563eb,#38bdf8)] text-sm font-bold text-white">
              {item.rank}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold sm:text-[15px]">
                {item.name}
              </div>
              <div className={cn("mt-1 text-sm", getMutedTextClasses(settings.scheme))}>
                {item.sold}
              </div>
            </div>
            <div className="text-right text-sm font-semibold">{item.revenue}</div>
          </button>
        ))}
      </div>
    </SurfaceCard>
  );
}

function RecentOrdersTable({ settings }: { settings: ManagerSettings }) {
  return (
    <SurfaceCard settings={settings}>
      <CardHeader
        title="Recent Orders"
        subtitle="Operational view of the latest customer orders"
        scheme={settings.scheme}
        action={<SectionPill scheme={settings.scheme}>Updated 2m ago</SectionPill>}
      />

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-[720px] w-full border-separate border-spacing-y-3">
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
            {recentOrders.map((order) => (
              <tr
                key={order.orderId}
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
                <td className="rounded-l-[14px] px-4 py-4 font-semibold">{order.orderId}</td>
                <td className="px-4 py-4">{order.tableOrCustomer}</td>
                <td className="px-4 py-4">{order.items}</td>
                <td className="px-4 py-4 font-semibold">{order.total}</td>
                <td className="px-4 py-4">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 ease-out group-hover/order:brightness-105",
                      getStatusBadgeClasses(order.status, settings.scheme),
                    )}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="rounded-r-[14px] px-4 py-4">{order.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SurfaceCard>
  );
}

function QrPerformanceCard({ settings }: { settings: ManagerSettings }) {
  return (
    <SurfaceCard settings={settings} className="h-full">
      <CardHeader
        title="QR Performance"
        subtitle="Digital menu engagement snapshot"
        scheme={settings.scheme}
        action={<SectionPill scheme={settings.scheme}>Today</SectionPill>}
      />

      <div className="mt-6 space-y-3">
        {qrPerformanceRows.map((row) => (
          <button
            key={row.label}
            type="button"
            className={cn(
              "w-full rounded-[18px] border p-4 text-left",
              getSecondarySurfaceClasses(settings.scheme),
              getInteractiveRowClasses(settings.scheme),
            )}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm font-semibold">{row.label}</div>
              <div className="text-sm font-bold">{row.value}</div>
            </div>
            <div className={cn("mt-2 text-sm leading-6", getMutedTextClasses(settings.scheme))}>
              {row.note}
            </div>
          </button>
        ))}
      </div>
    </SurfaceCard>
  );
}

function NotificationsCard({ settings }: { settings: ManagerSettings }) {
  return (
    <SurfaceCard settings={settings} className="h-full">
      <CardHeader
        title="Notifications"
        subtitle="Latest branch activity"
        scheme={settings.scheme}
      />

      <div className="mt-6 space-y-3">
        {notifications.map((item) => (
          <button
            key={item.title}
            type="button"
            className={cn(
              "group/notice w-full rounded-[18px] border p-4 text-left",
              getSecondarySurfaceClasses(settings.scheme),
              getInteractiveRowClasses(settings.scheme),
            )}
          >
            <div className="flex items-start gap-3">
              <span className="mt-1 flex size-9 items-center justify-center rounded-md bg-[linear-gradient(135deg,#2563eb,#38bdf8)] text-white transition-all duration-200 ease-out group-hover/notice:scale-[1.03] group-hover/notice:brightness-110">
                <BellIcon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">{item.title}</div>
                <div className={cn("mt-1 text-sm leading-6", getMutedTextClasses(settings.scheme))}>
                  {item.note}
                </div>
                <div className={cn("mt-2 text-xs font-medium uppercase tracking-[0.22em]", getMutedTextClasses(settings.scheme))}>
                  {item.time}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </SurfaceCard>
  );
}

function BranchSnapshotCard({ settings }: { settings: ManagerSettings }) {
  return (
    <SurfaceCard settings={settings} className="h-full">
      <CardHeader
        title="Branch Snapshot"
        subtitle="Today&apos;s operational health"
        scheme={settings.scheme}
      />

      <div className="mt-6 space-y-3">
        {branchSnapshotRows.map((row) => (
          <button
            key={row.label}
            type="button"
            className={cn(
              "group/snapshot flex w-full items-center justify-between rounded-[18px] border p-4 text-left",
              getSecondarySurfaceClasses(settings.scheme),
              getInteractiveRowClasses(settings.scheme),
            )}
          >
            <span className="text-sm font-medium">{row.label}</span>
            <span className="text-sm font-bold transition-colors duration-200 ease-out group-hover/snapshot:text-blue-500">
              {row.value}
            </span>
          </button>
        ))}
      </div>
    </SurfaceCard>
  );
}

function QuickActionsCard({ settings }: { settings: ManagerSettings }) {
  const actionIcons = [MenuBookIcon, QrCodeIcon, OrdersIcon, SettingsIcon];

  return (
    <SurfaceCard settings={settings} className="h-full">
      <CardHeader
        title="Quick Actions"
        subtitle="Manager shortcuts"
        scheme={settings.scheme}
      />

      <div className="mt-6 grid gap-3">
        {quickActions.map((action, index) => {
          const Icon = actionIcons[index] ?? UsersIcon;

          return (
            <button
              key={action}
              type="button"
              className={cn(
                "group/action flex items-center gap-3 rounded-[18px] border px-4 py-4 text-left text-[15px] font-semibold",
                settings.scheme === "dark"
                  ? "border-white/10 bg-white/6 hover:bg-white/9"
                  : "border-slate-200 bg-slate-50 hover:bg-white",
                getInteractiveSecondaryButtonClasses(settings.scheme),
              )}
            >
              <span className="flex size-10 items-center justify-center rounded-md bg-[linear-gradient(135deg,#2563eb,#38bdf8)] text-white transition-all duration-200 ease-out group-hover/action:scale-[1.03] group-hover/action:brightness-110">
                <Icon className="size-4.5" />
              </span>
              <span>{action}</span>
            </button>
          );
        })}
      </div>
    </SurfaceCard>
  );
}

export function DashboardContent({ settings }: DashboardContentProps) {
  const [user, setUser] = useState<LoggedInUser | null>(null);
  const displayName = getDisplayName(user);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <section className={getManagerPageSectionClasses()}>
      <HeroOverviewCard settings={settings} displayName={displayName} />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.7fr)]">
        <OrderStatusCard settings={settings} />

        <div className="grid gap-6 sm:grid-cols-2">
          {kpiItems.map((item) => (
            <KpiCard key={item.title} item={item} settings={settings} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.95fr)]">
        <TrendChartCard settings={settings} />
        <TopSellingCard settings={settings} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.95fr)]">
        <RecentOrdersTable settings={settings} />
        <QrPerformanceCard settings={settings} />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <NotificationsCard settings={settings} />
        <BranchSnapshotCard settings={settings} />
        <QuickActionsCard settings={settings} />
      </section>
    </section>
  );
}
