"use client";

import { useRouter } from "next/navigation";
import {
  MenuBookIcon,
  OrdersIcon,
  QrCodeIcon,
  ReportsIcon,
} from "@/components/manager/icons";
import {
  cn,
  getContentSurfaceClasses,
  getInteractiveSecondaryButtonClasses,
  getManagerSectionSubtitleClasses,
  getManagerSectionTitleClasses,
} from "@/components/manager/managerUtils";
import type { ManagerSettings } from "@/components/manager/managerTypes";
import type { ManagerDashboardData } from "@/lib/manager-dashboard-api";
import {
  MANAGER_DASHBOARD_ACTIVITY_CARD_HEADER,
  MANAGER_DASHBOARD_ACTIVITY_CARD_HEIGHT,
  MANAGER_DASHBOARD_ACTIVITY_CARD_LAYOUT,
  MANAGER_DASHBOARD_ACTIVITY_CARD_SCROLL_AREA,
} from "./dashboardLayout";

const quickActionRoutes = {
  todayPerformance: "/manager/reports?tab=orders",
  manageMenu: "/manager/manage-menu",
  generateQrCode: "/manager/qr-codes",
  kitchenQueue: "/manager/orders",
  addMenuItem: "/manager/manage-menu",
  allOrders: "/manager/orders",
  generateQrBatch: "/manager/qr-codes",
} as const;

export function getManagerDashboardQuickActionRoutes() {
  return {
    "View Today's Performance": quickActionRoutes.todayPerformance,
    "Manage Menu": quickActionRoutes.manageMenu,
    "Generate New QR Code": quickActionRoutes.generateQrCode,
    "Open Kitchen Queue": quickActionRoutes.kitchenQueue,
    "Add Menu Item": quickActionRoutes.addMenuItem,
    "View All Orders": quickActionRoutes.allOrders,
    "Generate QR Batch": quickActionRoutes.generateQrBatch,
    "Download Daily Report": "client CSV export from dashboard data",
  };
}

function downloadDailyReport(data: ManagerDashboardData) {
  const rows = [
    ["Metric", "Value"],
    ["Restaurant", data.summary.restaurantName],
    ["Branch", data.summary.branchName ?? ""],
    ["Revenue Today", String(data.metrics.revenueToday)],
    ["Total Orders Today", String(data.metrics.totalOrdersToday)],
    ["Live Orders", String(data.metrics.liveOrders)],
    ["Average Preparation Minutes", String(data.metrics.averagePreparationMinutes)],
    ["Active Staff", String(data.branchSnapshot.activeStaff)],
  ];
  const csv = rows
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `menuflow-daily-report-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function DashboardQuickActions({
  settings,
  data,
}: {
  settings: ManagerSettings;
  data: ManagerDashboardData;
}) {
  const router = useRouter();
  const actions = [
    { label: "View Today's Performance", icon: ReportsIcon, run: () => router.push(quickActionRoutes.todayPerformance) },
    { label: "Manage Menu", icon: MenuBookIcon, run: () => router.push(quickActionRoutes.manageMenu) },
    { label: "Generate New QR Code", icon: QrCodeIcon, run: () => router.push(quickActionRoutes.generateQrCode) },
    { label: "Open Kitchen Queue", icon: OrdersIcon, run: () => router.push(quickActionRoutes.kitchenQueue) },
    { label: "Add Menu Item", icon: MenuBookIcon, run: () => router.push(quickActionRoutes.addMenuItem) },
    { label: "View All Orders", icon: OrdersIcon, run: () => router.push(quickActionRoutes.allOrders) },
    { label: "Generate QR Batch", icon: QrCodeIcon, run: () => router.push(quickActionRoutes.generateQrBatch) },
    { label: "Download Daily Report", icon: ReportsIcon, run: () => downloadDailyReport(data) },
  ];

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
        <h3 className={getManagerSectionTitleClasses()}>Quick Actions</h3>
        <p className={getManagerSectionSubtitleClasses(settings.scheme)}>Manager shortcuts</p>
      </div>

      <div className={cn(MANAGER_DASHBOARD_ACTIVITY_CARD_SCROLL_AREA, "mt-6 grid gap-3 pr-1 sm:grid-cols-2 xl:grid-cols-1")}>
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.label}
              type="button"
              onClick={action.run}
              className={cn(
                "flex shrink-0 items-center gap-3 rounded-[18px] border px-4 py-4 text-left text-[15px] font-semibold",
                settings.scheme === "dark"
                  ? "border-white/10 bg-white/6 hover:bg-white/9"
                  : "border-slate-200 bg-slate-50 hover:bg-white",
                getInteractiveSecondaryButtonClasses(settings.scheme),
              )}
            >
              <span className="flex size-10 items-center justify-center rounded-md bg-[linear-gradient(135deg,#2563eb,#38bdf8)] text-white">
                <Icon className="size-4.5" />
              </span>
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
