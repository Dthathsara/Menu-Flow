import type { AdminScheme } from "../common/adminTypes";
import { PackageUsageChart } from "./PackageUsageChart";
import { RevenueChart } from "./RevenueChart";

export function DashboardCharts({ scheme }: { scheme: AdminScheme }) {
  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
      <RevenueChart scheme={scheme} />
      <PackageUsageChart scheme={scheme} />
    </section>
  );
}

