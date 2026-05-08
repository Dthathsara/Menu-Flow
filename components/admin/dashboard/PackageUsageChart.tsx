import { cn, getContentSurfaceClasses, getManagerSectionSubtitleClasses, getManagerSectionTitleClasses, getMutedTextClasses } from "@/components/manager/managerUtils";
import type { AdminScheme } from "../common/adminTypes";

const usageRows = [
  { label: "Starter", value: 38, color: "bg-sky-500" },
  { label: "Growth", value: 72, color: "bg-blue-500" },
  { label: "Premium", value: 56, color: "bg-violet-500" },
  { label: "Enterprise", value: 24, color: "bg-emerald-500" },
];

export function PackageUsageChart({ scheme }: { scheme: AdminScheme }) {
  return (
    <div className={cn("h-full rounded-[22px] border p-5 sm:p-6", getContentSurfaceClasses(scheme))}>
      <h3 className={getManagerSectionTitleClasses()}>Package Usage</h3>
      <p className={getManagerSectionSubtitleClasses(scheme)}>Active clients by subscription tier</p>
      <div className="mt-6 space-y-5">
        {usageRows.map((row) => (
          <div key={row.label} className="space-y-2.5">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium">{row.label}</span>
              <span className={cn("font-semibold", getMutedTextClasses(scheme))}>{row.value}%</span>
            </div>
            <div className={cn("h-2.5 rounded-full", scheme === "dark" ? "bg-white/8" : "bg-slate-100")}>
              <div className={cn("h-full rounded-full", row.color)} style={{ width: `${row.value}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className={cn("mt-7 rounded-[18px] border p-4", scheme === "dark" ? "border-white/10 bg-white/6" : "border-slate-200 bg-slate-50")}>
        <div className="text-3xl font-bold">190</div>
        <p className={cn("mt-2 text-sm leading-6", getMutedTextClasses(scheme))}>Total active package subscriptions across MenuFlow clients.</p>
      </div>
    </div>
  );
}

