import {
  cn,
  getContentSurfaceClasses,
  getManagerSectionSubtitleClasses,
  getManagerSectionTitleClasses,
  getMutedTextClasses,
  getSecondarySurfaceClasses,
} from "@/components/manager/managerUtils";
import type { ManagerSettings } from "@/components/manager/managerTypes";
import type { OrderStatusOverview as OrderStatusOverviewData, OrderStatusKey } from "@/lib/manager-dashboard-api";

const statusTones: Record<OrderStatusKey, string> = {
  pending: "bg-slate-500",
  accepted: "bg-sky-500",
  preparing: "bg-amber-500",
  ready: "bg-violet-500",
  delivered: "bg-emerald-500",
};

export function OrderStatusOverview({
  settings,
  overview,
}: {
  settings: ManagerSettings;
  overview: OrderStatusOverviewData;
}) {
  return (
    <div className={cn("rounded-[22px] border p-5 sm:p-6", getContentSurfaceClasses(settings.scheme))}>
      <div>
        <h3 className={getManagerSectionTitleClasses()}>Order Status Overview</h3>
        <p className={getManagerSectionSubtitleClasses(settings.scheme)}>
          Real distribution of current restaurant orders
        </p>
      </div>

      <div className="mt-6 space-y-5">
        {overview.rows.map((row) => (
          <div key={row.key} className="space-y-2.5">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium">{row.label}</span>
              <span className={cn("font-semibold", getMutedTextClasses(settings.scheme))}>
                {row.count}
              </span>
            </div>
            <div className={cn("h-2.5 rounded-full", getSecondarySurfaceClasses(settings.scheme))}>
              <div
                className={cn("h-full rounded-full", statusTones[row.key])}
                style={{ width: `${row.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {overview.total === 0 ? (
        <p className={cn("mt-6 text-sm", getMutedTextClasses(settings.scheme))}>
          No tracked orders are available yet.
        </p>
      ) : null}
    </div>
  );
}
