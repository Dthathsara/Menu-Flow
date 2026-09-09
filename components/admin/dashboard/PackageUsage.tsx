import { cn } from "@/components/manager/managerUtils";
import type { AdminPackageUsageItem } from "@/lib/system-admin-dashboard-api";
import { adminCardClasses, adminMutedClasses } from "../common/adminStyles";
import type { AdminScheme } from "../common/adminTypes";

interface PackageUsageProps {
  scheme: AdminScheme;
  data?: {
    items: AdminPackageUsageItem[];
    activePercentageDisplay: string;
  };
}

function buildConicGradient(items: AdminPackageUsageItem[]) {
  if (!items || items.length === 0) {
    return "conic-gradient(#3b82f6 0% 100%)";
  }

  let accumulated = 0;
  const colorMap: Record<string, string> = {
    "bg-[#2f6df6]": "#2f6df6",
    "bg-[#34d399]": "#34d399",
    "bg-[#fbbf24]": "#fbbf24",
    "bg-[#9b7cf6]": "#9b7cf6",
    "bg-cyan-400": "#22d3ee",
    "bg-rose-400": "#fb7185",
  };

  const stops = items.map((item) => {
    const start = accumulated;
    accumulated += item.percentage;
    const end = Math.min(100, accumulated);
    const hexColor = colorMap[item.color] || "#2f6df6";
    return `${hexColor} ${start}% ${end}%`;
  });

  return `conic-gradient(${stops.join(", ")})`;
}

export function PackageUsage({ scheme, data }: PackageUsageProps) {
  const items = data?.items ?? [];
  const activeDisplay = data?.activePercentageDisplay ?? "0%";
  const backgroundGradient = buildConicGradient(items);

  return (
    <div className={cn(adminCardClasses(scheme), "h-[356px] p-5")}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-extrabold">Package Usage</h3>
        <span className={cn("text-sm", adminMutedClasses(scheme))}>Current clients</span>
      </div>
      <div className="mt-6 grid items-center gap-6 sm:grid-cols-[150px_1fr]">
        <div
          className="relative size-[156px] rounded-full transition-all duration-300"
          style={{ background: backgroundGradient }}
        >
          <div className={cn("absolute inset-7 flex items-center justify-center rounded-full text-2xl font-extrabold", scheme === "dark" ? "bg-[#101a2b]" : "bg-white")}>
            {activeDisplay}
          </div>
        </div>
        <div className="space-y-4 max-h-[200px] overflow-y-auto pr-1">
          {items.length > 0 ? (
            items.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className={cn("size-2.5 shrink-0 rounded-full", item.color)} />
                <span className={cn("flex-1 truncate", adminMutedClasses(scheme))}>{item.label}</span>
                <span className="font-extrabold text-[#a9bdd7]">{item.percentageDisplay}</span>
              </div>
            ))
          ) : (
            <p className={cn("text-sm", adminMutedClasses(scheme))}>No active packages found.</p>
          )}
        </div>
      </div>
    </div>
  );
}


