import {
  cn,
  getContentSurfaceClasses,
  getInteractiveRowClasses,
  getManagerSectionSubtitleClasses,
  getManagerSectionTitleClasses,
  getMutedTextClasses,
  getSecondarySurfaceClasses,
} from "@/components/manager/managerUtils";
import type { ManagerSettings } from "@/components/manager/managerTypes";
import type { TopSellingItem } from "@/lib/manager-dashboard-api";

const currencyFormatter = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR",
  maximumFractionDigits: 0,
});

export function TopSellingItems({
  settings,
  items,
}: {
  settings: ManagerSettings;
  items: TopSellingItem[];
}) {
  return (
    <div className={cn("h-full rounded-[22px] border p-5 sm:p-6", getContentSurfaceClasses(settings.scheme))}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className={getManagerSectionTitleClasses()}>Top Selling Items</h3>
          <p className={getManagerSectionSubtitleClasses(settings.scheme)}>Best performers today</p>
        </div>
        <span className={cn("inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]", settings.scheme === "dark" ? "bg-white/8 text-slate-300" : "bg-slate-100 text-slate-500")}>
          Live rank
        </span>
      </div>

      <div className="mt-6 space-y-3">
        {items.length ? (
          items.map((item) => (
            <div
              key={item.menuItemId ?? item.name}
              className={cn("flex w-full items-center gap-4 rounded-[18px] border p-4 text-left", getSecondarySurfaceClasses(settings.scheme), getInteractiveRowClasses(settings.scheme))}
            >
              <div className="flex size-11 items-center justify-center rounded-md bg-[linear-gradient(135deg,#2563eb,#38bdf8)] text-sm font-bold text-white">
                {item.rank}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold sm:text-[15px]">{item.name}</div>
                <div className={cn("mt-1 text-sm", getMutedTextClasses(settings.scheme))}>
                  {item.quantitySold} sold
                </div>
              </div>
              <div className="text-right text-sm font-semibold">
                {currencyFormatter.format(item.revenue)}
              </div>
            </div>
          ))
        ) : (
          <p className={cn("text-sm", getMutedTextClasses(settings.scheme))}>
            No sold items recorded for today.
          </p>
        )}
      </div>
    </div>
  );
}
