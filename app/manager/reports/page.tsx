import type { Metadata } from "next";
import { ManagerDashboard } from "@/components/manager/ManagerDashboard";
import type { ReportTab } from "@/components/manager/reports/reports.types";

export const metadata: Metadata = {
  title: "MenuFlow | Manager Reports",
  description: "Track restaurant performance, revenue, QR activity, and staff reporting metrics.",
};

interface ManagerReportsPageProps {
  searchParams: Promise<{ tab?: string | string[] | undefined }>;
}

function getInitialReportTab(tab: string | string[] | undefined): ReportTab {
  return tab === "orders" || (Array.isArray(tab) && tab[0] === "orders") ? "orders" : "users";
}

export default async function ManagerReportsPage({
  searchParams,
}: ManagerReportsPageProps) {
  const { tab } = await searchParams;

  return (
    <ManagerDashboard
      initialActiveNav="reports"
      initialReportTab={getInitialReportTab(tab)}
    />
  );
}
