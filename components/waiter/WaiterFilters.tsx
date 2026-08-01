import { SearchIcon } from "@/components/manager/icons";
import { cn, getManagerSecondaryButtonClasses, getSearchInputClasses } from "@/components/manager/managerUtils";
import type { ManagerSettings } from "@/components/manager/managerTypes";
import type { WaiterOrderStatus } from "./types";

const ORDER_FILTERS: Array<"all" | WaiterOrderStatus> = [
  "all",
  "pending",
  "accepted",
  "preparing",
  "ready",
  "delivered",
];

export function WaiterFilters({
  settings,
  query,
  status,
  onQueryChange,
  onStatusChange,
}: {
  settings: ManagerSettings;
  query: string;
  status: "all" | WaiterOrderStatus;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: "all" | WaiterOrderStatus) => void;
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <label className={cn("flex h-11 min-w-0 items-center gap-2 rounded-lg border px-3 lg:w-[320px]", getSearchInputClasses(settings.topbar, settings.scheme))}>
        <SearchIcon className="size-4" />
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search orders, tables, customers..."
          className="w-full bg-transparent text-sm outline-none placeholder:inherit"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        {ORDER_FILTERS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onStatusChange(item)}
            className={cn(
              getManagerSecondaryButtonClasses(settings.scheme),
              "h-10 rounded-[14px] px-4 text-sm capitalize",
              status === item && "border-blue-400/50 bg-blue-500/16 text-blue-100",
            )}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
