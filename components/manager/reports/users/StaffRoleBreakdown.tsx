import { cn, getManagerStrongTextClasses } from "../../managerUtils";
import type { ManagerSettings } from "../../managerTypes";
import { getProgressToneClasses, getTrackClasses } from "../reports.helpers";
import { ReportsSectionCard } from "../ReportsSectionCard";
import type { ProgressMetric, UserReportRoleBreakdownMetric } from "../reports.types";

interface StaffRoleBreakdownProps {
  settings: ManagerSettings;
  items: UserReportRoleBreakdownMetric[];
}

const TONES: ProgressMetric["tone"][] = ["blue", "purple", "cyan", "orange", "teal"];

export function StaffRoleBreakdown({ settings, items }: StaffRoleBreakdownProps) {
  return (
    <ReportsSectionCard
      settings={settings}
      title="Staff Role Breakdown"
      description="Current role distribution across front-of-house and kitchen operations."
      tag="ROLE MIX"
      className="h-full xl:col-span-2"
    >
      <div className="space-y-5">
        {items.length ? items.map((item, index) => (
          <div key={`${item.role}-${index}`}>
            <div
              className={cn(
                "mb-2 flex items-center justify-between gap-3 text-[14px] font-semibold",
                getManagerStrongTextClasses(settings.scheme),
              )}
            >
              <span>{item.role}</span>
              <span>{item.count}</span>
            </div>
            <div className={cn("h-2.5 rounded-full p-[1px]", getTrackClasses(settings.scheme))}>
              <div
                className={cn("h-full rounded-full", getProgressToneClasses(TONES[index % TONES.length], settings.scheme))}
                style={{ width: `${Math.min(100, (item.value / Math.max(item.max, 1)) * 100)}%` }}
              />
            </div>
          </div>
        )) : (
          <div className={cn("text-[14px]", getManagerStrongTextClasses(settings.scheme))}>
            No role breakdown data available.
          </div>
        )}
      </div>
    </ReportsSectionCard>
  );
}
