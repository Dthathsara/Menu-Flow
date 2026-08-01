"use client";

import { lazy, Suspense } from "react";
import type { ReportTab } from "./reports/reports.types";
import type { RestaurantProfile } from "./settings/settings.types";
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

const BillingPageView = lazy(() =>
  import("./billing/BillingPageView").then((module) => ({
    default: module.BillingPageView,
  })),
);
const DashboardContent = lazy(() =>
  import("./DashboardContent").then((module) => ({
    default: module.DashboardContent,
  })),
);
const GenerateQrPage = lazy(() =>
  import("./qr-codes/GenerateQrPage").then((module) => ({
    default: module.GenerateQrPage,
  })),
);
const InvoicePageView = lazy(() =>
  import("./invoices/InvoicePageView").then((module) => ({
    default: module.InvoicePageView,
  })),
);
const ManageMenuPage = lazy(() =>
  import("./manage-menu/ManageMenuPage").then((module) => ({
    default: module.ManageMenuPage,
  })),
);
const OrdersPageView = lazy(() =>
  import("./orders/OrdersPageView").then((module) => ({
    default: module.OrdersPageView,
  })),
);
const ReportsPageView = lazy(() =>
  import("./reports/ReportsPageView").then((module) => ({
    default: module.ReportsPageView,
  })),
);
const SettingsPageView = lazy(() =>
  import("./settings/SettingsPageView").then((module) => ({
    default: module.SettingsPageView,
  })),
);
const UsersPageView = lazy(() =>
  import("./users/UsersPageView").then((module) => ({
    default: module.UsersPageView,
  })),
);

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
  const fallback = (
    <section className={getManagerPageSectionClasses()}>
      <div className={cn("p-6", getManagerCardShellClasses(settings.scheme, { interactive: false }))}>
        <div className={cn("text-[15px]", getMutedTextClasses(settings.scheme))}>
          Loading {activeItem.pageTitle.toLowerCase()}...
        </div>
      </div>
    </section>
  );

  if (activeItem.key === "dashboard") {
    return (
      <Suspense fallback={fallback}>
        <DashboardContent settings={settings} />
      </Suspense>
    );
  }

  if (activeItem.key === "manage-menu") {
    return (
      <Suspense fallback={fallback}>
        <ManageMenuPage settings={settings} />
      </Suspense>
    );
  }

  if (activeItem.key === "orders") {
    return (
      <Suspense fallback={fallback}>
        <OrdersPageView settings={settings} />
      </Suspense>
    );
  }

  if (activeItem.key === "generate-qr") {
    return (
      <Suspense fallback={fallback}>
        <GenerateQrPage settings={settings} />
      </Suspense>
    );
  }

  if (activeItem.key === "users") {
    return (
      <Suspense fallback={fallback}>
        <UsersPageView settings={settings} />
      </Suspense>
    );
  }

  if (activeItem.key === "reports") {
    return (
      <Suspense fallback={fallback}>
        <ReportsPageView settings={settings} initialTab={initialReportTab} />
      </Suspense>
    );
  }

  if (activeItem.key === "billing") {
    return (
      <Suspense fallback={fallback}>
        <BillingPageView settings={settings} />
      </Suspense>
    );
  }

  if (activeItem.key === "settings") {
    return (
      <Suspense fallback={fallback}>
        <SettingsPageView
          settings={settings}
          restaurantProfile={restaurantProfile}
          onUpdateRestaurantProfile={onUpdateRestaurantProfile}
        />
      </Suspense>
    );
  }

  if (activeItem.key === "invoices") {
    return (
      <Suspense fallback={fallback}>
        <InvoicePageView settings={settings} />
      </Suspense>
    );
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
