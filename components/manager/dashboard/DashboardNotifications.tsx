import { BellIcon } from "@/components/manager/icons";
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
import type { ManagerNotification } from "@/lib/manager-dashboard-api";
import {
  MANAGER_DASHBOARD_ACTIVITY_CARD_HEADER,
  MANAGER_DASHBOARD_ACTIVITY_CARD_HEIGHT,
  MANAGER_DASHBOARD_ACTIVITY_CARD_LAYOUT,
  MANAGER_DASHBOARD_ACTIVITY_CARD_SCROLL_AREA,
} from "./dashboardLayout";

function formatActivityTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unavailable";
  }

  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function DashboardNotifications({
  settings,
  notifications,
}: {
  settings: ManagerSettings;
  notifications: ManagerNotification[];
}) {
  return (
    <div
      className={cn(
        MANAGER_DASHBOARD_ACTIVITY_CARD_HEIGHT,
        MANAGER_DASHBOARD_ACTIVITY_CARD_LAYOUT,
        "rounded-[22px] border p-5 sm:p-6",
        getContentSurfaceClasses(settings.scheme),
      )}
    >
      <div className={MANAGER_DASHBOARD_ACTIVITY_CARD_HEADER}>
        <h3 className={getManagerSectionTitleClasses()}>Notifications</h3>
        <p className={getManagerSectionSubtitleClasses(settings.scheme)}>Latest branch activity</p>
      </div>

      <div className={cn(MANAGER_DASHBOARD_ACTIVITY_CARD_SCROLL_AREA, "mt-6 space-y-3 pr-1")}>
        {notifications.length ? (
          notifications.map((item) => (
            <div
              key={`${item.type}-${item.entityId}-${item.createdAt}`}
              className={cn("w-full rounded-[18px] border p-4 text-left", getSecondarySurfaceClasses(settings.scheme), getInteractiveRowClasses(settings.scheme))}
            >
              <div className="flex items-start gap-3">
                <span className="mt-1 flex size-9 items-center justify-center rounded-md bg-[linear-gradient(135deg,#2563eb,#38bdf8)] text-white">
                  <BellIcon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{item.title}</div>
                  <div className={cn("mt-1 text-sm leading-6", getMutedTextClasses(settings.scheme))}>
                    {item.description}
                  </div>
                  <div className={cn("mt-2 text-xs font-medium uppercase tracking-[0.22em]", getMutedTextClasses(settings.scheme))}>
                    {formatActivityTime(item.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className={cn("text-sm", getMutedTextClasses(settings.scheme))}>
            No recent dashboard activity is available.
          </p>
        )}
      </div>
    </div>
  );
}
