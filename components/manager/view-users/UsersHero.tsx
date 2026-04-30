import { SummaryCard } from "@/components/common/SummaryCard";
import {
  cn,
  getManagerPageSubtitleClasses,
  getManagerPageTitleClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import { PlusIcon } from "../icons";
import { getUsersFieldLabelClasses, getUsersMutedTextClasses } from "./helpers";
import { UsersActionButton, UsersSectionBadge, UsersSurfaceCard } from "./shared";
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
            <SummaryCard
              key={card.title}
              scheme={settings.scheme}
              accent={card.accent}
              title={card.title}
              value={card.value}
              note={card.note}
              className="p-4 sm:p-5"
              titleClassName={getUsersFieldLabelClasses(settings.scheme)}
              valueClassName="text-[2.15rem]"
              noteClassName={cn(
                "max-w-[17rem] text-[15px] leading-7",
                getUsersMutedTextClasses(settings.scheme),
              )}
            />
          ))}
        </div>
      </div>
    </UsersSurfaceCard>
  );
}
