import { PlusIcon } from "../icons";
import {
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
    <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h2 className={getManagerPageTitleClasses()}>Manage Menu</h2>
        <p className={getManagerPageSubtitleClasses(settings.scheme)}>
          Search, organize, and update restaurant menu items across pricing tiers and categories.
        </p>
      </div>

      <button
        type="button"
        onClick={onAddItem}
        className={getManagerPrimaryButtonClasses(settings.scheme)}
      >
        <PlusIcon className="size-4" />
        Add Item
      </button>
    </section>
  );
}
