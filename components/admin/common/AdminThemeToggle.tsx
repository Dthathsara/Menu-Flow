import { MoonIcon, SunIcon } from "@/components/manager/icons";
import { cn } from "@/components/manager/managerUtils";
import type { AdminScheme } from "./adminTypes";

interface AdminThemeToggleProps {
  scheme: AdminScheme;
  onToggle: () => void;
}

export function AdminThemeToggle({ scheme, onToggle }: AdminThemeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "inline-flex size-11 cursor-pointer items-center justify-center rounded-md border transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35",
        scheme === "dark"
          ? "border-[#263650] bg-[#0b1424] text-white hover:border-blue-400/40 hover:bg-white/10"
          : "border-slate-300 bg-white text-slate-950 hover:border-blue-300 hover:bg-slate-100",
      )}
      aria-label="Toggle admin theme"
    >
      {scheme === "dark" ? <SunIcon className="size-4.5" /> : <MoonIcon className="size-4.5" />}
    </button>
  );
}
