"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchOrdersReport,
  fetchOrdersReportExport,
  syncOrdersReport,
} from "@/lib/manager-order-reports-api";
import { SessionExpiredError } from "@/lib/auth-session";
import { getManagerPageSectionClasses } from "../../managerUtils";
import type { ManagerSettings } from "../../managerTypes";
import { OrderStatusMixCard } from "./OrderStatusMixCard";
import { OrdersReportHeader } from "./OrdersReportHeader";
import { OrdersReportStats } from "./OrdersReportStats";
import { PaymentSummaryCard } from "./PaymentSummaryCard";
import { PeakHoursCard } from "./PeakHoursCard";
import { QrUsageTable } from "./QrUsageTable";
import { SalesOverviewChart } from "./SalesOverviewChart";
import { TopSellingItemsTable } from "./TopSellingItemsTable";
import type { OrdersReportResponse } from "../reports.types";

interface OrdersReportsPageProps {
  settings: ManagerSettings;
}

export function OrdersReportsPage({ settings }: OrdersReportsPageProps) {
  const [report, setReport] = useState<OrdersReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const hasSyncedRef = useRef(false);

  const loadReport = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      if (!hasSyncedRef.current) {
        await syncOrdersReport().catch(() => undefined);
        hasSyncedRef.current = true;
      }

      setReport(await fetchOrdersReport());
    } catch (error) {
      setReport(null);
      setErrorMessage(getOrdersReportErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  async function handleExport() {
    if (isExporting) {
      return;
    }

    setIsExporting(true);
    setErrorMessage("");

    try {
      await exportOrdersReportPdf(await fetchOrdersReportExport());
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to export orders report.",
      );
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <section className={getManagerPageSectionClasses()}>
      <div className="mx-auto w-full max-w-[1700px] space-y-6 px-1 sm:px-2 xl:px-0">
        <OrdersReportHeader
          settings={settings}
          isExporting={isExporting}
          onExport={handleExport}
        />
        <OrdersReportStats settings={settings} stats={report?.stats} />

        {errorMessage ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-5 py-4 text-sm font-semibold text-rose-300">
            {errorMessage}
            <button
              type="button"
              onClick={() => void loadReport()}
              className="ml-4 underline underline-offset-4"
            >
              Retry
            </button>
          </div>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
          <SalesOverviewChart
            settings={settings}
            data={report?.salesOverview ?? []}
            isLoading={isLoading}
          />
          <PaymentSummaryCard settings={settings} summary={report?.paymentSummary} />
        </section>

        <section className="grid gap-6">
          <PeakHoursCard
            settings={settings}
            items={report?.peakHours ?? []}
            isLoading={isLoading}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <QrUsageTable
            settings={settings}
            rows={report?.qrUsage ?? []}
            isLoading={isLoading}
          />
          <TopSellingItemsTable
            settings={settings}
            rows={report?.topSellingItems ?? []}
            isLoading={isLoading}
          />
          <OrderStatusMixCard
            settings={settings}
            items={report?.orderStatusMix ?? []}
            isLoading={isLoading}
          />
        </section>
      </div>
    </section>
  );
}

function getOrdersReportErrorMessage(error: unknown) {
  if (error instanceof SessionExpiredError) {
    return "Your session has expired. Please log in again.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unable to load orders report. Please try again.";
}

async function exportOrdersReportPdf(report: OrdersReportResponse) {
  const jsPdfModule = (await import("jspdf")) as {
    default: new () => {
      text: (text: string, x: number, y: number) => void;
      setFontSize: (size: number) => void;
      save: (filename: string) => void;
      lastAutoTable?: { finalY: number };
    };
  };
  const autoTableModule = (await import("jspdf-autotable")) as {
    default?: (doc: unknown, options: unknown) => void;
    autoTable?: (doc: unknown, options: unknown) => void;
  };
  const doc = new jsPdfModule.default();
  const autoTable = autoTableModule.default ?? autoTableModule.autoTable;

  if (!autoTable) {
    throw new Error("PDF table exporter is not available.");
  }

  const generatedAt = new Date();
  const fileDate = generatedAt.toISOString().slice(0, 10);

  doc.setFontSize(18);
  doc.text("MenuFlow Orders Report", 14, 18);
  doc.setFontSize(10);
  doc.text(`Generated: ${generatedAt.toLocaleString()}`, 14, 26);
  doc.text(`Period: ${report.period.label}`, 14, 32);

  autoTable(doc, {
    startY: 40,
    head: [["Metric", "Value"]],
    body: [
      ["Total Monthly Orders", String(report.stats.totalMonthlyOrders)],
      ["Revenue", formatCurrency(report.stats.revenue)],
      ["QR Scans", String(report.stats.qrScans)],
      ["Pending Payments", formatCurrency(report.stats.pendingPayments)],
      ["Collected Revenue", formatCurrency(report.paymentSummary.collectedRevenue)],
      ["Tax Collected", formatCurrency(report.paymentSummary.taxCollected)],
      ["Service Charges", formatCurrency(report.paymentSummary.serviceCharges)],
    ],
  });

  autoTable(doc, {
    startY: (doc.lastAutoTable?.finalY ?? 80) + 10,
    head: [["Sales Overview", "Revenue"]],
    body: report.salesOverview.length
      ? report.salesOverview.map((point) => [point.label, point.amountLabel])
      : [["No sales overview data", ""]],
  });

  autoTable(doc, {
    startY: (doc.lastAutoTable?.finalY ?? 120) + 10,
    head: [["Peak Hour", "Orders"]],
    body: report.peakHours.length
      ? report.peakHours.map((item) => [item.label, item.valueLabel])
      : [["No peak hour data", ""]],
  });

  autoTable(doc, {
    startY: (doc.lastAutoTable?.finalY ?? 160) + 10,
    head: [["Table", "Scans / Day", "Orders", "Conversion"]],
    body: report.qrUsage.length
      ? report.qrUsage.map((row) => [
          row.table,
          String(row.scansPerDay),
          String(row.orders),
          row.conversion,
        ])
      : [["No QR usage data", "", "", ""]],
  });

  autoTable(doc, {
    startY: (doc.lastAutoTable?.finalY ?? 200) + 10,
    head: [["Top Item", "Quantity", "Revenue"]],
    body: report.topSellingItems.length
      ? report.topSellingItems.map((row) => [
          row.item,
          String(row.quantity),
          row.revenueLabel,
        ])
      : [["No top selling item data", "", ""]],
  });

  autoTable(doc, {
    startY: (doc.lastAutoTable?.finalY ?? 240) + 10,
    head: [["Order Status", "Count"]],
    body: report.orderStatusMix.length
      ? report.orderStatusMix.map((item) => [item.label, item.valueLabel])
      : [["No order status data", ""]],
  });

  doc.save(`menuflow-orders-report-${fileDate}.pdf`);
}

function formatCurrency(value: number) {
  return `Rs. ${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}
