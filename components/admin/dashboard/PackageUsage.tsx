import { cn } from "@/components/manager/managerUtils";
import { adminCardClasses, adminMutedClasses } from "../common/adminStyles";
import type { AdminScheme } from "../common/adminTypes";

const usage = [
  ["Pro", "42%", "bg-[#2f6df6]"],
  ["Business", "26%", "bg-[#34d399]"],
  ["Starter", "16%", "bg-[#fbbf24]"],
  ["Enterprise", "16%", "bg-[#9b7cf6]"],
] as const;

export function PackageUsage({ scheme }: { scheme: AdminScheme }) {
  return (
    <div className={cn(adminCardClasses(scheme), "h-[356px] p-5")}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-extrabold">Package Usage</h3>
        <span className={cn("text-sm", adminMutedClasses(scheme))}>Current clients</span>
      </div>
      <div className="mt-6 grid items-center gap-6 sm:grid-cols-[150px_1fr]">
        <div className="relative size-[156px] rounded-full bg-[conic-gradient(#2f6df6_0_42%,#34d399_42%_68%,#fbbf24_68%_84%,#9b7cf6_84%_100%)]">
          <div className={cn("absolute inset-7 flex items-center justify-center rounded-full text-3xl font-extrabold", scheme === "dark" ? "bg-[#101a2b]" : "bg-white")}>
            78%
          </div>
        </div>
        <div className="space-y-4">
          {usage.map(([label, value, color]) => (
            <div key={label} className="flex items-center gap-3">
              <span className={cn("size-2.5 rounded-full", color)} />
              <span className={cn("flex-1", adminMutedClasses(scheme))}>{label}</span>
              <span className="font-extrabold text-[#a9bdd7]">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

