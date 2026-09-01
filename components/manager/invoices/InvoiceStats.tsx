import {
  cn,
  getManagerCardShellClasses,
  getManagerEyebrowClasses,
  getManagerStrongTextClasses,
  getMutedTextClasses,
} from "../managerUtils";
import type { Scheme } from "../managerTypes";
import type { ManagerSettings } from "../managerTypes";
import type { SubscriptionPlan } from "./invoice.types";

interface InvoiceStatsProps {
  settings: ManagerSettings;
  plan: SubscriptionPlan | null;
}

type InvoiceStatAccent = "blue" | "amber" | "violet" | "teal";

const INVOICE_STAT_ACCENT_STYLES: Record<
  InvoiceStatAccent,
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
    gradientClassName: "from-amber-500/20 via-orange-500/8 to-transparent",
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
  violet: {
    gradientClassName: "from-violet-500/20 via-purple-500/8 to-transparent",
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
  teal: {
    gradientClassName: "from-teal-500/20 via-emerald-500/8 to-transparent",
    glowClassName: "bg-teal-500/16",
    borderClassName: {
      dark: "border-teal-400/16",
      light: "border-teal-200/90",
    },
    shadowClassName: {
      dark: "hover:shadow-[0_28px_60px_rgba(20,184,166,0.2)]",
      light: "hover:shadow-[0_24px_48px_rgba(20,184,166,0.14)]",
    },
  },
};

export function InvoiceStats({ settings, plan }: InvoiceStatsProps) {
  const stats = [
    {
      label: "Current Plan",
      value: plan?.planName ?? "No Plan",
      caption: plan?.headlineDescription ?? "No active subscription assigned",
      accent: "blue",
    },
    {
      label: "Billing Cycle",
      value: plan?.billingCycle ?? "—",
      caption: plan?.billingCycleDescription ?? "—",
      accent: "amber",
    },
    {
      label: "Next Renewal",
      value: plan?.nextRenewal ?? "—",
      caption: plan?.nextRenewalDescription ?? "—",
      accent: "violet",
    },
    {
      label: "Amount Due",
      value: plan?.amountDue ?? "Rs. 0",
      caption: plan?.amountDueDescription ?? "No payment due",
      accent: "teal",
    },
  ] satisfies Array<{
    label: string;
    value: string;
    caption: string;
    accent: InvoiceStatAccent;
  }>;

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const accentStyles = INVOICE_STAT_ACCENT_STYLES[stat.accent];

        return (
          <div
            key={stat.label}
            className={cn(
              "group relative overflow-hidden p-5",
              getManagerCardShellClasses(settings.scheme),
              accentStyles.borderClassName[settings.scheme],
              accentStyles.shadowClassName[settings.scheme],
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
            <div className={cn("relative", getManagerEyebrowClasses(settings.scheme))}>
              {stat.label}
            </div>
            <div
              className={cn(
                "relative mt-4 text-[1.55rem] font-bold leading-tight tracking-tight",
                getManagerStrongTextClasses(settings.scheme),
              )}
            >
              {stat.value}
            </div>
            <p className={cn("relative mt-2 text-[13px] leading-5", getMutedTextClasses(settings.scheme))}>
              {stat.caption}
            </p>
          </div>
        );
      })}
    </section>
  );
}
