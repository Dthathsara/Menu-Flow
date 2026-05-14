import { PlusIcon } from "../icons";
import {
  cn,
  getManagerAccentPillClasses,
  getManagerCardShellClasses,
  getManagerPageSubtitleClasses,
  getManagerPageTitleClasses,
  getManagerPrimaryButtonClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";

interface ManageMenuToolbarProps {
  settings: ManagerSettings;
  onAddItem: () => void;
}

export function ManageMenuToolbar({
  settings,
  onAddItem,
}: ManageMenuToolbarProps) {
  return (
    <section className={cn("overflow-hidden p-5 sm:p-6", getManagerCardShellClasses(settings.scheme, { interactive: true }))}>
      <div className="relative">
        <div className="pointer-events-none absolute -right-10 top-0 h-36 w-36 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <span className={getManagerAccentPillClasses(settings.scheme, "brand")}>
              MENU OPERATIONS
            </span>

            <h2 className={cn("mt-5", getManagerPageTitleClasses())}>Manage Menu</h2>
            <p className={cn("mt-3 max-w-[72rem]", getManagerPageSubtitleClasses(settings.scheme))}>
              Search, organize, and update restaurant menu items across pricing tiers and categories.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-3 lg:justify-end">
            <button
              type="button"
              onClick={onAddItem}
              className={getManagerPrimaryButtonClasses(settings.scheme)}
            >
              <PlusIcon className="size-4" />
              Add Item
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
