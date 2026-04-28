"use client";

import { useSearchParams } from "next/navigation";
import type { ManagerSettings } from "../managerTypes";
import type { ReportTab } from "./reports.types";
import { OrdersReportsPage } from "./orders/OrdersReportsPage";
import { UsersReportsPage } from "./users/UsersReportsPage";

interface ReportsPageViewProps {
  settings: ManagerSettings;
  initialTab?: ReportTab;
}

function getReportTab(value: string | null | undefined): ReportTab {
  return value === "orders" ? "orders" : "users";
}

export function ReportsPageView({
  settings,
  initialTab = "users",
}: ReportsPageViewProps) {
  const searchParams = useSearchParams();
  const activeReportTab = getReportTab(searchParams.get("tab") ?? initialTab);

  return activeReportTab === "orders" ? (
    <OrdersReportsPage settings={settings} />
  ) : (
    <UsersReportsPage settings={settings} />
  );
}
