import { SearchIcon } from "../icons";
import {
  cn,
  getContentSurfaceClasses,
  getFocusRingClasses,
  getMutedTextClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import { CategorySelect } from "./CategorySelect";
import { ManageMenuRow } from "./ManageMenuRow";
import type { MenuFilterCategory, MenuItemRecord } from "./types";

interface ManageMenuTableProps {
  items: MenuItemRecord[];
  settings: ManagerSettings;
  searchValue: string;
  category: MenuFilterCategory;
  categories: readonly MenuFilterCategory[];
  resultCount: number;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: MenuFilterCategory) => void;
  onEdit: (item: MenuItemRecord) => void;
  onRemove: (item: MenuItemRecord) => void;
}

export function ManageMenuTable({
  items,
  settings,
  searchValue,
  category,
  categories,
  resultCount,
  onSearchChange,
  onCategoryChange,
  onEdit,
  onRemove,
}: ManageMenuTableProps) {
  const searchClasses = cn(
    "flex h-11 items-center gap-2 rounded-md border px-3 text-sm transition-all duration-200 ease-out",
    settings.scheme === "dark"
      ? "border-white/10 bg-slate-950/36 text-slate-100 hover:border-white/16 hover:bg-slate-950/48"
      : "border-slate-200 bg-slate-50/90 text-slate-700 hover:border-slate-300 hover:bg-white",
    "hover:-translate-y-0.5 focus-within:-translate-y-0.5",
    getFocusRingClasses(settings.scheme),
  );

  return (
    <section
      className={cn(
        "overflow-hidden rounded-[20px] border",
        getContentSurfaceClasses(settings.scheme),
      )}
    >
      <div className="border-b border-black/5 px-4 py-5 sm:px-5 sm:py-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold">Menu Items</h3>
            <p className={cn("mt-1 text-sm", getMutedTextClasses(settings.scheme))}>
              Live menu catalogue for the active branch.
            </p>
          </div>
          <div
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
              settings.scheme === "dark"
                ? "bg-white/8 text-slate-300"
                : "bg-slate-100 text-slate-500",
            )}
          >
            {items.length} items
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-3 md:flex-row">
            <label className="min-w-0 flex-1">
              <span className="sr-only">Search menu items</span>
              <div className={searchClasses}>
                <SearchIcon className="size-4 text-slate-400" />
                <input
                  type="search"
                  value={searchValue}
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder="Search food by name..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-inherit"
                  aria-label="Search food by name"
                />
              </div>
            </label>

            <div className="min-w-0 md:w-[220px]">
              <CategorySelect
                value={category}
                options={categories}
                scheme={settings.scheme}
                onChange={onCategoryChange}
              />
            </div>
          </div>

          <div className={cn("text-sm font-medium", getMutedTextClasses(settings.scheme))}>
            {resultCount} result{resultCount === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[1120px] w-full border-collapse">
          <thead>
            <tr className={cn("border-b border-black/5 text-left text-[11px] font-semibold uppercase tracking-[0.22em]", getMutedTextClasses(settings.scheme))}>
              <th className="px-4 py-4 sm:px-5">Image</th>
              <th className="px-4 py-4 sm:px-5">Food Name</th>
              <th className="px-4 py-4 sm:px-5">Category</th>
              <th className="px-4 py-4 sm:px-5">Description</th>
              <th className="px-4 py-4 sm:px-5">Small Price</th>
              <th className="px-4 py-4 sm:px-5">Medium Price</th>
              <th className="px-4 py-4 sm:px-5">Large Price</th>
              <th className="px-4 py-4 sm:px-5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length ? (
              items.map((item) => (
                <ManageMenuRow
                  key={item.id}
                  item={item}
                  settings={settings}
                  onEdit={onEdit}
                  onRemove={onRemove}
                />
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-5 py-16 text-center">
                  <div className="text-base font-semibold">No menu items match the current filters.</div>
                  <div className={cn("mt-2 text-sm", getMutedTextClasses(settings.scheme))}>
                    Adjust the search term or category to see more dishes.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
