import type { ComponentType } from "react";
import { cn, getMutedTextClasses } from "@/components/manager/managerUtils";
import type { ManagerSettings } from "@/components/manager/managerTypes";
import { WaiterSurface } from "./waiter-utils";

export function WaiterStatCard({
  settings,
  title,
  value,
  note,
  icon: Icon,
}: {
  settings: ManagerSettings;
  title: string;
  value: string;
  note: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <WaiterSurface settings={settings} className="h-full">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={cn("text-sm font-medium", getMutedTextClasses(settings.scheme))}>
            {title}
          </p>
          <p className="mt-3 text-[2rem] font-bold tracking-tight">{value}</p>
        </div>
        <span className="flex size-12 items-center justify-center rounded-md bg-[linear-gradient(135deg,#2563eb,#38bdf8)] text-white">
          <Icon className="size-5" />
        </span>
      </div>
      <p className={cn("mt-4 text-sm leading-6", getMutedTextClasses(settings.scheme))}>
        {note}
      </p>
    </WaiterSurface>
  );
}
