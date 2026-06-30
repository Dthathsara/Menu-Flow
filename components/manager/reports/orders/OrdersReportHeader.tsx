import { cn, getManagerPageTitleClasses } from "../../managerUtils";
import type { ManagerSettings } from "../../managerTypes";
import { ordersReportDescription } from "../reports.data";
import { getReportsButtonClasses, getReportsMutedTextClasses, getReportsSurfaceClasses } from "../reports.helpers";
import { SectionTag } from "../SectionTag";

interface OrdersReportHeaderProps {
  settings: ManagerSettings;
  isExporting: boolean;
  onExport: () => void;
}

export function OrdersReportHeader({ settings, isExporting, onExport }: OrdersReportHeaderProps) {
  return (
    <section className={cn(getReportsSurfaceClasses(settings.scheme, true), "overflow-hidden p-5 sm:p-6")}>
      <div className="relative">
        <div className="pointer-events-none absolute -right-10 top-0 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-4xl">
            <SectionTag settings={settings}>Order Performance Reports</SectionTag>
            <h2 className={cn("mt-5", getManagerPageTitleClasses())}>Orders Reports</h2>
            <p className={cn("mt-3 max-w-[62rem] text-[15px] leading-8", getReportsMutedTextClasses(settings.scheme))}>
              {ordersReportDescription}
            </p>
          </div>

          <button
            type="button"
            onClick={onExport}
            disabled={isExporting}
            className={cn(getReportsButtonClasses(settings.scheme), isExporting && "cursor-wait opacity-70")}
          >
            {isExporting ? "Exporting..." : "Export Orders Report"}
          </button>
        </div>
      </div>
    </section>
  );
}
