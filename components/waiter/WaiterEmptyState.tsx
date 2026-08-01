import { cn, getMutedTextClasses } from "@/components/manager/managerUtils";
import type { ManagerSettings } from "@/components/manager/managerTypes";

export function WaiterEmptyState({ settings, title, message }: { settings: ManagerSettings; title: string; message: string }) {
  return (
    <div className={cn("rounded-[18px] border p-8 text-center", settings.scheme === "dark" ? "border-white/10 bg-white/5" : "border-slate-200 bg-white")}>
      <p className="font-semibold">{title}</p>
      <p className={cn("mt-2 text-sm", getMutedTextClasses(settings.scheme))}>{message}</p>
    </div>
  );
}
