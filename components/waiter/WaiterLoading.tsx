import { cn, getMutedTextClasses } from "@/components/manager/managerUtils";
import type { ManagerSettings } from "@/components/manager/managerTypes";

export function WaiterLoading({ settings, label = "Loading waiter data..." }: { settings: ManagerSettings; label?: string }) {
  return (
    <div className={cn("rounded-[18px] border p-6 text-sm", settings.scheme === "dark" ? "border-white/10 bg-white/5" : "border-slate-200 bg-white")}>
      <span className={getMutedTextClasses(settings.scheme)}>{label}</span>
    </div>
  );
}
