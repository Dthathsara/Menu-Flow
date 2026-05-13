import {
  cn,
  getManagerAccentPillClasses,
  getManagerCardShellClasses,
  getManagerEyebrowClasses,
  getManagerPanelShellClasses,
  getManagerSectionSubtitleClasses,
  getManagerSectionTitleClasses,
  getManagerStrongTextClasses,
  getMutedTextClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import type { CashierSummaryMetric } from "./billing.types";

interface CashierSummaryCardProps {
  settings: ManagerSettings;
  metrics: CashierSummaryMetric[];
}

export function CashierSummaryCard({
  settings,
  metrics,
}: CashierSummaryCardProps) {
  return (
    <section
      className={cn(
        "p-5 sm:p-6",
        getManagerCardShellClasses(settings.scheme, { interactive: true }),
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className={getManagerSectionTitleClasses()}>Cashier Summary</h3>
          <p className={getManagerSectionSubtitleClasses(settings.scheme)}>
            Collected, unpaid, tax, and service-charge values.
          </p>
        </div>
        <span className={getManagerAccentPillClasses(settings.scheme, "brand")}>FINANCE</span>
      </div>

      <div className="mt-5 space-y-3">
        {metrics.map((metric) => (
          <div key={metric.label} className={cn(getManagerPanelShellClasses(settings.scheme), "relative overflow-hidden px-4 py-4 sm:px-5")}>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-r from-blue-500/10 via-transparent to-transparent" />
            <div className={getManagerEyebrowClasses(settings.scheme)}>{metric.label}</div>
            <div className={cn("mt-3 text-[1.05rem] font-bold tracking-tight", getManagerStrongTextClasses(settings.scheme))}>
              {metric.value}
            </div>
            <p className={cn("mt-3 text-[13px] leading-5", getMutedTextClasses(settings.scheme))}>
              {metric.helper}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
