import { PlusIcon } from "../icons";
import { cn, getFocusRingClasses, getMutedTextClasses } from "../managerUtils";
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
        <h2 className="text-2xl font-bold tracking-tight">Manage Menu</h2>
        <p className={cn("mt-2 max-w-2xl text-sm leading-6", getMutedTextClasses(settings.scheme))}>
          Search, organize, and update restaurant menu items across pricing tiers and categories.
        </p>
      </div>

      <button
        type="button"
        onClick={onAddItem}
        className={cn(
          "inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[linear-gradient(135deg,#2563eb,#1d4ed8)] px-5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(37,99,235,0.24)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_22px_44px_rgba(37,99,235,0.3)] active:translate-y-0 active:scale-[0.99]",
          getFocusRingClasses(settings.scheme),
        )}
      >
        <PlusIcon className="size-4" />
        Add Item
      </button>
    </section>
  );
}
