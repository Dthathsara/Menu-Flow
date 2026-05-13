import { BellIcon } from "@/components/manager/icons";
import { cn, getContentSurfaceClasses, getInteractiveRowClasses, getManagerSectionSubtitleClasses, getManagerSectionTitleClasses, getMutedTextClasses, getSecondarySurfaceClasses } from "@/components/manager/managerUtils";
import type { AdminScheme } from "../common/adminTypes";

const activities = [
  { title: "New client onboarded", note: "Urban Spoon activated Growth package", time: "4 min ago" },
  { title: "Invoice paid", note: "INV-2048 was marked as paid", time: "18 min ago" },
  { title: "Staff role updated", note: "Maya Perera changed to Finance Admin", time: "43 min ago" },
  { title: "Package edited", note: "Premium plan feature limits were updated", time: "2 hr ago" },
];

export function RecentActivity({ scheme }: { scheme: AdminScheme }) {
  return (
    <div className={cn("h-full rounded-[22px] border p-5 transition-all duration-200 hover:-translate-y-0.5 sm:p-6", getContentSurfaceClasses(scheme))}>
      <h3 className={getManagerSectionTitleClasses()}>Recent Activity</h3>
      <p className={getManagerSectionSubtitleClasses(scheme)}>Latest admin and platform events</p>
      <div className="mt-6 space-y-3">
        {activities.map((item) => (
          <button
            key={item.title}
            type="button"
            className={cn("w-full cursor-pointer rounded-[18px] border p-4 text-left transition-all duration-200", getSecondarySurfaceClasses(scheme), getInteractiveRowClasses(scheme))}
          >
            <div className="flex items-start gap-3">
              <span className="mt-1 flex size-9 items-center justify-center rounded-md bg-[linear-gradient(135deg,#2563eb,#38bdf8)] text-white">
                <BellIcon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">{item.title}</div>
                <div className={cn("mt-1 text-sm leading-6", getMutedTextClasses(scheme))}>{item.note}</div>
                <div className={cn("mt-2 text-xs font-medium uppercase tracking-[0.22em]", getMutedTextClasses(scheme))}>{item.time}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
