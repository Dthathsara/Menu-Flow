import { cn } from "@/components/manager/managerUtils";
import type { AdminRevenueMonth } from "@/lib/system-admin-dashboard-api";
import { adminCardClasses, adminMutedClasses } from "../common/adminStyles";
import type { AdminScheme } from "../common/adminTypes";

interface RevenueOverviewProps {
  scheme: AdminScheme;
  data?: AdminRevenueMonth[];
}

export function RevenueOverview({ scheme, data = [] }: RevenueOverviewProps) {
  const bars = data.length > 0 ? data : [
    { month: "Jan", value: 0, heightPercent: 10 },
    { month: "Feb", value: 0, heightPercent: 10 },
    { month: "Mar", value: 0, heightPercent: 10 },
    { month: "Apr", value: 0, heightPercent: 10 },
    { month: "May", value: 0, heightPercent: 10 },
    { month: "Jun", value: 0, heightPercent: 10 },
    { month: "Jul", value: 0, heightPercent: 10 },
  ];

  return (
    <div className={cn(adminCardClasses(scheme), "h-[356px] p-5")}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-extrabold">Revenue Overview</h3>
        <span className={cn("text-sm", adminMutedClasses(scheme))}>Last 7 months</span>
      </div>
      <div className="mt-8 flex h-[260px] items-end gap-3 border-b border-[#263650] px-1 sm:gap-4">
        {bars.map((bar, index) => (
          <div key={`${bar.month}-${index}`} className="flex h-full flex-1 flex-col justify-end">
            <div
              className="w-full rounded-t-[12px] bg-[linear-gradient(180deg,#56c8ed_0%,#2f6df6_100%)] transition-all duration-300"
              style={{ height: `${bar.heightPercent}%` }}
              title={bar.value ? `Rs. ${bar.value.toLocaleString()}` : bar.month}
            />
            <div className={cn("mt-3 text-center text-xs truncate", adminMutedClasses(scheme))}>{bar.month}</div>
          </div>
        ))}
      </div>
    </div>
  );
}


