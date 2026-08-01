import {
  cn,
  getContentSurfaceClasses,
  getInteractiveRowClasses,
  getManagerSectionSubtitleClasses,
  getManagerSectionTitleClasses,
  getMutedTextClasses,
  getSecondarySurfaceClasses,
} from "@/components/manager/managerUtils";
import type { ManagerSettings } from "@/components/manager/managerTypes";
import type { BranchSnapshot as BranchSnapshotData } from "@/lib/manager-dashboard-api";

function percent(value: number | null) {
  return value === null ? "Unavailable" : `${value}%`;
}

export function BranchSnapshot({
  settings,
  snapshot,
}: {
  settings: ManagerSettings;
  snapshot: BranchSnapshotData;
}) {
  const rows = [
    { label: "Active Staff", value: String(snapshot.activeStaff) },
    { label: "Kitchen Efficiency", value: percent(snapshot.kitchenEfficiency) },
    { label: "Dining Capacity Used", value: percent(snapshot.diningCapacityUsed) },
    {
      label: "Complaints Logged",
      value: snapshot.complaintsLogged.available
        ? String(snapshot.complaintsLogged.value ?? 0)
        : "Unavailable",
    },
  ];

  return (
    <div className={cn("h-full rounded-[22px] border p-5 sm:p-6", getContentSurfaceClasses(settings.scheme))}>
      <div>
        <h3 className={getManagerSectionTitleClasses()}>Branch Snapshot</h3>
        <p className={getManagerSectionSubtitleClasses(settings.scheme)}>Today&apos;s operational health</p>
      </div>

      <div className="mt-6 space-y-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className={cn("flex w-full items-center justify-between gap-4 rounded-[18px] border p-4 text-left", getSecondarySurfaceClasses(settings.scheme), getInteractiveRowClasses(settings.scheme))}
          >
            <span className="text-sm font-medium">{row.label}</span>
            <span className="text-right text-sm font-bold">{row.value}</span>
          </div>
        ))}
      </div>

      {!snapshot.complaintsLogged.available && snapshot.complaintsLogged.reason ? (
        <p className={cn("mt-5 text-sm", getMutedTextClasses(settings.scheme))}>
          {snapshot.complaintsLogged.reason}
        </p>
      ) : null}
    </div>
  );
}
