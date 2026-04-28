import { cn, getManagerStrongTextClasses } from "../../managerUtils";
import type { ManagerSettings } from "../../managerTypes";
import { peakHoursData } from "../reports.data";
import { getProgressToneClasses, getTrackClasses } from "../reports.helpers";
import { ReportsSectionCard } from "../ReportsSectionCard";

interface PeakHoursCardProps {
  settings: ManagerSettings;
}

export function PeakHoursCard({ settings }: PeakHoursCardProps) {
  return (
    <ReportsSectionCard
      settings={settings}
      title="Peak Hours"
      description="Busiest ordering windows across the reporting period."
      tag="TIME INSIGHTS"
      className="h-full"
    >
      <div className="space-y-5">
        {peakHoursData.map((item) => (
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
        ))}
      </div>
    </ReportsSectionCard>
  );
}
