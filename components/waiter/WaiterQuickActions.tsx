import { BellIcon, HomeIcon, OrdersIcon } from "@/components/manager/icons";
import { cn, getManagerSecondaryButtonClasses } from "@/components/manager/managerUtils";
import type { ManagerSettings } from "@/components/manager/managerTypes";

const actions = [
  { label: "Open Orders", icon: OrdersIcon },
  { label: "Check Tables", icon: HomeIcon },
  { label: "View Alerts", icon: BellIcon },
];

export function WaiterQuickActions({ settings }: { settings: ManagerSettings }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {actions.map((action) => {
        const Icon = action.icon;

        return (
          <button
            key={action.label}
            type="button"
            className={cn(getManagerSecondaryButtonClasses(settings.scheme), "h-auto justify-start rounded-[18px] px-4 py-4")}
          >
            <span className="flex size-10 items-center justify-center rounded-md bg-[linear-gradient(135deg,#2563eb,#38bdf8)] text-white">
              <Icon className="size-4" />
            </span>
            {action.label}
          </button>
        );
      })}
    </div>
  );
}
