import { getManagerPageSectionClasses } from "../../managerUtils";
import type { ManagerSettings } from "../../managerTypes";
import { StaffRoleBreakdown } from "./StaffRoleBreakdown";
import { UserActivitySummary } from "./UserActivitySummary";
import { UsersReportHeader } from "./UsersReportHeader";
import { UsersReportStats } from "./UsersReportStats";
import { WaiterPerformanceTable } from "./WaiterPerformanceTable";

interface UsersReportsPageProps {
  settings: ManagerSettings;
}

export function UsersReportsPage({ settings }: UsersReportsPageProps) {
  return (
    <section className={getManagerPageSectionClasses()}>
      <div className="mx-auto w-full max-w-[1700px] space-y-6 px-1 sm:px-2 xl:px-0">
        <UsersReportHeader settings={settings} />
        <UsersReportStats settings={settings} />

        <section className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
          <WaiterPerformanceTable settings={settings} />
          <UserActivitySummary settings={settings} />
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <StaffRoleBreakdown settings={settings} />
        </section>
      </div>
    </section>
  );
}
