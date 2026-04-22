import { cn, getContentSurfaceClasses, getMutedTextClasses } from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import { ManageMenuRow } from "./ManageMenuRow";
import type { MenuItemRecord } from "./types";

interface ManageMenuTableProps {
  items: MenuItemRecord[];
  settings: ManagerSettings;
  onEdit: (item: MenuItemRecord) => void;
  onRemove: (item: MenuItemRecord) => void;
}

export function ManageMenuTable({
  items,
  settings,
  onEdit,
  onRemove,
}: ManageMenuTableProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-[20px] border",
        getContentSurfaceClasses(settings.scheme),
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-black/5 px-4 py-4 sm:px-5">
        <div>
          <h3 className="text-lg font-semibold">Menu Items</h3>
          <p className={cn("mt-1 text-sm", getMutedTextClasses(settings.scheme))}>
            Live menu catalogue for the active branch.
          </p>
        </div>
        <div className={cn("rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]", settings.scheme === "dark" ? "bg-white/8 text-slate-300" : "bg-slate-100 text-slate-500")}>
          {items.length} items
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
