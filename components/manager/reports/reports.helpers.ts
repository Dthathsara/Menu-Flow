import { cn, getFocusRingClasses } from "../managerUtils";
import type { Scheme } from "../managerTypes";
import type { ProgressMetric, ReportStaffRole } from "./reports.types";

export function getReportsSurfaceClasses(scheme: Scheme, interactive = false) {
  return cn(
    "rounded-[24px] border",
    scheme === "dark"
      ? "border-[#18305C] bg-[linear-gradient(180deg,#09172D_0%,#071426_100%)] text-white shadow-[0_28px_60px_rgba(2,6,23,0.34)]"
      : "border-slate-200 bg-white text-slate-900 shadow-[0_20px_50px_rgba(15,23,42,0.08)]",
    interactive &&
      (scheme === "dark"
        ? "transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[#25447F]"
        : "transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-300"),
  );
}

export function getReportsPanelClasses(scheme: Scheme) {
  return cn(
    "rounded-[20px] border",
    scheme === "dark"
      ? "border-[#1A2B4D] bg-[#081425]"
      : "border-slate-200 bg-slate-50/90",
  );
}

export function getReportsTagClasses(scheme: Scheme) {
  return cn(
    "inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]",
    scheme === "dark" ? "bg-[#243A66] text-white" : "bg-blue-50 text-blue-700",
  );
}

export function getReportsMicroLabelClasses(scheme: Scheme) {
  return cn(
    "text-[11px] font-semibold uppercase tracking-[0.22em]",
    scheme === "dark" ? "text-[#8FA2C6]" : "text-slate-500",
  );
}

export function getReportsMutedTextClasses(scheme: Scheme) {
  return scheme === "dark" ? "text-[#A2B1CF]" : "text-slate-500";
}

export function getReportsButtonClasses(scheme: Scheme) {
  return cn(
    "inline-flex h-10 items-center justify-center rounded-[14px] border px-4 text-[14px] font-semibold transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]",
    scheme === "dark"
      ? "border-[#22385F] bg-[#0C1830] text-white hover:border-[#355B98] hover:bg-[#12213D]"
      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
    getFocusRingClasses(scheme),
  );
}

export function getReportsRoleBadgeClasses(role: ReportStaffRole, scheme: Scheme) {
  if (role === "Waiter") {
    return scheme === "dark"
      ? "border-blue-400/18 bg-blue-500/12 text-blue-200"
      : "border-blue-200 bg-blue-50 text-blue-700";
  }

  if (role === "Counter") {
    return scheme === "dark"
      ? "border-cyan-400/18 bg-cyan-500/12 text-cyan-200"
      : "border-cyan-200 bg-cyan-50 text-cyan-700";
  }

  return scheme === "dark"
    ? "border-amber-400/18 bg-amber-500/12 text-amber-200"
    : "border-amber-200 bg-amber-50 text-amber-700";
}

export function getProgressToneClasses(
  tone: ProgressMetric["tone"],
  scheme: Scheme,
) {
  if (tone === "blue") {
    return scheme === "dark"
      ? "bg-[linear-gradient(90deg,#56B4FF_0%,#3E86FF_45%,#3B6AE7_100%)]"
      : "bg-[linear-gradient(90deg,#60A5FA_0%,#2563EB_100%)]";
  }

  if (tone === "purple") {
    return scheme === "dark"
      ? "bg-[linear-gradient(90deg,#B36CFF_0%,#8A52F7_100%)]"
      : "bg-[linear-gradient(90deg,#C084FC_0%,#8B5CF6_100%)]";
  }

  if (tone === "cyan") {
    return scheme === "dark"
      ? "bg-[linear-gradient(90deg,#31E0D7_0%,#28B7E6_100%)]"
      : "bg-[linear-gradient(90deg,#22D3EE_0%,#0891B2_100%)]";
  }

  if (tone === "orange") {
    return scheme === "dark"
      ? "bg-[linear-gradient(90deg,#FFAC38_0%,#FF7B1A_100%)]"
      : "bg-[linear-gradient(90deg,#FDBA74_0%,#F97316_100%)]";
  }

  return scheme === "dark"
    ? "bg-[linear-gradient(90deg,#29D3AF_0%,#22C7D2_100%)]"
    : "bg-[linear-gradient(90deg,#34D399_0%,#06B6D4_100%)]";
}

export function getTrackClasses(scheme: Scheme) {
  return scheme === "dark" ? "bg-[#152641]" : "bg-slate-100";
}
