import { cn, getManagerStrongTextClasses } from "../../managerUtils";
import type { ManagerSettings } from "../../managerTypes";
import { getReportsMutedTextClasses, getTrackClasses } from "../reports.helpers";
import { ReportsSectionCard } from "../ReportsSectionCard";
import type { OrdersReportSalesPoint } from "../reports.types";

interface SalesOverviewChartProps {
  settings: ManagerSettings;
  data: OrdersReportSalesPoint[];
  isLoading?: boolean;
}

export function SalesOverviewChart({ settings, data, isLoading = false }: SalesOverviewChartProps) {
  const maxSalesValue = Math.max(...data.map((point) => point.value), 1);

  return (
    <ReportsSectionCard
      settings={settings}
      title="Sales Overview"
      description="Monthly order and revenue trend for the selected period."
      tag="MONTHLY TREND"
      className="flex h-full flex-col"
      bodyClassName="flex flex-1 flex-col pb-5 pt-5 sm:pb-6 sm:pt-6"
    >
      <div className="-mx-1 h-full overflow-x-auto px-1">
        {isLoading ? (
          <div className="flex min-h-[320px] items-center justify-center text-[14px] font-semibold text-slate-400">
            Loading sales overview...
          </div>
        ) : data.length ? (
          <div className="grid h-full min-h-[320px] min-w-[620px] auto-cols-fr grid-flow-col gap-4 sm:gap-[18px]">
            {data.map((point) => {
              const height = `${(point.value / maxSalesValue) * 100}%`;

              return (
                <div key={point.label} className="flex h-full min-w-0 flex-col items-center">
                  <div
                    className={cn(
                      "mb-2.5 text-center text-[12px] font-semibold tracking-[-0.01em] sm:text-[13px]",
                      getManagerStrongTextClasses(settings.scheme),
                    )}
                  >
                    {point.amountLabel}
                  </div>
                  <div
                    className={cn(
                      "relative flex min-h-0 flex-1 w-full items-end overflow-hidden rounded-[20px] p-[10px]",
                      settings.scheme === "dark"
                        ? "bg-[linear-gradient(180deg,#0d1730_0%,#091325_100%)] ring-1 ring-inset ring-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.03),inset_0_-18px_30px_rgba(2,8,23,0.48)]"
                        : getTrackClasses(settings.scheme),
                    )}
                  >
                    {settings.scheme === "dark" ? (
                      <div className="pointer-events-none absolute inset-x-[1px] top-[1px] h-10 rounded-t-[20px] bg-[linear-gradient(180deg,rgba(21,39,74,0.4),rgba(21,39,74,0))]" />
                    ) : null}

                    <div className="relative flex h-full w-full items-end">
                      <div
                        className="relative w-full overflow-hidden rounded-[14px] bg-[linear-gradient(180deg,#5d98ff_0%,#4178ef_36%,#3467e2_72%,#2f63df_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_10px_22px_rgba(37,99,235,0.18)]"
                        style={{ height }}
                      >
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0))]" />
                      </div>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "mt-2.5 text-[12px] font-medium tracking-[-0.01em] sm:text-[13px]",
                      settings.scheme === "dark" ? "text-[#7D8FB7]" : getReportsMutedTextClasses(settings.scheme),
                    )}
                  >
                    {point.label}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex min-h-[320px] items-center justify-center text-[14px] font-semibold text-slate-400">
            No sales overview data available.
          </div>
        )}
      </div>
    </ReportsSectionCard>
  );
}
