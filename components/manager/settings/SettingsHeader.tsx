import { cn, getManagerPageSubtitleClasses, getManagerPageTitleClasses, getManagerPrimaryButtonClasses } from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import type { RestaurantProfile } from "./settings.types";
import { RestaurantProfileCard } from "./RestaurantProfileCard";
import {
  getSettingsGhostButtonClasses,
  getSettingsPillClasses,
  getSettingsSurfaceClasses,
} from "./settings.helpers";

interface SettingsHeaderProps {
  settings: ManagerSettings;
  profile: RestaurantProfile;
  onReset: () => void;
  onSave: () => void;
  onEditProfile: () => void;
}

export function SettingsHeader({
  settings,
  profile,
  onReset,
  onSave,
  onEditProfile,
}: SettingsHeaderProps) {
  return (
    <section className={cn("p-5 sm:p-6", getSettingsSurfaceClasses(settings.scheme))}>
      <div className="pointer-events-none absolute right-6 top-6 h-36 w-36 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="relative">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-4xl">
            <span className={getSettingsPillClasses(settings.scheme)}>RESTAURANT SETTINGS</span>
            <h2 className={cn("mt-5", getManagerPageTitleClasses())}>Settings</h2>
            <p className={cn("mt-3 max-w-4xl text-[15px] leading-7", getManagerPageSubtitleClasses(settings.scheme))}>
              Customize MenuFlow for restaurants, cafés, hotels, cloud kitchens, food
              courts, and service-based dining workflows.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={onReset} className={getSettingsGhostButtonClasses(settings.scheme)}>
              Reset
            </button>
            <button
              type="button"
              onClick={onSave}
              className={cn(getManagerPrimaryButtonClasses(settings.scheme), "h-10 rounded-[14px] px-5 text-[14px]")}
            >
              Save Changes
            </button>
          </div>
        </div>

        <RestaurantProfileCard settings={settings} profile={profile} onEdit={onEditProfile} />
      </div>
    </section>
  );
}
