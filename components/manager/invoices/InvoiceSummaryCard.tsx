import {
  cn,
  getManagerCardShellClasses,
  getManagerSectionSubtitleClasses,
  getManagerSectionTitleClasses,
  getManagerPrimaryButtonClasses,
  getManagerSecondaryButtonClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import type { SubscriptionPlan } from "./invoice.types";

interface InvoiceSummaryCardProps {
  settings: ManagerSettings;
  plan: SubscriptionPlan;
  onRenew: () => void;
  onChangeCard: () => void;
}

export function InvoiceSummaryCard({
  settings,
  plan,
  onRenew,
  onChangeCard,
}: InvoiceSummaryCardProps) {
  const rows = [
    { label: plan.billingLabel, value: plan.invoiceLineAmount },
    { label: "Tax / Service", value: plan.taxDisplay },
    { label: "Discount", value: plan.discountDisplay },
  ];

  return (
    <section
      className={cn(
        "p-5 sm:p-6",
        getManagerCardShellClasses(settings.scheme, { interactive: true }),
      )}
    >
      <div>
        <h3 className={getManagerSectionTitleClasses()}>Invoice Summary</h3>
        <p className={cn("text-[13px]", getManagerSectionSubtitleClasses(settings.scheme))}>
          Latest billing breakdown.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-4 border-b border-white/8 pb-4 text-[14px]"
          >
            <span className="text-slate-300">{row.label}</span>
            <span className="font-semibold text-slate-100">{row.value}</span>
          </div>
        ))}

        <div className="flex items-center justify-between gap-4 pt-1 text-[1.2rem] font-bold text-white">
          <span>Total</span>
          <span>{plan.totalDisplay}</span>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onRenew}
          className={cn(
            "flex-1 rounded-[12px] px-4 text-[14px]",
            getManagerPrimaryButtonClasses(settings.scheme),
          )}
        >
          Pay / Renew Now
        </button>
        <button
          type="button"
          onClick={onChangeCard}
          className={cn(
            "rounded-[12px] px-4 text-[14px]",
            getManagerSecondaryButtonClasses(settings.scheme),
          )}
        >
          Change Card
        </button>
      </div>
    </section>
  );
}
