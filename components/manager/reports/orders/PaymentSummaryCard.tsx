import { cn, getManagerStrongTextClasses } from "../../managerUtils";
import type { ManagerSettings } from "../../managerTypes";
import { paymentSummaryData } from "../reports.data";
import { getReportsMicroLabelClasses, getReportsMutedTextClasses, getReportsPanelClasses } from "../reports.helpers";
import { ReportsSectionCard } from "../ReportsSectionCard";

interface PaymentSummaryCardProps {
  settings: ManagerSettings;
}

export function PaymentSummaryCard({ settings }: PaymentSummaryCardProps) {
  return (
    <ReportsSectionCard
      settings={settings}
      title="Payment Summary"
      description="Collected, pending, tax, and service-charge totals."
      tag="FINANCE"
      className="h-full"
    >
      <div className="space-y-3">
        {paymentSummaryData.map((metric) => (
          <div key={metric.label} className={cn(getReportsPanelClasses(settings.scheme), "p-4 sm:p-5")}>
            <div className={getReportsMicroLabelClasses(settings.scheme)}>{metric.label}</div>
            <div
              className={cn(
                "mt-3 text-[2rem] font-bold tracking-tight",
                getManagerStrongTextClasses(settings.scheme),
              )}
            >
              {metric.value}
            </div>
            <p className={cn("mt-2 text-[13px] leading-6", getReportsMutedTextClasses(settings.scheme))}>
              {metric.helperText}
            </p>
          </div>
        ))}
      </div>
    </ReportsSectionCard>
  );
}
