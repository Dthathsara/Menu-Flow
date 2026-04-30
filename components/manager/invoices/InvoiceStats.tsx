import { cn, getManagerCardShellClasses, getManagerEyebrowClasses } from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import type { SubscriptionPlan } from "./invoice.types";

interface InvoiceStatsProps {
  settings: ManagerSettings;
  plan: SubscriptionPlan;
}

export function InvoiceStats({ settings, plan }: InvoiceStatsProps) {
  const stats = [
    {
      label: "Current Plan",
      value: plan.label,
      caption: "Active package for this restaurant account.",
    },
    {
      label: "Billing Cycle",
      value: plan.billingCycle,
      caption: plan.billingCycleDescription,
    },
    {
      label: "Next Renewal",
      value: plan.nextRenewal,
      caption: plan.nextRenewalDescription,
    },
    {
      label: "Amount Due",
      value: plan.amountDue,
      caption: plan.amountDueDescription,
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={cn(
            "p-5",
            getManagerCardShellClasses(settings.scheme, { interactive: true }),
          )}
        >
          <div className={getManagerEyebrowClasses(settings.scheme)}>{stat.label}</div>
          <div className="mt-4 text-[1.55rem] font-bold leading-tight text-slate-100">
            {stat.value}
          </div>
          <div className="mt-2 text-[13px] leading-5 text-slate-400">{stat.caption}</div>
        </div>
      ))}
    </section>
  );
}
