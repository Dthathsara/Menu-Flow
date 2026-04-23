import { cn } from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import { SALES_TREND_POINTS } from "./reports.data";
import { getReportsMutedTextClasses, getTrackClasses } from "./reports.helpers";
import { ReportsSectionCard } from "./ReportsSectionCard";

interface SalesOverviewChartProps {
  settings: ManagerSettings;
}

const MAX_SALES_VALUE = Math.max(...SALES_TREND_POINTS.map((point) => point.value));

export function SalesOverviewChart({ settings }: SalesOverviewChartProps) {
  return (
    <ReportsSectionCard
      settings={settings}
      title="Sales Overview"
      description="Monthly order and revenue trend for the selected period."
      tag="MONTHLY TREND"
      className="h-full"
      bodyClassName="pb-6"
    >
      <div className="grid min-h-[290px] grid-cols-6 gap-3 sm:gap-4">
        {SALES_TREND_POINTS.map((point) => {
          const height = `${Math.max((point.value / MAX_SALES_VALUE) * 100, 22)}%`;

          return (
            <div key={point.month} className="flex min-w-0 flex-col items-center justify-end">
              <div className="mb-3 text-center text-[13px] font-semibold text-white">
                {point.amountLabel}
              </div>
              <div
                className={cn(
                  "flex h-[172px] w-full items-end rounded-[16px] p-2 sm:p-3",
                  getTrackClasses(settings.scheme),
                )}
              >
                <div
                  className="w-full rounded-[12px] bg-[linear-gradient(180deg,#4D8BFF_0%,#3A72EB_55%,#2C58CC_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]"
                  style={{ height }}
                />
              </div>
              <div className={cn("mt-3 text-[13px] font-medium", getReportsMutedTextClasses(settings.scheme))}>
                {point.month}
              </div>
            </div>
          );
        })}
      </div>
    </ReportsSectionCard>
  );
}
