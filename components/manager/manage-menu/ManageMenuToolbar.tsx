import { PlusIcon, SearchIcon } from "../icons";
import {
  cn,
  getFocusRingClasses,
  getMutedTextClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import { CategorySelect } from "./CategorySelect";
import type { MenuFilterCategory } from "./types";

interface ManageMenuToolbarProps {
  settings: ManagerSettings;
  searchValue: string;
  category: MenuFilterCategory;
  categories: readonly MenuFilterCategory[];
  resultCount: number;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: MenuFilterCategory) => void;
  onAddItem: () => void;
}

export function ManageMenuToolbar({
  settings,
  searchValue,
  category,
  categories,
  resultCount,
  onSearchChange,
  onCategoryChange,
  onAddItem,
}: ManageMenuToolbarProps) {
  const searchClasses = cn(
    "flex h-11 items-center gap-2 rounded-md border px-3 text-sm transition-all duration-200 ease-out",
    settings.scheme === "dark"
      ? "border-white/10 bg-slate-950/40 text-slate-100 hover:border-white/16 hover:bg-slate-950/48"
      : "border-slate-200 bg-slate-50/90 text-slate-700 hover:border-slate-300 hover:bg-white",
    "hover:-translate-y-0.5 focus-within:-translate-y-0.5",
    getFocusRingClasses(settings.scheme),
  );

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
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
      </div>

      <div
        className={cn(
          "flex flex-col gap-3 rounded-[20px] border p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between",
          settings.scheme === "dark"
            ? "border-white/10 bg-slate-950/40"
            : "border-slate-200/80 bg-white/75",
        )}
      >
        <div className="flex flex-1 flex-col gap-3 md:flex-row">
          <label className={cn("min-w-0 flex h-11 flex-1 items-center gap-2 rounded-md border px-3", searchClasses)}>
            <SearchIcon className="size-4" />
            <input
              type="search"
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search food by name..."
              className="w-full bg-transparent text-sm outline-none placeholder:inherit"
            />
          </label>

          <CategorySelect
            value={category}
            options={categories}
            scheme={settings.scheme}
            onChange={onCategoryChange}
          />
        </div>

        <div className={cn("text-sm font-medium", getMutedTextClasses(settings.scheme))}>
          {resultCount} result{resultCount === 1 ? "" : "s"}
        </div>
      </div>
    </section>
  );
}
