import { cn, getContentSurfaceClasses, getManagerSectionSubtitleClasses, getManagerSectionTitleClasses, getMutedTextClasses, getSecondarySurfaceClasses } from "@/components/manager/managerUtils";
import type { AdminScheme } from "../common/adminTypes";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
const revenue = [42, 58, 64, 71, 86, 92, 104];

function points(values: number[], width: number, height: number) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return values.map((value, index) => ({
    x: 34 + (index * (width - 68)) / Math.max(values.length - 1, 1),
    y: 24 + ((max - value) / range) * (height - 64),
  }));
}

export function RevenueChart({ scheme }: { scheme: AdminScheme }) {
  const width = 720;
  const height = 260;
  const chartPoints = points(revenue, width, height);
  const line = chartPoints.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const baseY = height - 38;
  const area = `${line} L ${chartPoints[chartPoints.length - 1].x} ${baseY} L ${chartPoints[0].x} ${baseY} Z`;

  return (
    <div className={cn("h-full rounded-[22px] border p-5 sm:p-6", getContentSurfaceClasses(scheme))}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className={getManagerSectionTitleClasses()}>Revenue Summary</h3>
          <p className={getManagerSectionSubtitleClasses(scheme)}>Monthly subscription revenue trend</p>
        </div>
        <span className={cn("rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]", scheme === "dark" ? "bg-white/8 text-slate-300" : "bg-slate-100 text-slate-500")}>
          Rs. 3.42M YTD
        </span>
      </div>
      <div className={cn("mt-6 rounded-[18px] border p-5", getSecondarySurfaceClasses(scheme))}>
        <div className="overflow-x-auto">
          <div className="min-w-[620px]">
            <svg viewBox={`0 0 ${width} ${height}`} className="h-[260px] w-full" aria-hidden="true">
              <defs>
                <linearGradient id="adminRevenueArea" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              {[0, 1, 2, 3].map((row) => (
                <line key={row} x1="18" x2={width - 18} y1={34 + row * 48} y2={34 + row * 48} stroke={scheme === "dark" ? "rgba(255,255,255,.08)" : "rgba(148,163,184,.24)"} strokeDasharray="6 8" />
              ))}
              <path d={area} fill="url(#adminRevenueArea)" />
              <path d={line} fill="none" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              {chartPoints.map((point) => (
                <g key={`${point.x}-${point.y}`}>
                  <circle cx={point.x} cy={point.y} r="7" fill="#fff" />
                  <circle cx={point.x} cy={point.y} r="4" fill="#2563eb" />
                </g>
              ))}
            </svg>
            <div className="mt-3 grid grid-cols-7 gap-2">
              {months.map((month) => (
                <div key={month} className={cn("text-center text-xs font-semibold uppercase tracking-[0.22em]", getMutedTextClasses(scheme))}>
                  {month}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

