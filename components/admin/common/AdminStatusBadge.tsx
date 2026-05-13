import { cn } from "@/components/manager/managerUtils";
import type { AdminScheme } from "./adminTypes";

interface AdminStatusBadgeProps {
  scheme: AdminScheme;
  status: string;
}

export function AdminStatusBadge({ scheme, status }: AdminStatusBadgeProps) {
  const normalized = status.toLowerCase();
  const tone =
    normalized === "active" || normalized === "paid"
      ? scheme === "dark"
        ? "bg-emerald-500/14 text-emerald-300"
        : "bg-emerald-50 text-emerald-700"
      : normalized === "pending"
        ? scheme === "dark"
          ? "bg-amber-500/16 text-amber-300"
          : "bg-amber-50 text-amber-700"
        : normalized === "overdue"
          ? scheme === "dark"
            ? "bg-rose-500/16 text-rose-300"
            : "bg-rose-50 text-rose-700"
          : scheme === "dark"
            ? "bg-emerald-500/10 text-emerald-500"
            : "bg-slate-100 text-slate-600";

  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-bold", tone)}>
      {status}
    </span>
  );
}

