import {
  cn,
  getContentSurfaceClasses,
  getManagerPageSectionClasses,
  getSecondarySurfaceClasses,
} from "@/components/manager/managerUtils";
import type { ManagerSettings } from "@/components/manager/managerTypes";

function SkeletonBlock({ className, settings }: { className: string; settings: ManagerSettings }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[18px]",
        settings.scheme === "dark" ? "bg-white/8" : "bg-slate-200/80",
        className,
      )}
    />
  );
}

export function DashboardSkeleton({ settings }: { settings: ManagerSettings }) {
  return (
    <section className={getManagerPageSectionClasses()}>
      <div className={cn("rounded-[22px] border p-5 sm:p-6", getContentSurfaceClasses(settings.scheme))}>
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.9fr)]">
          <SkeletonBlock settings={settings} className="h-72" />
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, index) => (
              <SkeletonBlock key={index} settings={settings} className="h-36" />
            ))}
          </div>
        </div>
      </div>
      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.7fr)]">
        <div className={cn("rounded-[22px] border p-5 sm:p-6", getContentSurfaceClasses(settings.scheme))}>
          <SkeletonBlock settings={settings} className="h-72" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className={cn("rounded-[22px] border p-5 sm:p-6", getSecondarySurfaceClasses(settings.scheme))}>
              <SkeletonBlock settings={settings} className="h-32" />
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}
