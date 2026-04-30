import { SummaryCard } from "@/components/common/SummaryCard";
import {
  cn,
  getManagerEyebrowClasses,
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
    <SummaryCard
      scheme={settings.scheme}
      accent={stat.accent}
      title={stat.label}
      value={stat.value}
      note={stat.helper}
      className="px-4 py-4 sm:px-5"
      titleClassName={getManagerEyebrowClasses(settings.scheme)}
      valueClassName="text-[1.05rem] sm:text-[1.25rem]"
      noteClassName={cn("max-w-[16rem] text-[13px] leading-5", getMutedTextClasses(settings.scheme))}
    />
  );
}
