import { DashboardContent } from "./DashboardContent";
import { ManageMenuPage } from "./manage-menu/ManageMenuPage";
import { cn, getContentSurfaceClasses, getMutedTextClasses, getSecondarySurfaceClasses } from "./managerUtils";
import type { ManagerNavItem, ManagerSettings } from "./managerTypes";

interface BlankContentPageProps {
  activeItem: ManagerNavItem;
  settings: ManagerSettings;
}

export function BlankContentPage({
  activeItem,
  settings,
}: BlankContentPageProps) {
  if (activeItem.key === "dashboard") {
    return <DashboardContent settings={settings} />;
  }

  if (activeItem.key === "manage-menu") {
    return <ManageMenuPage settings={settings} />;
  }

  return (
    <section className="relative z-0 space-y-5">
      <div className="px-1">
        <div className="inline-flex rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
          Blank page
        </div>
        <h2 className="mt-3 text-2xl font-bold">{activeItem.pageTitle}</h2>
        <p className={cn("mt-2 max-w-2xl text-sm leading-6", getMutedTextClasses(settings.scheme))}>
          {activeItem.description}
        </p>
      </div>

      <div
        className={cn(
          "relative z-0 rounded-[20px] border p-4 sm:p-5",
          getContentSurfaceClasses(settings.scheme),
        )}
      >
        <div
          className={cn(
            "flex min-h-[360px] flex-col rounded-[16px] border border-dashed p-4 sm:min-h-[440px] sm:p-6",
            getSecondarySurfaceClasses(settings.scheme),
          )}
        >
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <div className="text-lg font-semibold">{activeItem.pageTitle}</div>
              <div className={cn("mt-1 text-sm", getMutedTextClasses(settings.scheme))}>
                Content area intentionally left blank for the next build phase.
              </div>
            </div>
            <div className={cn("rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em]", settings.scheme === "dark" ? "bg-white/8 text-slate-300" : "bg-slate-100 text-slate-500")}>
              Manager DB
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className={cn("text-sm font-semibold", getMutedTextClasses(settings.scheme))}>
                {activeItem.pageTitle} workspace
              </div>
              <div className={cn("mt-2 text-sm", getMutedTextClasses(settings.scheme))}>
                Ready for widgets, tables, charts, and page-level tools.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
