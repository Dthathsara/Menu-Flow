import { cn, getManagerStrongTextClasses } from "../../managerUtils";
import type { ManagerSettings } from "../../managerTypes";
import { orderStatusMix } from "../reports.data";
import { getProgressToneClasses, getTrackClasses } from "../reports.helpers";
import { ReportsSectionCard } from "../ReportsSectionCard";

interface OrderStatusMixCardProps {
  settings: ManagerSettings;
}

export function OrderStatusMixCard({ settings }: OrderStatusMixCardProps) {
  return (
    <ReportsSectionCard
      settings={settings}
      title="Order Status Mix"
      description="Live distribution of active and completed orders."
      tag="OPERATIONS"
      tagAlign="left"
      className="h-full"
    >
      <div className="space-y-4">
        {orderStatusMix.map((item) => (
          <div key={item.label}>
            <div
              className={cn(
                "mb-2 flex items-center justify-between gap-3 text-[14px] font-medium",
                getManagerStrongTextClasses(settings.scheme),
              )}
            >
              <span>{item.label}</span>
              <span className="font-semibold">{item.valueLabel}</span>
            </div>
            <div className={cn("h-2.5 rounded-full p-[1px]", getTrackClasses(settings.scheme))}>
              <div
                className={cn("h-full rounded-full", getProgressToneClasses(item.tone, settings.scheme))}
                style={{ width: `${(item.value / item.max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </ReportsSectionCard>
  );
}
