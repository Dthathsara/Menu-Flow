"use client";

import { ManagerDashboardOverview } from "@/components/manager/dashboard/ManagerDashboardOverview";
import type { ManagerSettings } from "./managerTypes";

interface DashboardContentProps {
  settings: ManagerSettings;
}

export function DashboardContent({ settings }: DashboardContentProps) {
  return <ManagerDashboardOverview settings={settings} />;
}
