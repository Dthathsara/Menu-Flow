import type {
  LayoutMode,
  MenuTone,
  Scheme,
  SidebarSize,
  TopbarTone,
} from "./managerTypes";

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
