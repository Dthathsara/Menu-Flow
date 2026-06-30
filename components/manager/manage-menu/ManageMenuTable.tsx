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
import type { CategorySelectOption } from "./CategorySelect";
import { ManageMenuRow } from "./ManageMenuRow";
import type { MenuAvailabilityFilter, MenuFilterCategory, MenuItemRecord } from "./types";

interface ManageMenuTableProps {
  items: MenuItemRecord[];
  settings: ManagerSettings;
  searchValue: string;
  category: MenuFilterCategory;
  categories: readonly CategorySelectOption[];
  availability: MenuAvailabilityFilter;
  availabilityOptions: readonly MenuAvailabilityFilter[];
  resultCount: number;
  totalItemCount: number;
  isLoading: boolean;
  errorMessage: string;
  categoryErrorMessage: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: MenuFilterCategory) => void;
  onAvailabilityChange: (value: MenuAvailabilityFilter) => void;
  onRetry: () => void;
  onEdit: (item: MenuItemRecord) => void;
  onRemove: (item: MenuItemRecord) => void;
}

export function ManageMenuTable({
  items,
  settings,
  searchValue,
  category,
  categories,
  availability,
  availabilityOptions,
  resultCount,
  totalItemCount,
  isLoading,
  errorMessage,
  categoryErrorMessage,
  onSearchChange,
  onCategoryChange,
  onAvailabilityChange,
  onRetry,
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

            <div className="min-w-0 md:w-[220px]">
              <CategorySelect
                value={availability}
                options={availabilityOptions}
                scheme={settings.scheme}
                label="Availability"
                onChange={(value) => onAvailabilityChange(value as MenuAvailabilityFilter)}
              />
            </div>
          </div>

          <div className={cn("font-medium", getManagerBodyTextClasses(settings.scheme))}>
            {resultCount} result{resultCount === 1 ? "" : "s"}
          </div>
        </div>

        {categoryErrorMessage ? (
          <div
            className={cn(
              "mt-3 flex flex-col gap-2 rounded-lg border px-3 py-2 text-sm font-medium sm:flex-row sm:items-center sm:justify-between",
              settings.scheme === "dark"
                ? "border-amber-400/20 bg-amber-400/10 text-amber-200"
                : "border-amber-200 bg-amber-50 text-amber-700",
            )}
          >
            <span>{categoryErrorMessage}</span>
            <button
              type="button"
              onClick={onRetry}
              className={cn(
                "self-start rounded-md px-2.5 py-1 text-xs font-semibold sm:self-auto",
                settings.scheme === "dark"
                  ? "bg-white/10 text-white hover:bg-white/15"
                  : "bg-white text-amber-700 hover:bg-amber-100",
              )}
            >
              Retry
            </button>
          </div>
        ) : null}
      </div>

      <div className="overflow-x-auto">
          <table className="min-w-[1240px] w-full border-collapse">
            <thead>
              <tr className={cn("border-b border-black/5", getManagerTableHeaderClasses(settings.scheme))}>
                <th className={getManagerTableHeaderPaddingClasses()}>Image</th>
                <th className={getManagerTableHeaderPaddingClasses()}>Food Name</th>
                <th className={getManagerTableHeaderPaddingClasses()}>Category</th>
                <th className={getManagerTableHeaderPaddingClasses()}>Sub Category</th>
                <th className={getManagerTableHeaderPaddingClasses()}>Description</th>
                <th className={getManagerTableHeaderPaddingClasses()}>Small Price</th>
                <th className={getManagerTableHeaderPaddingClasses()}>Medium Price</th>
                <th className={getManagerTableHeaderPaddingClasses()}>Large Price</th>
                <th className={getManagerTableHeaderPaddingClasses()}>Availability</th>
                <th className={getManagerTableHeaderPaddingClasses()}>Actions</th>
              </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={10} className="px-5 py-16 text-center">
                  <div className="text-lg font-semibold">Loading menu items...</div>
                  <div className={cn("mt-2", getManagerBodyTextClasses(settings.scheme))}>
                    Fetching the latest menu catalogue from the database.
                  </div>
                </td>
              </tr>
            ) : errorMessage ? (
              <tr>
                <td colSpan={10} className="px-5 py-16 text-center">
                  <div className="text-lg font-semibold text-rose-400">{errorMessage}</div>
                  <button
                    type="button"
                    onClick={onRetry}
                    className={cn(
                      "mt-4 inline-flex h-10 items-center rounded-lg px-4 text-sm font-semibold",
                      settings.scheme === "dark"
                        ? "bg-white/10 text-white hover:bg-white/15"
                        : "bg-slate-900 text-white hover:bg-slate-800",
                    )}
                  >
                    Retry
                  </button>
                </td>
              </tr>
            ) : items.length ? (
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
                <td colSpan={10} className="px-5 py-16 text-center">
                  <div className="text-lg font-semibold">
                    {totalItemCount === 0
                      ? "No menu items yet. Add your first item."
                      : "No menu items match the current filters."}
                  </div>
                  <div className={cn("mt-2", getManagerBodyTextClasses(settings.scheme))}>
                    {totalItemCount === 0
                      ? "Use the Add Item button to create a menu item from your database categories."
                      : "Adjust the search term, category, or availability filter to see more dishes."}
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
