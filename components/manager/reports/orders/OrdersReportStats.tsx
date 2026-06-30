import type { ManagerSettings } from "../../managerTypes";
import { ReportStatCard } from "../ReportStatCard";
import type { OrdersReportStatsData, ReportStat } from "../reports.types";

interface OrdersReportStatsProps {
  settings: ManagerSettings;
  stats?: OrdersReportStatsData;
}

export function OrdersReportStats({ settings, stats }: OrdersReportStatsProps) {
  const reportStats: ReportStat[] = [
    {
      label: "TOTAL MONTHLY ORDERS",
      value: String(stats?.totalMonthlyOrders ?? 0),
      helperText: "Orders placed within the selected reporting period.",
      accent: "blue",
    },
    {
      label: "REVENUE",
      value: formatCurrency(stats?.revenue ?? 0),
      helperText: "Gross revenue generated from completed and active orders.",
      accent: "purple",
    },
    {
      label: "QR SCANS",
      value: String(stats?.qrScans ?? 0),
      helperText: "Total QR scans captured across tracked tables and sessions.",
      accent: "amber",
    },
    {
      label: "PENDING PAYMENTS",
      value: formatCurrency(stats?.pendingPayments ?? 0),
      helperText: "Open payment amount awaiting collection or settlement.",
      accent: "red",
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {reportStats.map((stat) => (
        <ReportStatCard key={stat.label} settings={settings} stat={stat} />
      ))}
    </section>
  );
}

function formatCurrency(value: number) {
  return `Rs. ${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}
