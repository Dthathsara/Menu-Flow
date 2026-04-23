import { cn } from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import { getReportsMicroLabelClasses, getReportsMutedTextClasses, getReportsPanelClasses } from "./reports.helpers";
import type { ReportStat } from "./reports.types";

interface ReportStatCardProps {
  settings: ManagerSettings;
  stat: ReportStat;
}

export function ReportStatCard({ settings, stat }: ReportStatCardProps) {
  return (
    <div className={cn(getReportsPanelClasses(settings.scheme), "relative overflow-hidden p-4 sm:p-5")}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-r from-blue-500/10 via-transparent to-transparent" />
      <div className={getReportsMicroLabelClasses(settings.scheme)}>{stat.label}</div>
      <div
        className={cn(
          "mt-5 text-[2.15rem] font-bold tracking-tight",
          settings.scheme === "dark" ? "text-white" : "text-slate-900",
        )}
      >
        {stat.value}
      </div>
      <p className={cn("mt-3 max-w-[17rem] text-[14px] leading-7", getReportsMutedTextClasses(settings.scheme))}>
        {stat.helperText}
      </p>
    </div>
  );
}
