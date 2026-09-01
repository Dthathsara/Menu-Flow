"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DashboardIcon,
  OrdersIcon,
  QrCodeIcon,
  ReportsIcon,
} from "@/components/manager/icons";
import {
  cn,
  getContentSurfaceClasses,
  getInteractiveCardClasses,
  getManagerBodyTextClasses,
  getManagerPageSectionClasses,
  getManagerPageTitleClasses,
  getManagerPrimaryButtonClasses,
  getManagerSecondaryButtonClasses,
  getMutedTextClasses,
  getSecondarySurfaceClasses,
} from "@/components/manager/managerUtils";
import type { ManagerSettings } from "@/components/manager/managerTypes";
import { getApiErrorMessage } from "@/lib/error-handler";
import {
  fetchManagerDashboard,
  type ManagerDashboardData,
} from "@/lib/manager-dashboard-api";
import { BranchSnapshot } from "./BranchSnapshot";
import { DashboardMetricCard } from "./DashboardMetricCard";
import { DashboardNotifications } from "./DashboardNotifications";
import { DashboardQuickActions } from "./DashboardQuickActions";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { OrderStatusOverview } from "./OrderStatusOverview";
import { QrPerformance } from "./QrPerformance";
import { RecentOrders } from "./RecentOrders";
import { RevenueOrdersChart } from "./RevenueOrdersChart";
import { TopSellingItems } from "./TopSellingItems";

const currencyFormatter = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR",
  maximumFractionDigits: 0,
});

function formatPercent(value: number | null) {
  return value === null ? "Unavailable" : `${value}%`;
}

function formatRating(value: number | null) {
  return value === null ? "Unavailable" : value.toFixed(1);
}

function HeroOverviewCard({
  settings,
  data,
}: {
  settings: ManagerSettings;
  data: ManagerDashboardData;
}) {
  const router = useRouter();
  const secondarySurface = getSecondarySurfaceClasses(settings.scheme);
  const mutedText = getMutedTextClasses(settings.scheme);
  const branchText = data.summary.branchName ? `${data.summary.branchName} Branch` : data.summary.restaurantName;
  const heroStats = [
    {
      title: "Live Orders",
      value: String(data.metrics.liveOrders),
      note: "Active pending, accepted, preparing, and ready orders",
    },
    {
      title: "QR Scans",
      value: String(data.metrics.qrScansToday),
      note: data.qrPerformance.available ? "Recorded today" : "QR scan events unavailable",
    },
    {
      title: "Kitchen Load",
      value: formatPercent(data.metrics.kitchenLoadPercent),
      note: data.metrics.kitchenLoadPercent === null ? "Chef capacity unavailable" : "Based on active kitchen orders",
    },
    {
      title: "Customer Rating",
      value: formatRating(data.metrics.customerRating),
      note: data.metrics.customerRating === null ? "Ratings are not stored yet" : "Current customer rating",
    },
  ];

  return (
    <div className={cn("overflow-hidden rounded-[22px] border p-5 sm:p-6", getContentSurfaceClasses(settings.scheme), getInteractiveCardClasses(settings.scheme))}>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.9fr)]">
        <div className="relative rounded-[18px] border border-transparent bg-[linear-gradient(135deg,rgba(59,130,246,0.16),rgba(14,165,233,0.08),transparent)] p-5 sm:p-6">
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-52 rounded-l-[48px] bg-gradient-to-l from-blue-500/10 to-transparent lg:block" />
          <span className={cn("inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]", settings.scheme === "dark" ? "bg-white/8 text-slate-300" : "bg-slate-100 text-slate-500")}>
            Dashboard
          </span>
          <h2 className={cn("mt-5 max-w-2xl leading-tight", getManagerPageTitleClasses())}>
            {data.summary.greeting}, {data.summary.managerName}. {branchText} is ready for review.
          </h2>
          <p className={cn("mt-4 max-w-2xl", getManagerBodyTextClasses(settings.scheme))}>
            Live orders, revenue, kitchen load, QR availability, and recent activity are loaded from the authenticated restaurant workspace.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => router.push("/manager/reports?tab=orders")}
              className={getManagerPrimaryButtonClasses(settings.scheme)}
            >
              View Today&apos;s Performance
            </button>
            <button
              type="button"
              onClick={() => router.push("/manager/manage-menu")}
              className={getManagerSecondaryButtonClasses(settings.scheme)}
            >
              Manage Menu
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          {heroStats.map((item) => (
            <div key={item.title} className={cn("rounded-[16px] border p-4 sm:p-5", secondarySurface, getInteractiveCardClasses(settings.scheme))}>
              <div className={cn("text-[15px] font-medium", mutedText)}>{item.title}</div>
              <div className="mt-4 text-[2rem] font-bold tracking-tight">{item.value}</div>
              <div className={cn("mt-3", getManagerBodyTextClasses(settings.scheme))}>{item.note}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DashboardErrorState({
  settings,
  message,
  onRetry,
}: {
  settings: ManagerSettings;
  message: string;
  onRetry: () => void;
}) {
  return (
    <section className={getManagerPageSectionClasses()}>
      <div className={cn("rounded-[22px] border p-5 sm:p-6", getContentSurfaceClasses(settings.scheme))}>
        <h2 className="text-lg font-semibold">Unable to load manager dashboard.</h2>
        <p className={cn("mt-2 text-sm", getMutedTextClasses(settings.scheme))}>{message}</p>
        <button type="button" onClick={onRetry} className={cn("mt-5", getManagerPrimaryButtonClasses(settings.scheme))}>
          Retry
        </button>
      </div>
    </section>
  );
}

export function ManagerDashboardOverview({ settings }: { settings: ManagerSettings }) {
  const [data, setData] = useState<ManagerDashboardData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const requestRef = useRef<Promise<ManagerDashboardData> | null>(null);

  async function loadDashboard(force = false) {
    setLoading(true);
    setError("");

    try {
      if (force) {
        requestRef.current = null;
      }

      if (!requestRef.current) {
        requestRef.current = fetchManagerDashboard();
      }

      const nextData = await requestRef.current;
      setData(nextData);
    } catch (loadError) {
      if (process.env.NODE_ENV === "development") {
        const is402 =
          typeof loadError === "object" &&
          loadError !== null &&
          "status" in loadError &&
          (loadError as { status?: number }).status === 402;

        if (!is402) {
          console.error(loadError);
        }
      }

      setError(getApiErrorMessage(loadError, "Unable to load dashboard data. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  if (loading && !data) {
    return <DashboardSkeleton settings={settings} />;
  }

  if (error && !data) {
    return <DashboardErrorState settings={settings} message={error} onRetry={() => void loadDashboard(true)} />;
  }

  if (!data) {
    return <DashboardErrorState settings={settings} message="Dashboard data is empty." onRetry={() => void loadDashboard(true)} />;
  }

  return (
    <section className={getManagerPageSectionClasses()}>
      {error ? (
        <div className={cn("rounded-[18px] border px-4 py-3 text-sm", settings.scheme === "dark" ? "border-amber-400/20 bg-amber-500/10 text-amber-100" : "border-amber-200 bg-amber-50 text-amber-700")}>
          {error}
        </div>
      ) : null}

      <HeroOverviewCard settings={settings} data={data} />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.7fr)]">
        <OrderStatusOverview settings={settings} overview={data.orderStatus} />

        <div className="grid gap-6 sm:grid-cols-2">
          <DashboardMetricCard
            settings={settings}
            title="Revenue Today"
            value={currencyFormatter.format(data.metrics.revenueToday)}
            note="Paid order revenue recorded today"
            tag="Today"
            icon={ReportsIcon}
            accent="from-blue-500 to-cyan-400"
          />
          <DashboardMetricCard
            settings={settings}
            title="Total Orders Today"
            value={String(data.metrics.totalOrdersToday)}
            note="Orders placed today"
            tag="Orders"
            icon={OrdersIcon}
            accent="from-violet-500 to-fuchsia-400"
          />
          <DashboardMetricCard
            settings={settings}
            title="Avg Prep Time"
            value={`${data.metrics.averagePreparationMinutes} min`}
            note="Average time from accepted/preparing to ready"
            tag="Kitchen"
            icon={DashboardIcon}
            accent="from-amber-500 to-orange-400"
          />
          <DashboardMetricCard
            settings={settings}
            title="Active QR Sessions"
            value={String(data.metrics.activeQrSessions)}
            note={data.qrPerformance.available ? "Currently active QR sessions" : "Session tracking is unavailable"}
            tag="Engagement"
            icon={QrCodeIcon}
            accent="from-emerald-500 to-teal-400"
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.95fr)]">
        <RevenueOrdersChart settings={settings} trend={data.revenueTrend} />
        <TopSellingItems settings={settings} items={data.topSellingItems} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.95fr)]">
        <RecentOrders settings={settings} orders={data.recentOrders} />
        <QrPerformance settings={settings} qrPerformance={data.qrPerformance} />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <DashboardNotifications settings={settings} notifications={data.notifications} />
        <BranchSnapshot settings={settings} snapshot={data.branchSnapshot} />
        <DashboardQuickActions settings={settings} data={data} />
      </section>

    </section>
  );
}
