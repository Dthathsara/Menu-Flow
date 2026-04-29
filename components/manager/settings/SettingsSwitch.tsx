"use client";

import { cn } from "../managerUtils";

interface SettingsSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export function SettingsSwitch({
  checked,
  onChange,
  label,
}: SettingsSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-8 w-[54px] shrink-0 cursor-pointer items-center rounded-full border transition-all duration-200 ease-out",
        "hover:scale-[1.02] active:scale-[0.98]",
        checked
          ? "border-blue-400/55 bg-blue-500 shadow-[0_10px_24px_rgba(59,130,246,0.25)]"
          : "border-transparent bg-slate-600/65",
      )}
    >
      <span
        className={cn(
          "inline-block size-6 rounded-full bg-white shadow-[0_6px_14px_rgba(15,23,42,0.18)] transition-all duration-200 ease-out",
          checked ? "translate-x-[25px]" : "translate-x-[3px]",
        )}
      />
    </button>
  );
}
