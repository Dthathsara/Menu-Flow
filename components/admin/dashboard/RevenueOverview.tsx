import { cn } from "@/components/manager/managerUtils";
import { adminCardClasses, adminMutedClasses } from "../common/adminStyles";
import type { AdminScheme } from "../common/adminTypes";

const bars = [
  ["Jan", 36],
  ["Feb", 52],
  ["Mar", 47],
  ["Apr", 64],
  ["May", 72],
  ["Jun", 82],
  ["Jul", 92],
] as const;

export function RevenueOverview({ scheme }: { scheme: AdminScheme }) {
  return (
    <div className={cn(adminCardClasses(scheme), "h-[356px] p-5")}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-extrabold">Revenue Overview</h3>
        <span className={cn("text-sm", adminMutedClasses(scheme))}>Last 7 months</span>
      </div>
      <div className="mt-8 flex h-[260px] items-end gap-3 border-b border-[#263650] px-1 sm:gap-4">
        {bars.map(([month, height]) => (
          <div key={month} className="flex h-full flex-1 flex-col justify-end">
            <div
              className="w-full rounded-t-[12px] bg-[linear-gradient(180deg,#56c8ed_0%,#2f6df6_100%)]"
              style={{ height: `${height}%` }}
            />
            <div className={cn("mt-3 text-center text-xs", adminMutedClasses(scheme))}>{month}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

