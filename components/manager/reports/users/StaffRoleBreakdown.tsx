import { cn, getManagerStrongTextClasses } from "../../managerUtils";
import type { ManagerSettings } from "../../managerTypes";
import { staffRoleBreakdown } from "../reports.data";
import { getProgressToneClasses, getTrackClasses } from "../reports.helpers";
import { ReportsSectionCard } from "../ReportsSectionCard";

interface StaffRoleBreakdownProps {
  settings: ManagerSettings;
}

export function StaffRoleBreakdown({ settings }: StaffRoleBreakdownProps) {
  return (
    <ReportsSectionCard
      settings={settings}
      title="Staff Role Breakdown"
      description="Current role distribution across front-of-house and kitchen operations."
      tag="ROLE MIX"
      className="h-full xl:col-span-2"
    >
      <div className="space-y-5">
        {staffRoleBreakdown.map((item) => (
          <div key={item.role}>
            <div
              className={cn(
                "mb-2 flex items-center justify-between gap-3 text-[14px] font-semibold",
                getManagerStrongTextClasses(settings.scheme),
              )}
            >
              <span>{item.role}s</span>
              <span>{item.count}</span>
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
