import { SearchIcon } from "../icons";
import {
  cn,
  getManagerBodyTextClasses,
  getManagerCardShellClasses,
  getManagerControlShellClasses,
  getManagerSectionSubtitleClasses,
  getManagerSectionTitleClasses,
  getManagerTableHeaderClasses,
  getManagerTableHeaderPaddingClasses,
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
  return (
    <section
      className={cn("overflow-hidden", getManagerCardShellClasses(settings.scheme, { interactive: true }))}
    >
      <div className="border-b border-black/5 px-4 py-5 sm:px-5 sm:py-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className={getManagerSectionTitleClasses()}>Menu Items</h3>
            <p className={getManagerSectionSubtitleClasses(settings.scheme)}>
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
            Sorted by category and price
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-3 md:flex-row">
            <label className="min-w-0 flex-1">
              <span className="sr-only">Search menu items</span>
              <div className={getManagerControlShellClasses(settings.scheme)}>
                <SearchIcon className="size-4 text-slate-400" />
                <input
                  type="search"
                  value={searchValue}
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder="Search food by name..."
                  className="w-full bg-transparent text-[15px] outline-none placeholder:text-inherit"
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

          <div className={cn("font-medium", getManagerBodyTextClasses(settings.scheme))}>
            {resultCount} result{resultCount === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
          <table className="min-w-[1120px] w-full border-collapse">
            <thead>
              <tr className={cn("border-b border-black/5", getManagerTableHeaderClasses(settings.scheme))}>
                <th className={getManagerTableHeaderPaddingClasses()}>Image</th>
                <th className={getManagerTableHeaderPaddingClasses()}>Food Name</th>
                <th className={getManagerTableHeaderPaddingClasses()}>Category</th>
                <th className={getManagerTableHeaderPaddingClasses()}>Description</th>
                <th className={getManagerTableHeaderPaddingClasses()}>Small Price</th>
                <th className={getManagerTableHeaderPaddingClasses()}>Medium Price</th>
                <th className={getManagerTableHeaderPaddingClasses()}>Large Price</th>
                <th className={getManagerTableHeaderPaddingClasses()}>Actions</th>
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
                  <div className="text-lg font-semibold">No menu items match the current filters.</div>
                  <div className={cn("mt-2", getManagerBodyTextClasses(settings.scheme))}>
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
