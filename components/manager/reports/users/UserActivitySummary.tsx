import { cn, getManagerStrongTextClasses } from "../../managerUtils";
import type { ManagerSettings } from "../../managerTypes";
import { staffActivitySummary } from "../reports.data";
import { getReportsMicroLabelClasses, getReportsMutedTextClasses, getReportsPanelClasses } from "../reports.helpers";
import { ReportsSectionCard } from "../ReportsSectionCard";

interface UserActivitySummaryProps {
  settings: ManagerSettings;
}

export function UserActivitySummary({ settings }: UserActivitySummaryProps) {
  return (
    <ReportsSectionCard
      settings={settings}
      title="User Activity Summary"
      description="Most active staff highlights, revenue ownership, and service coverage benchmarks."
      tag="TEAM INSIGHTS"
      className="h-full"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {staffActivitySummary.map((item) => (
          <div key={item.label} className={cn(getReportsPanelClasses(settings.scheme), "p-4 sm:p-5")}>
            <div className={getReportsMicroLabelClasses(settings.scheme)}>{item.label}</div>
            <div
              className={cn(
                "mt-3 text-[1.2rem] font-semibold tracking-[-0.01em] sm:text-[1.35rem]",
                getManagerStrongTextClasses(settings.scheme),
              )}
            >
              {item.value}
            </div>
            <p className={cn("mt-2 text-[13px] leading-6", getReportsMutedTextClasses(settings.scheme))}>
              {item.helperText}
            </p>
          </div>
        ))}
      </div>
    </ReportsSectionCard>
  );
}
