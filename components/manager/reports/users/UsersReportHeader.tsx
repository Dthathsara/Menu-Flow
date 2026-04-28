import { cn, getManagerPageTitleClasses } from "../../managerUtils";
import type { ManagerSettings } from "../../managerTypes";
import { usersReportDescription } from "../reports.data";
import { getReportsButtonClasses, getReportsMutedTextClasses, getReportsSurfaceClasses } from "../reports.helpers";
import { SectionTag } from "../SectionTag";

interface UsersReportHeaderProps {
  settings: ManagerSettings;
}

export function UsersReportHeader({ settings }: UsersReportHeaderProps) {
  return (
    <section className={cn(getReportsSurfaceClasses(settings.scheme, true), "overflow-hidden p-5 sm:p-6")}>
      <div className="relative">
        <div className="pointer-events-none absolute -right-10 top-0 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-4xl">
            <SectionTag settings={settings}>User Performance Reports</SectionTag>
            <h2 className={cn("mt-5", getManagerPageTitleClasses())}>Users Reports</h2>
            <p className={cn("mt-3 max-w-[62rem] text-[15px] leading-8", getReportsMutedTextClasses(settings.scheme))}>
              {usersReportDescription}
            </p>
          </div>

          <button type="button" className={getReportsButtonClasses(settings.scheme)}>
            Export Users Report
          </button>
        </div>
      </div>
    </section>
  );
}
