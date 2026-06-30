"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchUserReport,
  fetchUserReportExport,
  fetchUserReportFilters,
  syncUserReports,
} from "@/lib/manager-user-reports-api";
import { SessionExpiredError } from "@/lib/auth-session";
import { getManagerPageSectionClasses } from "../../managerUtils";
import type { ManagerSettings } from "../../managerTypes";
import { StaffRoleBreakdown } from "./StaffRoleBreakdown";
import { UserActivitySummary } from "./UserActivitySummary";
import { UsersReportHeader } from "./UsersReportHeader";
import { UsersReportStats } from "./UsersReportStats";
import { WaiterPerformanceTable } from "./WaiterPerformanceTable";
import type { UserReportFilters, UserReportResponse } from "../reports.types";

interface UsersReportsPageProps {
  settings: ManagerSettings;
}

export function UsersReportsPage({ settings }: UsersReportsPageProps) {
  const [report, setReport] = useState<UserReportResponse | null>(null);
  const [filters, setFilters] = useState<UserReportFilters>({
    roles: [],
    periods: [],
  });
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const hasSyncedRef = useRef(false);

  const loadReport = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      if (!hasSyncedRef.current) {
        await syncUserReports();
        hasSyncedRef.current = true;
      }
      const [nextReport, nextFilters] = await Promise.all([
        fetchUserReport({ search, period }),
        fetchUserReportFilters().catch(() => null),
      ]);

      setReport(nextReport);
      setFilters(nextFilters ?? nextReport.filters);
    } catch (error) {
      setErrorMessage(getUserReportErrorMessage(error));
      setReport(null);
    } finally {
      setIsLoading(false);
    }
  }, [period, search]);

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  async function handleExport() {
    if (!report || isExporting) {
      return;
    }

    setIsExporting(true);

    try {
      const exportReport = await fetchUserReportExport({ search, period });

      await exportUsersReportPdf(exportReport, {
        period,
        search,
        periodLabel:
          period === "all"
            ? "All Periods"
            : filters.periods.find((item) => item.key === period)?.label ?? period,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to export users report.",
      );
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <section className={getManagerPageSectionClasses()}>
      <div className="mx-auto w-full max-w-[1700px] space-y-6 px-1 sm:px-2 xl:px-0">
        <UsersReportHeader
          settings={settings}
          isExporting={isExporting}
          onExport={handleExport}
        />
        <UsersReportStats settings={settings} stats={report?.stats} />

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
          <WaiterPerformanceTable
            settings={settings}
            rows={getWaiterPerformanceRows(report)}
            filters={filters}
            search={search}
            period={period}
            isLoading={isLoading}
            onSearchChange={setSearch}
            onPeriodChange={setPeriod}
          />
          <UserActivitySummary
            settings={settings}
            summary={report?.activitySummary ?? null}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <StaffRoleBreakdown
            settings={settings}
            items={report?.roleBreakdown ?? []}
          />
        </section>
      </div>
    </section>
  );
}

function getUserReportErrorMessage(error: unknown) {
  if (error instanceof SessionExpiredError) {
    return "Your session has expired. Please log in again.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unable to load users report. Please try again.";
}

function getWaiterPerformanceRows(report: UserReportResponse | null) {
  if (!report) {
    return [];
  }

  const rows = report.waiterPerformance.length ? report.waiterPerformance : report.rows;
  return rows.filter((row) => row.role.trim().toLowerCase() === "waiter");
}

async function exportUsersReportPdf(
  report: UserReportResponse,
  filters: {
    period: string;
    search: string;
    periodLabel: string;
  },
) {
  const jsPdfModule = await import("jspdf") as {
    default: new () => {
      text: (text: string, x: number, y: number) => void;
      setFontSize: (size: number) => void;
      save: (filename: string) => void;
      lastAutoTable?: { finalY: number };
    };
  };
  const autoTableModule = await import("jspdf-autotable") as {
    default?: (doc: unknown, options: unknown) => void;
  };
  const doc = new jsPdfModule.default();
  const autoTable =
    autoTableModule.default ??
    ((autoTableModule as { autoTable?: (doc: unknown, options: unknown) => void }).autoTable);

  if (!autoTable) {
    throw new Error("PDF table exporter is not available.");
  }

  const generatedAt = new Date();
  const dateLabel = generatedAt.toLocaleString();
  const fileDate = generatedAt.toISOString().slice(0, 10);

  doc.setFontSize(18);
  doc.text("MenuFlow Users Report", 14, 18);
  doc.setFontSize(10);
  doc.text(`Generated: ${dateLabel}`, 14, 26);
  doc.text(`Filters: Waiters / ${filters.periodLabel} / ${filters.search || "No search"}`, 14, 32);

  autoTable(doc, {
    startY: 40,
    head: [["Metric", "Value"]],
    body: [
      ["Total Staff", String(report.stats.totalStaff)],
      ["Waiter Orders", String(report.stats.waiterOrders)],
      ["Staff Revenue", formatCurrency(report.stats.staffRevenue)],
      ["Active Shifts", String(report.stats.activeShifts)],
    ],
  });

  autoTable(doc, {
    startY: (doc.lastAutoTable?.finalY ?? 72) + 10,
    head: [["Staff", "Role", "Orders", "Revenue", "Tables", "Period"]],
    body: getWaiterPerformanceRows(report).length
      ? getWaiterPerformanceRows(report).map((row) => [
          row.staff,
          row.role,
          String(row.orders),
          row.revenueLabel,
          String(row.tables),
          row.periodLabel,
        ])
      : [["No report data available", "", "", "", "", ""]],
  });

  const activity = report.activitySummary;
  autoTable(doc, {
    startY: (doc.lastAutoTable?.finalY ?? 120) + 10,
    head: [["Activity", "Value", "Details"]],
    body: [
      ["Most Active Waiter", activity.mostActiveWaiter.value, activity.mostActiveWaiter.helperText],
      ["Highest Revenue Handled", activity.highestRevenueHandled.value, activity.highestRevenueHandled.helperText],
      ["Most Tables Served", activity.mostTablesServed.value, activity.mostTablesServed.helperText],
      ["Average Orders Per Waiter", activity.averageOrdersPerWaiter.value, activity.averageOrdersPerWaiter.helperText],
    ],
  });

  autoTable(doc, {
    startY: (doc.lastAutoTable?.finalY ?? 170) + 10,
    head: [["Role", "Count"]],
    body: report.roleBreakdown.length
      ? report.roleBreakdown.map((item) => [item.role, String(item.count)])
      : [["No role breakdown available", ""]],
  });

  doc.save(`menuflow-users-report-${fileDate}.pdf`);
}

function formatCurrency(value: number) {
  return `Rs. ${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}
