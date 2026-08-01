import {
  cn,
  getContentSurfaceClasses,
  getManagerSectionSubtitleClasses,
  getManagerSectionTitleClasses,
  getMutedTextClasses,
  getSecondarySurfaceClasses,
} from "@/components/manager/managerUtils";
import type { ManagerSettings } from "@/components/manager/managerTypes";
import type { RevenueTrendPoint } from "@/lib/manager-dashboard-api";

function buildLinePoints(values: number[], width: number, height: number) {
  const paddingX = 34;
  const paddingTop = 22;
  const paddingBottom = 34;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  return values.map((value, index) => {
    const x = paddingX + (index * (width - paddingX * 2)) / Math.max(values.length - 1, 1);
    const y = paddingTop + ((max - value) / range) * (height - paddingTop - paddingBottom);

    return { x, y, value };
  });
}

function buildPath(points: Array<{ x: number; y: number }>) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

export function RevenueOrdersChart({
  settings,
  trend,
}: {
  settings: ManagerSettings;
  trend: RevenueTrendPoint[];
}) {
  const chartWidth = 720;
  const chartHeight = 260;
  const rows = trend.length ? trend : [];
  const revenuePoints = buildLinePoints(rows.map((row) => row.revenue), chartWidth, chartHeight);
  const orderPoints = buildLinePoints(rows.map((row) => row.orders), chartWidth, chartHeight);
  const linePath = buildPath(revenuePoints);
  const orderPath = buildPath(orderPoints);
  const baseY = chartHeight - 34;
  const areaPath = revenuePoints.length
    ? `${linePath} L ${revenuePoints[revenuePoints.length - 1]?.x ?? 0} ${baseY} L ${revenuePoints[0]?.x ?? 0} ${baseY} Z`
    : "";

  return (
    <div className={cn("h-full rounded-[22px] border p-5 sm:p-6", getContentSurfaceClasses(settings.scheme))}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className={getManagerSectionTitleClasses()}>Revenue & Orders Trend</h3>
          <p className={getManagerSectionSubtitleClasses(settings.scheme)}>
            Daily performance across the last 7 days
          </p>
        </div>
        <span
          className={cn(
            "inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
            settings.scheme === "dark" ? "bg-white/8 text-slate-300" : "bg-slate-100 text-slate-500",
          )}
        >
          Orders / Revenue
        </span>
      </div>

      <div className={cn("mt-6 rounded-[18px] border p-5", getSecondarySurfaceClasses(settings.scheme))}>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-blue-500" />
            <span className={getMutedTextClasses(settings.scheme)}>Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-cyan-400" />
            <span className={getMutedTextClasses(settings.scheme)}>Orders</span>
          </div>
        </div>

        {rows.length ? (
          <div className="mt-5 overflow-x-auto">
            <div className="min-w-[620px]">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-[260px] w-full" aria-hidden="true">
                <defs>
                  <linearGradient id="managerRevenueArea" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.24" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
                  </linearGradient>
                  <linearGradient id="managerOrdersLine" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.65" />
                  </linearGradient>
                </defs>

                {[0, 1, 2, 3].map((row) => {
                  const y = 32 + row * 50;

                  return (
                    <line
                      key={row}
                      x1="18"
                      x2={chartWidth - 18}
                      y1={y}
                      y2={y}
                      stroke={settings.scheme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(148,163,184,0.22)"}
                      strokeDasharray="6 8"
                    />
                  );
                })}

                {orderPoints.map((point, index) => (
                  <rect
                    key={rows[index]?.date ?? index}
                    x={point.x - 20}
                    y={point.y}
                    width="40"
                    height={baseY - point.y}
                    rx="16"
                    fill={settings.scheme === "dark" ? "rgba(34,211,238,0.12)" : "rgba(34,211,238,0.16)"}
                  />
                ))}

                <path d={areaPath} fill="url(#managerRevenueArea)" />
                <path d={linePath} stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d={orderPath} stroke="url(#managerOrdersLine)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeDasharray="8 8" />

                {revenuePoints.map((point, index) => (
                  <g key={`${rows[index]?.date ?? index}-revenue`}>
                    <circle cx={point.x} cy={point.y} r="7" fill="#ffffff" />
                    <circle cx={point.x} cy={point.y} r="4" fill="#2563eb" />
                  </g>
                ))}
              </svg>

              <div className="mt-3 grid grid-cols-7 gap-2">
                {rows.map((row) => (
                  <div key={row.date} className={cn("text-center text-xs font-semibold uppercase tracking-[0.22em]", getMutedTextClasses(settings.scheme))}>
                    {row.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className={cn("mt-6 text-sm", getMutedTextClasses(settings.scheme))}>
            Seven-day trend data is not available yet.
          </p>
        )}
      </div>
    </div>
  );
}
