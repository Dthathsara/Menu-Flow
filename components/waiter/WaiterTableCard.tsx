import { cn, getMutedTextClasses } from "@/components/manager/managerUtils";
import type { ManagerSettings } from "@/components/manager/managerTypes";
import type { WaiterTable } from "./types";
import { WaiterStatusBadge } from "./WaiterStatusBadge";
import { WaiterSurface } from "./waiter-utils";

export function WaiterTableCard({
  settings,
  table,
  onSelect,
}: {
  settings: ManagerSettings;
  table: WaiterTable;
  onSelect: (table: WaiterTable) => void;
}) {
  return (
    <button type="button" onClick={() => onSelect(table)} className="text-left">
      <WaiterSurface settings={settings} className="h-full p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-base font-semibold">{table.name}</p>
            <p className={cn("mt-1 text-sm", getMutedTextClasses(settings.scheme))}>
              {table.seats} seats
            </p>
          </div>
          <WaiterStatusBadge status={table.status} settings={settings} />
        </div>
        <p className={cn("mt-5 text-sm", getMutedTextClasses(settings.scheme))}>
          {table.currentOrderId
            ? `${table.customer || "Guest"} · current order available`
            : table.customer || "No active order"}
        </p>
      </WaiterSurface>
    </button>
  );
}
