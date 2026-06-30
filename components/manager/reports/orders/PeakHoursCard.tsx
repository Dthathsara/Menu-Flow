import { cn, getManagerStrongTextClasses } from "../../managerUtils";
import type { ManagerSettings } from "../../managerTypes";
import { getProgressToneClasses, getTrackClasses } from "../reports.helpers";
import { ReportsSectionCard } from "../ReportsSectionCard";
import type { OrdersReportProgressMetric } from "../reports.types";

interface PeakHoursCardProps {
  settings: ManagerSettings;
  items: OrdersReportProgressMetric[];
  isLoading?: boolean;
}

export function PeakHoursCard({ settings, items, isLoading = false }: PeakHoursCardProps) {
  return (
    <ReportsSectionCard
      settings={settings}
      title="Peak Hours"
      description="Busiest ordering windows across the reporting period."
      tag="TIME INSIGHTS"
      className="h-full"
    >
      <div className="space-y-5">
        {isLoading ? (
          <div className="py-8 text-center text-[14px] font-semibold text-slate-400">
            Loading peak hours...
          </div>
        ) : items.length ? items.map((item) => (
          <div key={item.label}>
            <div
              className={cn(
                "mb-2 flex items-center justify-between gap-3 text-[14px] font-semibold",
                getManagerStrongTextClasses(settings.scheme),
              )}
            >
              <span>{item.label}</span>
              <span>{item.valueLabel}</span>
            </div>
            <div className={cn("h-2.5 rounded-full p-[1px]", getTrackClasses(settings.scheme))}>
              <div
                className={cn("h-full rounded-full", getProgressToneClasses(item.tone, settings.scheme))}
                style={{ width: `${(item.value / item.max) * 100}%` }}
              />
            </div>
          </div>
        )) : (
          <div className="py-8 text-center text-[14px] font-semibold text-slate-400">
            No peak hour data available.
          </div>
        )}
      </div>
    </ReportsSectionCard>
  );
}
