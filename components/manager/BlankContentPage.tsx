import { BillingPageView } from "./billing/BillingPageView";
import { DashboardContent } from "./DashboardContent";
import { GenerateQrPage } from "./generate-qr/GenerateQrPage";
import { InvoicePageView } from "./invoices/InvoicePageView";
import { ManageMenuPage } from "./manage-menu/ManageMenuPage";
import { ReportsPageView } from "./reports";
import type { ReportTab } from "./reports/reports.types";
import { SettingsPageView } from "./settings/SettingsPageView";
import type { RestaurantProfile } from "./settings/settings.types";
import { UsersPageView } from "./view-users";
import { OrdersPageView } from "./view-orders";
import {
  cn,
  getManagerCardShellClasses,
  getManagerPageSectionClasses,
  getManagerPageSubtitleClasses,
  getManagerPageTitleClasses,
  getManagerPanelShellClasses,
  getManagerPillClasses,
  getManagerSectionTitleClasses,
  getMutedTextClasses,
} from "./managerUtils";
import type { ManagerNavItem, ManagerSettings } from "./managerTypes";

interface BlankContentPageProps {
  activeItem: ManagerNavItem;
  settings: ManagerSettings;
  initialReportTab?: ReportTab;
  restaurantProfile: RestaurantProfile;
  onUpdateRestaurantProfile: (profile: RestaurantProfile) => void;
}

export function BlankContentPage({
  activeItem,
  settings,
  initialReportTab = "users",
  restaurantProfile,
  onUpdateRestaurantProfile,
}: BlankContentPageProps) {
  if (activeItem.key === "dashboard") {
    return <DashboardContent settings={settings} />;
  }

  if (activeItem.key === "manage-menu") {
    return <ManageMenuPage settings={settings} />;
  }

  if (activeItem.key === "orders") {
    return <OrdersPageView settings={settings} />;
  }

  if (activeItem.key === "generate-qr") {
    return <GenerateQrPage settings={settings} />;
  }

  if (activeItem.key === "users") {
    return <UsersPageView settings={settings} />;
  }

  if (activeItem.key === "reports") {
    return <ReportsPageView settings={settings} initialTab={initialReportTab} />;
  }

  if (activeItem.key === "billing") {
    return <BillingPageView settings={settings} />;
  }

  if (activeItem.key === "settings") {
    return (
      <SettingsPageView
        settings={settings}
        restaurantProfile={restaurantProfile}
        onUpdateRestaurantProfile={onUpdateRestaurantProfile}
      />
    );
  }

  if (activeItem.key === "invoices") {
    return <InvoicePageView settings={settings} />;
  }

  return (
    <section className={getManagerPageSectionClasses()}>
      <div className="px-1">
        <div className={getManagerPillClasses(settings.scheme)}>
          Blank page
        </div>
        <h2 className={cn("mt-3", getManagerPageTitleClasses())}>{activeItem.pageTitle}</h2>
        <p className={getManagerPageSubtitleClasses(settings.scheme)}>
          {activeItem.description}
        </p>
      </div>

      <div
        className={cn("relative z-0 p-5 sm:p-6", getManagerCardShellClasses(settings.scheme, { interactive: false }))}
      >
        <div
          className={cn("flex min-h-[360px] flex-col border-dashed p-5 sm:min-h-[440px] sm:p-6", getManagerPanelShellClasses(settings.scheme))}
        >
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <div className={getManagerSectionTitleClasses()}>{activeItem.pageTitle}</div>
              <div className={cn("mt-1 text-[15px]", getMutedTextClasses(settings.scheme))}>
                Content area intentionally left blank for the next build phase.
              </div>
            </div>
            <div className={getManagerPillClasses(settings.scheme)}>
              Manager DB
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className={cn("text-[15px] font-semibold", getMutedTextClasses(settings.scheme))}>
                {activeItem.pageTitle} workspace
              </div>
              <div className={cn("mt-2 text-[15px]", getMutedTextClasses(settings.scheme))}>
                Ready for widgets, tables, charts, and page-level tools.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
