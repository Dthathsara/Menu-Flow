"use client";

import type { ManagerSettings } from "../managerTypes";
import type { ReportTab } from "./reports.types";
import { OrdersReportsPage } from "./orders/OrdersReportsPage";
import { UsersReportsPage } from "./users/UsersReportsPage";
interface ReportsPageViewProps {
  settings: ManagerSettings;
  initialTab?: ReportTab;
}

export function ReportsPageView({
  settings,
  initialTab = "users",
}: ReportsPageViewProps) {
  return initialTab === "orders" ? (
    <OrdersReportsPage settings={settings} />
  ) : (
    <UsersReportsPage settings={settings} />
  );
}
