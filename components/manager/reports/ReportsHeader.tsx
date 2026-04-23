import { cn, getManagerPageTitleClasses } from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import { REPORT_HEADER_DESCRIPTION, REPORT_STATS } from "./reports.data";
import { getReportsButtonClasses, getReportsMutedTextClasses, getReportsSurfaceClasses } from "./reports.helpers";
import { ReportStatCard } from "./ReportStatCard";
import { SectionTag } from "./SectionTag";

interface ReportsHeaderProps {
  settings: ManagerSettings;
}

export function ReportsHeader({ settings }: ReportsHeaderProps) {
  return (
    <section className={cn(getReportsSurfaceClasses(settings.scheme, true), "overflow-hidden p-5 sm:p-6")}>
      <div className="relative">
        <div className="pointer-events-none absolute -right-10 top-0 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-4xl">
            <SectionTag settings={settings} className={settings.scheme === "dark" ? "bg-[#15325F] text-[#8CB7FF]" : undefined}>
              Performance Reports
            </SectionTag>
            <h2 className={cn("mt-5", getManagerPageTitleClasses())}>Reports</h2>
            <p className={cn("mt-3 max-w-[62rem] text-[15px] leading-8", getReportsMutedTextClasses(settings.scheme))}>
              {REPORT_HEADER_DESCRIPTION}
            </p>
          </div>

          <button type="button" className={getReportsButtonClasses(settings.scheme)}>
            Export Report
          </button>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {REPORT_STATS.map((stat) => (
            <ReportStatCard key={stat.label} settings={settings} stat={stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
