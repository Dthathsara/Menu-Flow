"use client";

import { getManagerPageSectionClasses } from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import { OrderStatusMixCard } from "./OrderStatusMixCard";
import { PaymentSummaryCard } from "./PaymentSummaryCard";
import { PeakHoursCard } from "./PeakHoursCard";
import { QrUsageTable } from "./QrUsageTable";
import { ReportsHeader } from "./ReportsHeader";
import { SalesOverviewChart } from "./SalesOverviewChart";
import { TopSellingItemsTable } from "./TopSellingItemsTable";
import { WaiterPerformanceTable } from "./WaiterPerformanceTable";

interface ReportsPageViewProps {
  settings: ManagerSettings;
}

export function ReportsPageView({ settings }: ReportsPageViewProps) {
  return (
    <section className={getManagerPageSectionClasses()}>
      <div className="mx-auto w-full max-w-[1700px] space-y-6 px-1 sm:px-2 xl:px-0">
        <ReportsHeader settings={settings} />

        <section className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
          <SalesOverviewChart settings={settings} />
          <PaymentSummaryCard settings={settings} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
          <WaiterPerformanceTable settings={settings} />
          <PeakHoursCard settings={settings} />
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <QrUsageTable settings={settings} />
          <TopSellingItemsTable settings={settings} />
          <OrderStatusMixCard settings={settings} />
        </section>
      </div>
    </section>
  );
}
