import type {
  LayoutMode,
  MenuTone,
  Scheme,
  SidebarSize,
  TopbarTone,
} from "./managerTypes";

export type ManagerBadgeTone =
  | "neutral"
  | "brand"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "cyan"
  | "amber"
  | "violet"
  | "teal";

export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function hasPersistentSidebar(sidebarSize: SidebarSize) {
  return sidebarSize !== "full" && sidebarSize !== "hidden";
}

export function isCondensedSidebar(sidebarSize: SidebarSize) {
  return sidebarSize === "condensed";
}

export function isHoverSidebar(sidebarSize: SidebarSize) {
  return sidebarSize === "hover";
}

export function getSidebarWidthClasses(sidebarSize: SidebarSize) {
  switch (sidebarSize) {
    case "compact":
      return "lg:w-[220px]";
    case "condensed":
      return "lg:w-[96px]";
    case "hover":
      return "lg:w-[96px] lg:hover:w-[264px]";
    case "default":
    default:
      return "lg:w-[264px]";
  }
}

export function getShellBackgroundClasses(scheme: Scheme) {
  return scheme === "dark"
    ? "bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_30%),linear-gradient(180deg,#0b1220_0%,#0f172a_48%,#111827_100%)] text-slate-100"
    : "bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.14),_transparent_28%),linear-gradient(180deg,#eff6ff_0%,#f8fafc_42%,#eef2ff_100%)] text-slate-900";
}

export function getTopbarToneClasses(tone: TopbarTone, scheme: Scheme) {
  if (tone === "dark") {
    return "border-slate-800 bg-slate-950 text-slate-100 shadow-[0_16px_38px_rgba(2,6,23,0.28)]";
  }

  if (tone === "brand") {
    return "border-blue-500/50 bg-[linear-gradient(135deg,#3b82f6,#1d4ed8)] text-white shadow-[0_20px_44px_rgba(37,99,235,0.28)]";
  }

  return scheme === "dark"
    ? "border-white/10 bg-slate-900/88 text-slate-100 shadow-[0_16px_38px_rgba(2,6,23,0.24)]"
    : "border-slate-200/80 bg-white/92 text-slate-900 shadow-[0_16px_38px_rgba(15,23,42,0.08)]";
}

export function getMenuToneClasses(tone: MenuTone, scheme: Scheme) {
  if (tone === "dark") {
    return "border-slate-800 bg-slate-950 text-slate-100 shadow-[0_24px_50px_rgba(2,6,23,0.28)]";
  }

  if (tone === "brand") {
    return "border-blue-400/40 bg-[linear-gradient(180deg,#3b82f6,#1d4ed8)] text-white shadow-[0_24px_52px_rgba(37,99,235,0.26)]";
  }

  return scheme === "dark"
    ? "border-white/10 bg-slate-900/86 text-slate-100 shadow-[0_24px_50px_rgba(2,6,23,0.22)]"
    : "border-slate-200/80 bg-white/95 text-slate-900 shadow-[0_24px_48px_rgba(15,23,42,0.08)]";
}

export function getHorizontalNavToneClasses(tone: MenuTone, scheme: Scheme) {
  if (tone === "brand") {
    return "border-blue-400/40 bg-[linear-gradient(180deg,#3b82f6,#1d4ed8)] text-white shadow-[0_20px_44px_rgba(37,99,235,0.22)]";
  }

  if (tone === "dark") {
    return "border-slate-800 bg-slate-950 text-slate-100 shadow-[0_18px_38px_rgba(2,6,23,0.26)]";
  }

  return scheme === "dark"
    ? "border-white/10 bg-slate-900/88 text-slate-100 shadow-[0_18px_38px_rgba(2,6,23,0.2)]"
    : "border-slate-200/80 bg-white/92 text-slate-900 shadow-[0_18px_38px_rgba(15,23,42,0.07)]";
}

export function getContentSurfaceClasses(scheme: Scheme) {
  return scheme === "dark"
    ? "border-white/10 bg-slate-950/56 shadow-[0_24px_52px_rgba(2,6,23,0.26)]"
    : "border-slate-200/80 bg-white/90 shadow-[0_24px_52px_rgba(15,23,42,0.08)]";
}

export function getSecondarySurfaceClasses(scheme: Scheme) {
  return scheme === "dark"
    ? "border-white/10 bg-slate-900/74"
    : "border-slate-200/80 bg-slate-50/90";
}

export function getManagerPageSectionClasses() {
  return "relative z-0 space-y-6 lg:space-y-7";
}

export function getManagerPageTitleClasses() {
  return "text-[2.05rem] font-bold tracking-tight sm:text-[2.2rem]";
}

export function getManagerPageSubtitleClasses(scheme: Scheme) {
  return cn("mt-2 max-w-2xl text-[15px] leading-7", getMutedTextClasses(scheme));
}

export function getManagerSectionTitleClasses() {
  return "text-[1.15rem] font-semibold sm:text-[1.25rem]";
}

export function getManagerSectionSubtitleClasses(scheme: Scheme) {
  return cn("mt-1 text-[15px] leading-6", getMutedTextClasses(scheme));
}

export function getManagerPillClasses(scheme: Scheme) {
  return cn(
    "inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]",
    scheme === "dark" ? "bg-white/8 text-slate-300" : "bg-slate-100 text-slate-500",
  );
}

export function getManagerAccentPillClasses(
  scheme: Scheme,
  tone: Exclude<ManagerBadgeTone, "neutral"> = "brand",
) {
  return cn(
    "inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]",
    getManagerBadgeClasses(tone, scheme),
  );
}

export function getManagerCardShellClasses(
  scheme: Scheme,
  options?: { interactive?: boolean; padded?: boolean },
) {
  const interactive = options?.interactive ?? true;
  const padded = options?.padded ?? false;

  return cn(
    "rounded-[22px] border",
    padded && "p-5 sm:p-6",
    getContentSurfaceClasses(scheme),
    interactive && getInteractiveCardClasses(scheme),
  );
}

export function getManagerPanelShellClasses(scheme: Scheme) {
  return cn("rounded-[18px] border", getSecondarySurfaceClasses(scheme));
}

export function getManagerControlShellClasses(scheme: Scheme) {
  return cn(
    "flex h-11 items-center gap-2 rounded-lg border px-4 text-[15px] transition-all duration-200 ease-out",
    scheme === "dark"
      ? "border-white/10 bg-slate-950/36 text-slate-100 hover:border-white/16 hover:bg-slate-950/48"
      : "border-slate-200 bg-slate-50/90 text-slate-700 hover:border-slate-300 hover:bg-white",
    "hover:-translate-y-0.5 focus-within:-translate-y-0.5",
    getFocusRingClasses(scheme),
  );
}

export function getManagerPrimaryButtonClasses(scheme: Scheme) {
  return cn(
    "inline-flex h-11 items-center justify-center gap-2 rounded-lg px-5 text-[15px] font-semibold text-white",
    "bg-[linear-gradient(135deg,#2563eb,#1d4ed8)] shadow-[0_18px_40px_rgba(37,99,235,0.24)]",
    "transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_22px_44px_rgba(37,99,235,0.3)] active:translate-y-0 active:scale-[0.99]",
    getFocusRingClasses(scheme),
  );
}

export function getManagerSecondaryButtonClasses(scheme: Scheme) {
  return cn(
    "inline-flex h-11 items-center justify-center rounded-lg border px-5 text-[15px] font-semibold",
    scheme === "dark"
      ? "border-white/10 bg-white/6 text-slate-100 hover:bg-white/10"
      : "border-slate-200 bg-slate-50/90 text-slate-700 hover:bg-white",
    getInteractiveSecondaryButtonClasses(scheme),
  );
}

export function getManagerTableActionButtonClasses(scheme: Scheme) {
  return cn(
    "inline-flex h-10 items-center justify-center rounded-lg border px-4 text-[14px] font-semibold",
    scheme === "dark"
      ? "border-white/10 bg-white/6 text-slate-100 hover:bg-white/10"
      : "border-slate-200 bg-slate-50/90 text-slate-700 hover:bg-white",
    getInteractiveSecondaryButtonClasses(scheme),
  );
}

export function getManagerIconButtonClasses(scheme: Scheme, dense = false) {
  return cn(
    `inline-flex ${dense ? "size-10" : "size-11"} items-center justify-center rounded-lg border`,
    "transition-all duration-200 ease-out hover:-translate-y-0.5",
    scheme === "dark"
      ? "border-white/10 bg-white/6 text-slate-300 hover:border-white/18 hover:bg-white/10 hover:text-white"
      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900",
    getFocusRingClasses(scheme),
  );
}

export function getManagerLabelClasses(scheme: Scheme) {
  return cn(
    "text-[13px] font-semibold",
    scheme === "dark" ? "text-slate-300" : "text-slate-600",
  );
}

export function getManagerBodyTextClasses(scheme: Scheme) {
  return cn("text-[15px] leading-6", getMutedTextClasses(scheme));
}

export function getManagerStrongTextClasses(scheme: Scheme) {
  return scheme === "dark" ? "text-slate-100" : "text-slate-900";
}

export function getManagerEyebrowClasses(scheme: Scheme) {
  return cn(
    "text-[11px] font-semibold uppercase tracking-[0.22em]",
    getMutedTextClasses(scheme),
  );
}

export function getManagerTableHeaderClasses(scheme: Scheme) {
  return cn(
    "text-left text-[11px] font-semibold uppercase tracking-[0.22em]",
    getMutedTextClasses(scheme),
  );
}

export function getManagerTableRowTextClasses() {
  return "text-[15px]";
}

export function getManagerTableHeaderPaddingClasses() {
  return "px-5 py-4";
}

export function getManagerTableCellPaddingClasses() {
  return "px-5 py-4";
}

export function getManagerTableHeadSurfaceClasses(scheme: Scheme) {
  return cn(
    "border-y border-black/5 backdrop-blur",
    scheme === "dark" ? "bg-slate-950/92" : "bg-white/92",
  );
}

export function getManagerTableRowClasses(scheme: Scheme) {
  return cn(
    "border-b border-black/5 transition-all duration-200 ease-out",
    getManagerTableRowTextClasses(),
    scheme === "dark" ? "hover:bg-white/[0.045]" : "hover:bg-slate-50/90",
  );
}

export function getManagerModalSurfaceClasses(scheme: Scheme) {
  return cn(
    "w-full overflow-hidden rounded-[24px] border shadow-[0_34px_90px_rgba(2,6,23,0.42)]",
    scheme === "dark"
      ? "border-white/10 bg-slate-950/98 text-slate-100"
      : "border-slate-200 bg-white/98 text-slate-900",
  );
}

export function getManagerModalHeaderClasses(scheme: Scheme) {
  return cn(
    "flex items-start justify-between gap-4 border-b px-5 py-4 sm:px-6",
    scheme === "dark"
      ? "border-white/10 bg-slate-900/72"
      : "border-slate-200 bg-slate-50/85",
  );
}

export function getManagerModalBodyClasses(scheme: Scheme) {
  return cn("overflow-y-auto px-5 py-5 sm:px-6", scheme === "dark" ? "bg-slate-950/98" : "bg-white/98");
}

export function getManagerModalFooterClasses(scheme: Scheme) {
  return cn(
    "flex flex-col-reverse gap-3 border-t px-5 py-4 sm:flex-row sm:justify-end sm:px-6",
    scheme === "dark"
      ? "border-white/10 bg-slate-900/72"
      : "border-slate-200 bg-slate-50/85",
  );
}

export function getManagerModalTitleClasses() {
  return "text-[1.35rem] font-semibold sm:text-[1.55rem]";
}

export function getManagerTextInputClasses(
  scheme: Scheme,
  options?: { multiline?: boolean },
) {
  const multiline = options?.multiline ?? false;

  return cn(
    "box-border w-full min-w-0 rounded-lg border text-[15px] outline-none transition-all duration-200 ease-out",
    multiline ? "min-h-[120px] px-4 py-3.5" : "h-11 px-4",
    scheme === "dark"
      ? "border-white/10 bg-slate-950/44 text-slate-100 placeholder:text-slate-400 hover:border-white/18 focus:border-blue-400/50"
      : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500",
    getFocusRingClasses(scheme),
  );
}

export function getManagerProgressTrackClasses(scheme: Scheme) {
  return cn(
    "rounded-full",
    scheme === "dark"
      ? "bg-white/8 ring-1 ring-inset ring-white/8"
      : "bg-slate-100 ring-1 ring-inset ring-slate-200/80",
  );
}

export function getManagerDangerButtonClasses(scheme: Scheme) {
  return cn(
    "inline-flex h-11 items-center justify-center rounded-lg border px-5 text-[15px] font-semibold",
    scheme === "dark"
      ? "border-rose-400/20 bg-rose-500/12 text-rose-100 hover:bg-rose-500/18"
      : "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
    getInteractiveSecondaryButtonClasses(scheme),
  );
}

export function getManagerSuccessButtonClasses(scheme: Scheme) {
  return cn(
    "inline-flex h-11 items-center justify-center rounded-lg border px-5 text-[15px] font-semibold",
    scheme === "dark"
      ? "border-emerald-400/18 bg-emerald-500/12 text-emerald-100 hover:bg-emerald-500/18"
      : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    getInteractiveSecondaryButtonClasses(scheme),
  );
}

export function getToolbarControlClasses(tone: TopbarTone, scheme: Scheme) {
  if (tone === "brand" || tone === "dark") {
    return cn(
      "border-white/12 bg-white/10 text-white",
      "cursor-pointer transition-all duration-200 ease-out",
      "hover:-translate-y-0.5 hover:border-white/22 hover:bg-white/16 hover:shadow-[0_14px_28px_rgba(2,6,23,0.18)]",
      "active:translate-y-0 active:scale-[0.99]",
      tone === "dark"
        ? "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        : "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-600",
    );
  }

  return scheme === "dark"
    ? cn(
        "border-white/10 bg-slate-950/36 text-slate-100",
        "cursor-pointer transition-all duration-200 ease-out",
        "hover:-translate-y-0.5 hover:border-white/16 hover:bg-slate-950/48 hover:text-white hover:shadow-[0_14px_28px_rgba(2,6,23,0.2)]",
        "active:translate-y-0 active:scale-[0.99]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/55 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
      )
    : cn(
        "border-slate-200 bg-slate-50/90 text-slate-600",
        "cursor-pointer transition-all duration-200 ease-out",
        "hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:text-slate-900 hover:shadow-[0_14px_28px_rgba(15,23,42,0.08)]",
        "active:translate-y-0 active:scale-[0.99]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
      );
}

export function getSearchInputClasses(tone: TopbarTone, scheme: Scheme) {
  if (tone === "brand" || tone === "dark") {
    return cn(
      "border-white/12 bg-white/10 text-white placeholder:text-white/65",
      "cursor-text transition-all duration-200 ease-out",
      "hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/12",
      "focus-within:-translate-y-0.5 focus-within:border-white/28 focus-within:bg-white/14 focus-within:outline-none focus-within:ring-2 focus-within:ring-white/35 focus-within:ring-offset-2 focus-within:ring-offset-slate-950",
    );
  }

  return scheme === "dark"
    ? cn(
        "border-white/10 bg-slate-950/36 text-slate-100 placeholder:text-slate-400",
        "cursor-text transition-all duration-200 ease-out",
        "hover:-translate-y-0.5 hover:border-white/16 hover:bg-slate-950/48",
        "focus-within:-translate-y-0.5 focus-within:border-blue-400/45 focus-within:bg-slate-950/56 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-400/50 focus-within:ring-offset-2 focus-within:ring-offset-slate-950",
      )
    : cn(
        "border-slate-200 bg-slate-50/90 text-slate-700 placeholder:text-slate-400",
        "cursor-text transition-all duration-200 ease-out",
        "hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-[0_14px_28px_rgba(15,23,42,0.08)]",
        "focus-within:-translate-y-0.5 focus-within:border-blue-300 focus-within:bg-white focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500/35 focus-within:ring-offset-2 focus-within:ring-offset-white",
      );
}

export function getPopoverClasses(scheme: Scheme) {
  return scheme === "dark"
    ? "border-white/10 bg-slate-950/96 text-slate-100 shadow-[0_20px_44px_rgba(2,6,23,0.42)]"
    : "border-slate-200 bg-white/98 text-slate-900 shadow-[0_20px_44px_rgba(15,23,42,0.14)]";
}

export function getManagerBadgeClasses(tone: ManagerBadgeTone, scheme: Scheme) {
  if (tone === "neutral") {
    return scheme === "dark"
      ? "border-white/10 bg-white/8 text-slate-300"
      : "border-slate-200 bg-slate-100 text-slate-600";
  }

  if (tone === "brand" || tone === "info") {
    return scheme === "dark"
      ? "border-blue-400/24 bg-blue-500/14 text-blue-100"
      : "border-blue-200 bg-blue-50 text-blue-700";
  }

  if (tone === "success" || tone === "teal") {
    return scheme === "dark"
      ? "border-emerald-400/24 bg-emerald-500/14 text-emerald-100"
      : "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (tone === "warning" || tone === "amber") {
    return scheme === "dark"
      ? "border-amber-400/24 bg-amber-500/14 text-amber-100"
      : "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (tone === "danger") {
    return scheme === "dark"
      ? "border-rose-400/24 bg-rose-500/14 text-rose-100"
      : "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (tone === "cyan") {
    return scheme === "dark"
      ? "border-cyan-400/24 bg-cyan-500/14 text-cyan-100"
      : "border-cyan-200 bg-cyan-50 text-cyan-700";
  }

  return scheme === "dark"
    ? "border-violet-400/24 bg-violet-500/14 text-violet-100"
    : "border-violet-200 bg-violet-50 text-violet-700";
}

export function getMutedTextClasses(scheme: Scheme) {
  return scheme === "dark" ? "text-slate-400" : "text-slate-500";
}

export function getDetachedFrameClasses(scheme: Scheme) {
  return scheme === "dark"
    ? "border-white/10 bg-slate-900/38"
    : "border-white/60 bg-white/46";
}

export function getContentAreaClasses(layoutMode: LayoutMode, sidebarSize: SidebarSize) {
  const isFullBleed = sidebarSize === "full";

  if (layoutMode === "detached") {
    return isFullBleed ? "p-4 sm:p-6" : "p-4 sm:p-5 lg:p-6";
  }

  return isFullBleed ? "p-4 sm:p-5 md:p-6" : "p-4 sm:p-5 lg:p-6";
}

export function getFocusRingClasses(scheme: Scheme) {
  return scheme === "dark"
    ? "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/55 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
    : "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35 focus-visible:ring-offset-2 focus-visible:ring-offset-white";
}

export function getInteractiveCardClasses(scheme: Scheme) {
  return cn(
    "transition-all duration-200 ease-out",
    "hover:-translate-y-0.5",
    scheme === "dark"
      ? "hover:border-white/16 hover:shadow-[0_30px_60px_rgba(2,6,23,0.34)]"
      : "hover:border-slate-300/90 hover:shadow-[0_30px_58px_rgba(15,23,42,0.12)]",
  );
}

export function getInteractiveRowClasses(scheme: Scheme) {
  return cn(
    "cursor-pointer transition-all duration-200 ease-out",
    "hover:-translate-y-0.5",
    scheme === "dark"
      ? "hover:border-white/14 hover:bg-white/8 hover:shadow-[0_18px_34px_rgba(2,6,23,0.22)]"
      : "hover:border-slate-300/90 hover:bg-white hover:shadow-[0_16px_32px_rgba(15,23,42,0.1)]",
    getFocusRingClasses(scheme),
  );
}

export function getInteractiveSecondaryButtonClasses(scheme: Scheme) {
  return cn(
    "cursor-pointer transition-all duration-200 ease-out",
    "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]",
    scheme === "dark"
      ? "hover:border-white/18 hover:bg-white/10 hover:shadow-[0_16px_34px_rgba(2,6,23,0.24)]"
      : "hover:border-slate-300 hover:bg-white hover:shadow-[0_14px_30px_rgba(15,23,42,0.1)]",
    getFocusRingClasses(scheme),
  );
}
