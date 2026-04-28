import type { ManagerSettings } from "../../managerTypes";
import { userReportStats } from "../reports.data";
import { ReportStatCard } from "../ReportStatCard";

interface UsersReportStatsProps {
  settings: ManagerSettings;
}

export function UsersReportStats({ settings }: UsersReportStatsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {userReportStats.map((stat) => (
        <ReportStatCard key={stat.label} settings={settings} stat={stat} />
      ))}
    </section>
  );
}
