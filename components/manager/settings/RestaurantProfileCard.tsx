import { getRestaurantImageUrl } from "@/lib/image-url";
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
  const safeImageSrc = getRestaurantImageUrl(profile.restaurantImageUrl);
  const displayName = profile.hotelName || "Restaurant";

  return (
    <div className={cn("mt-6 p-4 sm:p-5", getSettingsPanelClasses(settings.scheme))}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative h-[118px] w-full overflow-hidden rounded-[18px] border border-blue-400/25 sm:w-[172px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={safeImageSrc}
              alt={displayName}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/18 via-transparent to-transparent" />
          </div>

          <div className="min-w-0">
            <h3 className={cn("text-[1.15rem] font-semibold sm:text-[1.2rem]", getSettingsStrongTextClasses(settings.scheme))}>
              {displayName}
            </h3>
            <p className={cn("mt-2", getSettingsMutedTextClasses(settings.scheme))}>{profile.businessLocation}</p>
            <p className={cn("mt-3 max-w-3xl", getSettingsMutedTextClasses(settings.scheme))}>
              This profile appears on the manager sidebar, customer QR menu, receipts,
              and order pages.
            </p>
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
