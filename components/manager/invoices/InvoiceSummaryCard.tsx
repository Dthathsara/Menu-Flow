import {
  cn,
  getManagerCardShellClasses,
  getManagerSectionSubtitleClasses,
  getManagerSectionTitleClasses,
  getManagerPrimaryButtonClasses,
  getManagerSecondaryButtonClasses,
  getManagerStrongTextClasses,
  getMutedTextClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import type { SubscriptionPlan } from "./invoice.types";

interface InvoiceSummaryCardProps {
  settings: ManagerSettings;
  plan: SubscriptionPlan;
  onRenew: () => void;
  onChangeCard: () => void;
  isActionLoading?: boolean;
}

export function InvoiceSummaryCard({
  settings,
  plan,
  onRenew,
  onChangeCard,
  isActionLoading = false,
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
            className={cn(
              "flex items-center justify-between gap-4 border-b pb-4 text-[14px]",
              settings.scheme === "dark" ? "border-white/8" : "border-slate-200",
            )}
          >
            <span className={getMutedTextClasses(settings.scheme)}>{row.label}</span>
            <span className={cn("font-semibold", getManagerStrongTextClasses(settings.scheme))}>
              {row.value}
            </span>
          </div>
        ))}

        <div
          className={cn(
            "flex items-center justify-between gap-4 pt-1 text-[1.2rem] font-bold",
            getManagerStrongTextClasses(settings.scheme),
          )}
        >
          <span>Total</span>
          <span>{plan.totalDisplay}</span>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onRenew}
          disabled={isActionLoading}
          className={cn(
            "flex-1 rounded-[12px] px-4 text-[14px] disabled:cursor-not-allowed disabled:opacity-55",
            getManagerPrimaryButtonClasses(settings.scheme),
          )}
        >
          Pay / Renew Now
        </button>
        <button
          type="button"
          onClick={onChangeCard}
          disabled={isActionLoading}
          className={cn(
            "rounded-[12px] px-4 text-[14px] disabled:cursor-not-allowed disabled:opacity-55",
            getManagerSecondaryButtonClasses(settings.scheme),
          )}
        >
          Change Card
        </button>
      </div>
    </section>
  );
}
