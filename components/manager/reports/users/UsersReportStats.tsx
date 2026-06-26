import type { ManagerSettings } from "../../managerTypes";
import { ReportStatCard } from "../ReportStatCard";
import type { ReportStat, UsersReportStatsData } from "../reports.types";

interface UsersReportStatsProps {
  settings: ManagerSettings;
  stats?: UsersReportStatsData;
}

export function UsersReportStats({ settings, stats }: UsersReportStatsProps) {
  const reportStats: ReportStat[] = [
    {
      label: "TOTAL STAFF",
      value: String(stats?.totalStaff ?? 0),
      helperText: "Active staff members across restaurant operations.",
      accent: "blue",
    },
    {
      label: "WAITER ORDERS",
      value: String(stats?.waiterOrders ?? 0),
      helperText: "Orders served by waiter staff during the selected period.",
      accent: "amber",
    },
    {
      label: "STAFF REVENUE",
      value: formatCurrency(stats?.staffRevenue ?? 0),
      helperText: "Revenue handled by assigned restaurant staff.",
      accent: "purple",
    },
    {
      label: "ACTIVE SHIFTS",
      value: String(stats?.activeShifts ?? 0),
      helperText: "Currently tracked active or completed staff shifts.",
      accent: "green",
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
