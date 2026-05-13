import { cn, getManagerCardShellClasses } from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";

interface SettingsToastProps {
  settings: ManagerSettings;
  title: string;
}

export function SettingsToast({ settings, title }: SettingsToastProps) {
  return (
    <div
      className={cn(
        "pointer-events-auto min-w-[280px] rounded-[18px] px-5 py-4 text-sm font-semibold backdrop-blur-xl",
        getManagerCardShellClasses(settings.scheme, { interactive: false }),
        settings.scheme === "dark" ? "text-slate-100" : "text-slate-900",
      )}
    >
      {title}
    </div>
  );
}
