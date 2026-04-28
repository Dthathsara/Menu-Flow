import {
  cn,
  getManagerEyebrowClasses,
  getInteractiveCardClasses,
  getManagerPanelShellClasses,
  getManagerStrongTextClasses,
  getMutedTextClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import type { BillingStat } from "./billing.types";

interface BillingStatCardProps {
  settings: ManagerSettings;
  stat: BillingStat;
}

export function BillingStatCard({ settings, stat }: BillingStatCardProps) {
  return (
    <div
      className={cn(
        getManagerPanelShellClasses(settings.scheme),
        getInteractiveCardClasses(settings.scheme),
        "relative overflow-hidden px-4 py-4 sm:px-5",
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-r from-blue-500/10 via-transparent to-transparent" />
      <div className={getManagerEyebrowClasses(settings.scheme)}>{stat.label}</div>
      <div className={cn("mt-4 text-[1.05rem] font-bold tracking-tight sm:text-[1.25rem]", getManagerStrongTextClasses(settings.scheme))}>
        {stat.value}
      </div>
      <p
        className={cn(
          "mt-3 max-w-[16rem] text-[13px] leading-5",
          getMutedTextClasses(settings.scheme),
        )}
      >
        {stat.helper}
      </p>
    </div>
  );
}
