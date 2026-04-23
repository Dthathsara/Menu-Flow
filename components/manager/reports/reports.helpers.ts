import {
  cn,
  getManagerAccentPillClasses,
  getManagerBadgeClasses,
  getManagerCardShellClasses,
  getManagerEyebrowClasses,
  getManagerPanelShellClasses,
  getManagerProgressTrackClasses,
  getManagerSecondaryButtonClasses,
  getMutedTextClasses,
} from "../managerUtils";
import type { Scheme } from "../managerTypes";
import type { ProgressMetric, ReportStaffRole } from "./reports.types";

export function getReportsSurfaceClasses(scheme: Scheme, interactive = false) {
  return getManagerCardShellClasses(scheme, { interactive });
}

export function getReportsPanelClasses(scheme: Scheme) {
  return getManagerPanelShellClasses(scheme);
}

export function getReportsTagClasses(scheme: Scheme) {
  return getManagerAccentPillClasses(scheme, "brand");
}

export function getReportsMicroLabelClasses(scheme: Scheme) {
  return getManagerEyebrowClasses(scheme);
}

export function getReportsMutedTextClasses(scheme: Scheme) {
  return getMutedTextClasses(scheme);
}

export function getReportsButtonClasses(scheme: Scheme) {
  return cn(
    getManagerSecondaryButtonClasses(scheme),
    "h-10 rounded-[14px] px-4 text-[14px]",
  );
}

export function getReportsRoleBadgeClasses(role: ReportStaffRole, scheme: Scheme) {
  if (role === "Waiter") {
    return getManagerBadgeClasses("brand", scheme);
  }

  if (role === "Counter") {
    return getManagerBadgeClasses("cyan", scheme);
  }

  return getManagerBadgeClasses("amber", scheme);
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
  return getManagerProgressTrackClasses(scheme);
}
