import type { ManagerSettings } from "../managerTypes";
import { SummaryMetricCard } from "../SummaryMetricCard";
import { getReportsMicroLabelClasses, getReportsMutedTextClasses } from "./reports.helpers";
import type { ReportStat } from "./reports.types";

interface ReportStatCardProps {
  settings: ManagerSettings;
  stat: ReportStat;
}

export function ReportStatCard({ settings, stat }: ReportStatCardProps) {
  return (
    <SummaryMetricCard
      settings={settings}
      accent={stat.accent}
      title={stat.label}
      value={stat.value}
      note={stat.helperText}
      className="p-4 sm:p-5"
      titleClassName={getReportsMicroLabelClasses(settings.scheme)}
      valueClassName="mt-5 text-[2.15rem]"
      noteClassName={`max-w-[17rem] text-[14px] leading-7 ${getReportsMutedTextClasses(
        settings.scheme,
      )}`}
    />
  );
}
