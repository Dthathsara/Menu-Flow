import type { ManagerSettings } from "../../managerTypes";
import { orderReportStats } from "../reports.data";
import { ReportStatCard } from "../ReportStatCard";

interface OrdersReportStatsProps {
  settings: ManagerSettings;
}

export function OrdersReportStats({ settings }: OrdersReportStatsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {orderReportStats.map((stat) => (
        <ReportStatCard key={stat.label} settings={settings} stat={stat} />
      ))}
    </section>
  );
}
