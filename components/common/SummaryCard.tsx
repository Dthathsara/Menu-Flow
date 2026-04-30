import type { ReactNode } from "react";
import {
  cn,
  getInteractiveCardClasses,
  getManagerEyebrowClasses,
  getManagerPanelShellClasses,
  getManagerStrongTextClasses,
  getMutedTextClasses,
} from "@/components/manager/managerUtils";
import type { Scheme } from "@/components/manager/managerTypes";

export type SummaryCardAccent = "blue" | "amber" | "purple" | "green" | "teal" | "red";

const SUMMARY_CARD_ACCENT_STYLES: Record<
  SummaryCardAccent,
  {
    gradientClassName: string;
    glowClassName: string;
    borderClassName: Record<Scheme, string>;
    shadowClassName: Record<Scheme, string>;
  }
> = {
  blue: {
    gradientClassName: "from-blue-500/20 via-blue-500/8 to-transparent",
    glowClassName: "bg-blue-500/16",
    borderClassName: {
      dark: "border-blue-400/16",
      light: "border-blue-200/90",
    },
    shadowClassName: {
      dark: "hover:shadow-[0_28px_60px_rgba(37,99,235,0.2)]",
      light: "hover:shadow-[0_24px_48px_rgba(37,99,235,0.14)]",
    },
  },
  amber: {
    gradientClassName: "from-amber-500/20 via-amber-500/8 to-transparent",
    glowClassName: "bg-amber-500/16",
    borderClassName: {
      dark: "border-amber-400/16",
      light: "border-amber-200/90",
    },
    shadowClassName: {
      dark: "hover:shadow-[0_28px_60px_rgba(245,158,11,0.18)]",
      light: "hover:shadow-[0_24px_48px_rgba(245,158,11,0.14)]",
    },
  },
  purple: {
    gradientClassName: "from-violet-500/20 via-violet-500/8 to-transparent",
    glowClassName: "bg-violet-500/16",
    borderClassName: {
      dark: "border-violet-400/16",
      light: "border-violet-200/90",
    },
    shadowClassName: {
      dark: "hover:shadow-[0_28px_60px_rgba(139,92,246,0.2)]",
      light: "hover:shadow-[0_24px_48px_rgba(139,92,246,0.14)]",
    },
  },
  green: {
    gradientClassName: "from-emerald-500/18 via-emerald-500/8 to-transparent",
    glowClassName: "bg-emerald-500/16",
    borderClassName: {
      dark: "border-emerald-400/16",
      light: "border-emerald-200/90",
    },
    shadowClassName: {
      dark: "hover:shadow-[0_28px_60px_rgba(16,185,129,0.18)]",
      light: "hover:shadow-[0_24px_48px_rgba(16,185,129,0.14)]",
    },
  },
  teal: {
    gradientClassName: "from-cyan-500/20 via-blue-500/8 to-transparent",
    glowClassName: "bg-cyan-500/16",
    borderClassName: {
      dark: "border-cyan-400/16",
      light: "border-cyan-200/90",
    },
    shadowClassName: {
      dark: "hover:shadow-[0_28px_60px_rgba(34,211,238,0.18)]",
      light: "hover:shadow-[0_24px_48px_rgba(34,211,238,0.14)]",
    },
  },
  red: {
    gradientClassName: "from-rose-500/18 via-amber-500/10 to-transparent",
    glowClassName: "bg-rose-500/14",
    borderClassName: {
      dark: "border-rose-400/16",
      light: "border-rose-200/90",
    },
    shadowClassName: {
      dark: "hover:shadow-[0_28px_60px_rgba(244,63,94,0.18)]",
      light: "hover:shadow-[0_24px_48px_rgba(244,63,94,0.14)]",
    },
  },
};

interface SummaryCardProps {
  scheme: Scheme;
  accent: SummaryCardAccent;
  title: ReactNode;
  value: ReactNode;
  note: ReactNode;
  className?: string;
  titleClassName?: string;
  valueClassName?: string;
  noteClassName?: string;
}

export function SummaryCard({
  scheme,
  accent,
  title,
  value,
  note,
  className,
  titleClassName,
  valueClassName,
  noteClassName,
}: SummaryCardProps) {
  const accentStyles = SUMMARY_CARD_ACCENT_STYLES[accent];

  return (
    <div
      className={cn(
        getManagerPanelShellClasses(scheme),
        getInteractiveCardClasses(scheme),
        accentStyles.borderClassName[scheme],
        accentStyles.shadowClassName[scheme],
        "group relative overflow-hidden",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-r",
          accentStyles.gradientClassName,
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute -right-10 -top-8 h-28 w-28 rounded-full blur-3xl transition-opacity duration-200",
          accentStyles.glowClassName,
          "opacity-70 group-hover:opacity-100",
        )}
      />
      <div className={cn("relative", titleClassName ?? getManagerEyebrowClasses(scheme))}>
        {title}
      </div>
      <div
        className={cn(
          "relative mt-4 text-[2rem] font-bold tracking-tight",
          getManagerStrongTextClasses(scheme),
          valueClassName,
        )}
      >
        {value}
      </div>
      <p
        className={cn(
          "relative mt-3 text-[14px] leading-6",
          getMutedTextClasses(scheme),
          noteClassName,
        )}
      >
        {note}
      </p>
    </div>
  );
}
