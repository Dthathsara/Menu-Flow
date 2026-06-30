import { cn, getManagerStrongTextClasses } from "../../managerUtils";
import type { ManagerSettings } from "../../managerTypes";
import { getReportsMicroLabelClasses, getReportsMutedTextClasses, getReportsPanelClasses } from "../reports.helpers";
import { ReportsSectionCard } from "../ReportsSectionCard";
import type { StaffActivitySummaryItem, UserReportActivitySummary } from "../reports.types";

interface UserActivitySummaryProps {
  settings: ManagerSettings;
  summary: UserReportActivitySummary | null;
}

export function UserActivitySummary({ settings, summary }: UserActivitySummaryProps) {
  const items: StaffActivitySummaryItem[] = summary
    ? [
        { label: "Most Active Waiter", ...summary.mostActiveWaiter },
        { label: "Highest Revenue Handled", ...summary.highestRevenueHandled },
        { label: "Most Tables Served", ...summary.mostTablesServed },
        { label: "Average Orders Per Waiter", ...summary.averageOrdersPerWaiter },
      ]
    : [];

  return (
    <ReportsSectionCard
      settings={settings}
      title="User Activity Summary"
      description="Most active staff highlights, revenue ownership, and service coverage benchmarks."
      tag="TEAM INSIGHTS"
      className="h-full"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {items.length ? items.map((item) => (
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
        )) : (
          <div className={cn(getReportsPanelClasses(settings.scheme), "p-4 sm:col-span-2 sm:p-5")}>
            <div className={getReportsMicroLabelClasses(settings.scheme)}>No activity data</div>
            <p className={cn("mt-2 text-[13px] leading-6", getReportsMutedTextClasses(settings.scheme))}>
              User activity summary will appear when the backend returns report data.
            </p>
          </div>
        )}
      </div>
    </ReportsSectionCard>
  );
}
