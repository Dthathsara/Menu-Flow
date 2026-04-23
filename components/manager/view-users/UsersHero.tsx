import { cn, getManagerPageSubtitleClasses, getManagerPageTitleClasses } from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import { PlusIcon } from "../icons";
import { getUsersFieldLabelClasses, getUsersMutedTextClasses } from "./helpers";
import { UsersActionButton, UsersPanel, UsersSectionBadge, UsersSurfaceCard } from "./shared";
import type { StaffSummaryCard } from "./types";

interface UsersHeroProps {
  settings: ManagerSettings;
  summaryCards: StaffSummaryCard[];
  onAddStaff: () => void;
}

export function UsersHero({ settings, summaryCards, onAddStaff }: UsersHeroProps) {
  return (
    <UsersSurfaceCard settings={settings} className="overflow-hidden p-5 sm:p-6" interactive>
      <div className="relative">
        <div className="pointer-events-none absolute -right-10 top-3 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <UsersSectionBadge settings={settings}>Restaurant Staff</UsersSectionBadge>
            <h2 className={cn("mt-5", getManagerPageTitleClasses())}>Users</h2>
            <p
              className={cn(
                "mt-3 max-w-[58rem] text-[15px] leading-8",
                getManagerPageSubtitleClasses(settings.scheme),
              )}
            >
              Manage chefs, waiters, and counter staff across your restaurant operations
              with searchable records, role assignments, profile details, and clean
              day-to-day actions.
            </p>
          </div>

          <UsersActionButton
            type="button"
            tone="primary"
            settings={settings}
            className="h-10 self-start rounded-[14px] px-4 text-[14px] sm:h-11 sm:px-5"
            onClick={onAddStaff}
          >
            <PlusIcon className="size-4" />
            Add Staff Member
          </UsersActionButton>
        </div>

        <div className="mt-7 grid gap-3 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <UsersPanel settings={settings} key={card.title} className="relative overflow-hidden p-4 sm:p-5">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-blue-500/10 via-transparent to-transparent" />
              <div className={getUsersFieldLabelClasses(settings.scheme)}>{card.title}</div>
              <div
                className={cn(
                  "mt-4 text-[2.15rem] font-bold tracking-tight",
                  settings.scheme === "dark" ? "text-white" : "text-slate-900",
                )}
              >
                {card.value}
              </div>
              <p
                className={cn(
                  "mt-3 max-w-[17rem] text-[15px] leading-7",
                  getUsersMutedTextClasses(settings.scheme),
                )}
              >
                {card.note}
              </p>
            </UsersPanel>
          ))}
        </div>
      </div>
    </UsersSurfaceCard>
  );
}
