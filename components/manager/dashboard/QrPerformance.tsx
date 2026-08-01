import {
  cn,
  getContentSurfaceClasses,
  getInteractiveRowClasses,
  getManagerSectionSubtitleClasses,
  getManagerSectionTitleClasses,
  getMutedTextClasses,
  getSecondarySurfaceClasses,
} from "@/components/manager/managerUtils";
import type { ManagerSettings } from "@/components/manager/managerTypes";
import type { QrPerformance as QrPerformanceData } from "@/lib/manager-dashboard-api";

export function QrPerformance({
  settings,
  qrPerformance,
}: {
  settings: ManagerSettings;
  qrPerformance: QrPerformanceData;
}) {
  const rows = [
    {
      label: "QR Scans Today",
      value: String(qrPerformance.scansToday),
      note: qrPerformance.available ? "Recorded scan events today" : "Scan events are not currently recorded",
    },
    {
      label: "Peak Scan Window",
      value: qrPerformance.peakScanWindow ?? "Unavailable",
      note: qrPerformance.available ? "Highest customer activity" : "Requires QR scan event history",
    },
    {
      label: "Top Scanned Category",
      value: qrPerformance.topScannedCategory ?? "Unavailable",
      note: qrPerformance.available ? "Most viewed menu section" : "Requires category-level QR analytics",
    },
    {
      label: "Active Sessions",
      value: String(qrPerformance.activeSessions),
      note: qrPerformance.available ? "Customers currently browsing" : "Session tracking is unavailable",
    },
  ];

  return (
    <div className={cn("h-full rounded-[22px] border p-5 sm:p-6", getContentSurfaceClasses(settings.scheme))}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className={getManagerSectionTitleClasses()}>QR Performance</h3>
          <p className={getManagerSectionSubtitleClasses(settings.scheme)}>
            Digital menu engagement snapshot
          </p>
        </div>
        <span className={cn("inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]", settings.scheme === "dark" ? "bg-white/8 text-slate-300" : "bg-slate-100 text-slate-500")}>
          Today
        </span>
      </div>

      <div className="mt-6 space-y-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className={cn("w-full rounded-[18px] border p-4 text-left", getSecondarySurfaceClasses(settings.scheme), getInteractiveRowClasses(settings.scheme))}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm font-semibold">{row.label}</div>
              <div className="text-sm font-bold">{row.value}</div>
            </div>
            <div className={cn("mt-2 text-sm leading-6", getMutedTextClasses(settings.scheme))}>
              {row.note}
            </div>
          </div>
        ))}
      </div>

      {!qrPerformance.available && qrPerformance.reason ? (
        <p className={cn("mt-5 text-sm", getMutedTextClasses(settings.scheme))}>
          {qrPerformance.reason}
        </p>
      ) : null}
    </div>
  );
}
