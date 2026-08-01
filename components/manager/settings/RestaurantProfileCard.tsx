import { RestaurantProfileImage } from "../RestaurantProfileImage";
import { ClockIcon, HomeIcon, MapPinIcon } from "../icons";
import { cn, getManagerPrimaryButtonClasses } from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import type { RestaurantProfile } from "./settings.types";
import {
  getSettingsMutedTextClasses,
  getSettingsPanelClasses,
  getSettingsStrongTextClasses,
} from "./settings.helpers";

interface RestaurantProfileCardProps {
  settings: ManagerSettings;
  profile: RestaurantProfile;
  onEdit: () => void;
}

export function RestaurantProfileCard({
  settings,
  profile,
  onEdit,
}: RestaurantProfileCardProps) {
  const displayName = profile.restaurantName || "Restaurant";
  const detailItems = [
    { label: "Location", value: profile.location || "Not set", icon: MapPinIcon },
    { label: "Address", value: profile.address || "Not set", icon: HomeIcon },
    { label: "Opening Time", value: profile.openingTime || "Not set", icon: ClockIcon },
    { label: "Closing Time", value: profile.closingTime || "Not set", icon: ClockIcon },
  ];

  return (
    <div className={cn("mt-6 p-4 sm:p-5", getSettingsPanelClasses(settings.scheme))}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative h-[118px] w-full overflow-hidden rounded-[18px] border border-blue-400/25 sm:w-[172px]">
            <RestaurantProfileImage
              src={profile.restaurantImageUrl}
              alt={displayName}
              className="h-full w-full"
              eager
              highPriority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/18 via-transparent to-transparent" />
          </div>

          <div className="min-w-0">
            <h3 className={cn("text-[1.15rem] font-semibold sm:text-[1.2rem]", getSettingsStrongTextClasses(settings.scheme))}>
              {displayName}
            </h3>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {detailItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.label} className="flex min-w-0 items-start gap-2.5">
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-blue-500/12 text-blue-300 ring-1 ring-inset ring-blue-400/20">
                      <Icon className="size-3.5" />
                    </span>
                    <span className="min-w-0">
                      <span className={cn("block text-[11px] font-semibold uppercase tracking-[0.18em]", getSettingsMutedTextClasses(settings.scheme))}>
                        {item.label}
                      </span>
                      <span className={cn("mt-0.5 block truncate text-[14px] font-medium", getSettingsStrongTextClasses(settings.scheme))}>
                        {item.value}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onEdit}
          className={cn(
            getManagerPrimaryButtonClasses(settings.scheme),
            "h-11 shrink-0 self-start rounded-[16px] px-5 text-[14px] sm:self-center",
          )}
        >
          Edit Restaurant Profile
        </button>
      </div>
    </div>
  );
}
