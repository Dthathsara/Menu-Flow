import type { ComponentType } from "react";
import {
  cn,
  getInteractiveCardClasses,
  getManagerBodyTextClasses,
  getMutedTextClasses,
  getSecondarySurfaceClasses,
} from "@/components/manager/managerUtils";
import type { ManagerSettings } from "@/components/manager/managerTypes";

interface DashboardMetricCardProps {
  settings: ManagerSettings;
  title: string;
  value: string;
  note: string;
  icon?: ComponentType<{ className?: string }>;
  tag?: string;
  accent?: string;
  compact?: boolean;
}

export function DashboardMetricCard({
  settings,
  title,
  value,
  note,
  icon: Icon,
  tag,
  accent = "from-blue-500 to-cyan-400",
  compact = false,
}: DashboardMetricCardProps) {
  return (
    <div
      className={cn(
        "h-full rounded-[22px] border p-5 sm:p-6",
        getSecondarySurfaceClasses(settings.scheme),
        getInteractiveCardClasses(settings.scheme),
      )}
    >
      {Icon || tag ? (
        <div className="flex items-start justify-between gap-3">
          {Icon ? (
            <div
              className={cn(
                "flex size-12 items-center justify-center rounded-md bg-gradient-to-br text-white shadow-[0_16px_28px_rgba(15,23,42,0.16)]",
                accent,
              )}
            >
              <Icon className="size-5" />
            </div>
          ) : null}
          {tag ? (
            <span
              className={cn(
                "inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                settings.scheme === "dark"
                  ? "bg-white/8 text-slate-300"
                  : "bg-slate-100 text-slate-500",
              )}
            >
              {tag}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className={Icon || tag ? "mt-5" : ""}>
        <div className={cn("text-sm font-medium", getMutedTextClasses(settings.scheme))}>
          {title}
        </div>
        <div className={cn("mt-2 font-bold tracking-tight", compact ? "text-[2rem]" : "text-[1.85rem]")}>
          {value}
        </div>
        <div className={cn("mt-3", getManagerBodyTextClasses(settings.scheme))}>
          {note}
        </div>
      </div>
    </div>
  );
}
