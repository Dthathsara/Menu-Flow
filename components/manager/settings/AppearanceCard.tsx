import { cn, getManagerPageSubtitleClasses, getManagerSectionTitleClasses } from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import { THEME_OPTIONS } from "./settings.data";
import {
  getSettingsMutedTextClasses,
  getSettingsPillClasses,
  getSettingsSurfaceClasses,
  getThemePillLabel,
} from "./settings.helpers";
import type { SettingsThemePreference } from "./settings.types";

interface AppearanceCardProps {
  settings: ManagerSettings;
  value: SettingsThemePreference;
  onChange: (value: SettingsThemePreference) => void;
}

export function AppearanceCard({
  settings,
  value,
  onChange,
}: AppearanceCardProps) {
  return (
    <section className={cn("p-5 sm:p-6", getSettingsSurfaceClasses(settings.scheme))}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className={getManagerSectionTitleClasses()}>Appearance</h2>
          <p className={cn("mt-2 text-[15px] leading-6", getManagerPageSubtitleClasses(settings.scheme))}>
            Control dashboard and customer interface theme style.
          </p>
        </div>
        <span className={getSettingsPillClasses(settings.scheme)}>THEME</span>
      </div>

      <div className="mt-6 space-y-4">
        {THEME_OPTIONS.map((option) => {
          const active = value === option.key;

          return (
            <button
              key={option.key}
              type="button"
              onClick={() => onChange(option.key)}
              className={cn(
                "flex w-full items-start justify-between gap-4 rounded-[20px] border p-4 text-left transition-all duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.98]",
                active
                  ? settings.scheme === "dark"
                    ? "border-blue-400/70 bg-white/[0.03] shadow-[0_16px_34px_rgba(37,99,235,0.16)]"
                    : "border-blue-400 bg-blue-50/70 shadow-[0_16px_34px_rgba(37,99,235,0.14)]"
                  : settings.scheme === "dark"
                    ? "border-white/10 bg-slate-950/22 hover:border-blue-400/40 hover:bg-white/[0.03]"
                    : "border-slate-200 bg-slate-50/60 hover:border-blue-300 hover:bg-white",
              )}
            >
              <div className="min-w-0">
                <h3 className={getManagerSectionTitleClasses()}>{option.title}</h3>
                <p className={cn("mt-2", getSettingsMutedTextClasses(settings.scheme))}>
                  {option.description}
                </p>
              </div>
              <span className={cn(getSettingsPillClasses(settings.scheme), "shrink-0")}>
                {getThemePillLabel(value, option.key)}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
