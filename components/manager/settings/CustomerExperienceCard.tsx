import { cn, getManagerPageSubtitleClasses, getManagerSectionTitleClasses } from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import { SettingsSwitch } from "./SettingsSwitch";
import type { CustomerExperienceSettings } from "./settings.types";
import {
  getSettingsMutedTextClasses,
  getSettingsPanelClasses,
  getSettingsPillClasses,
  getSettingsSurfaceClasses,
} from "./settings.helpers";

interface CustomerExperienceCardProps {
  settings: ManagerSettings;
  value: CustomerExperienceSettings;
  onChange: (value: CustomerExperienceSettings) => void;
}

function ExperienceRow({
  settings,
  title,
  description,
  checked,
  onChange,
}: {
  settings: ManagerSettings;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4 p-4", getSettingsPanelClasses(settings.scheme))}>
      <div className="min-w-0">
        <h3 className={getManagerSectionTitleClasses()}>{title}</h3>
        <p className={cn("mt-2", getSettingsMutedTextClasses(settings.scheme))}>{description}</p>
      </div>
      <div className="pt-1">
        <SettingsSwitch checked={checked} onChange={onChange} label={title} />
      </div>
    </div>
  );
}

export function CustomerExperienceCard({
  settings,
  value,
  onChange,
}: CustomerExperienceCardProps) {
  return (
    <section className={cn("p-5 sm:p-6", getSettingsSurfaceClasses(settings.scheme))}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className={getManagerSectionTitleClasses()}>Customer Experience</h2>
          <p className={cn("mt-2 text-[15px] leading-6", getManagerPageSubtitleClasses(settings.scheme))}>
            Customize what customers see after scanning the QR code.
          </p>
        </div>
        <span className={getSettingsPillClasses(settings.scheme)}>CUSTOMER APP</span>
      </div>

      <div className="mt-6 space-y-4">
        <ExperienceRow
          settings={settings}
          title="Show Featured Items"
          description="Display popular or promoted dishes on the customer home screen."
          checked={value.showFeaturedItems}
          onChange={(showFeaturedItems) => onChange({ ...value, showFeaturedItems })}
        />
        <ExperienceRow
          settings={settings}
          title="Show Preparation Time"
          description="Display estimated preparation time inside the food detail popup."
          checked={value.showPreparationTime}
          onChange={(showPreparationTime) => onChange({ ...value, showPreparationTime })}
        />
        <ExperienceRow
          settings={settings}
          title="Allow Order Tracking"
          description="Customers can see Accepted, Preparing, Ready, and Delivered order status."
          checked={value.allowOrderTracking}
          onChange={(allowOrderTracking) => onChange({ ...value, allowOrderTracking })}
        />
      </div>
    </section>
  );
}
