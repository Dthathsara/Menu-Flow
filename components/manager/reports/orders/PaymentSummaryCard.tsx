import { cn, getManagerStrongTextClasses } from "../../managerUtils";
import type { ManagerSettings } from "../../managerTypes";
import { getReportsMicroLabelClasses, getReportsMutedTextClasses, getReportsPanelClasses } from "../reports.helpers";
import { ReportsSectionCard } from "../ReportsSectionCard";
import type { OrdersReportPaymentSummary, PaymentSummaryMetric } from "../reports.types";

interface PaymentSummaryCardProps {
  settings: ManagerSettings;
  summary?: OrdersReportPaymentSummary;
}

export function PaymentSummaryCard({ settings, summary }: PaymentSummaryCardProps) {
  const paymentSummaryData: PaymentSummaryMetric[] = [
    {
      label: "COLLECTED REVENUE",
      value: formatCurrency(summary?.collectedRevenue ?? 0),
      helperText: "Paid and confirmed order value collected in the selected period.",
    },
    {
      label: "TAX COLLECTED",
      value: formatCurrency(summary?.taxCollected ?? 0),
      helperText: "Tax total derived from all orders in the current report window.",
    },
    {
      label: "SERVICE CHARGES",
      value: formatCurrency(summary?.serviceCharges ?? 0),
      helperText: "Service charge contribution included in overall order billing.",
    },
  ];

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

function formatCurrency(value: number) {
  return `Rs. ${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}
