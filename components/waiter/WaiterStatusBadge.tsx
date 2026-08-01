import { cn, getManagerBadgeClasses } from "@/components/manager/managerUtils";
import type { ManagerSettings } from "@/components/manager/managerTypes";
import type { WaiterOrderStatus, WaiterPaymentStatus, WaiterTableStatus } from "./types";

type Status = WaiterOrderStatus | WaiterTableStatus | WaiterPaymentStatus;

function getTone(status: Status) {
  if (status === "ready" || status === "delivered" || status === "paid" || status === "available") {
    return "success";
  }

  if (status === "preparing" || status === "pending" || status === "reserved") {
    return "warning";
  }

  if (status === "failed") {
    return "danger";
  }

  if (status === "accepted" || status === "occupied") {
    return "info";
  }

  return "neutral";
}

export function WaiterStatusBadge({
  status,
  settings,
}: {
  status: Status;
  settings: ManagerSettings;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize",
        getManagerBadgeClasses(getTone(status), settings.scheme),
      )}
    >
      {status}
    </span>
  );
}
