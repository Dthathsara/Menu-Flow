import { PLAN_ORDER, SUBSCRIPTION_PLANS } from "./invoice.data";
import { getPlanActionLabel } from "./invoice.helpers";
import { CheckIcon } from "../icons";
import {
  cn,
  getManagerCardShellClasses,
  getManagerPrimaryButtonClasses,
  getManagerSectionSubtitleClasses,
  getManagerSectionTitleClasses,
  getManagerSecondaryButtonClasses,
  getManagerStrongTextClasses,
  getMutedTextClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import type { PlanId } from "./invoice.types";

interface AvailablePlansProps {
  settings: ManagerSettings;
  currentPlanId: PlanId;
  onSelectPlan: (planId: PlanId) => void;
}

export function AvailablePlans({
  settings,
  currentPlanId,
  onSelectPlan,
}: AvailablePlansProps) {
  return (
    <section
      className={cn(
        "p-5 sm:p-6",
        getManagerCardShellClasses(settings.scheme, { interactive: true }),
      )}
    >
      <div>
        <h3 className={getManagerSectionTitleClasses()}>Available Packages</h3>
        <p className={cn("text-[13px]", getManagerSectionSubtitleClasses(settings.scheme))}>
          Upgrade or compare MenuFlow packages for your restaurant.
        </p>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        {PLAN_ORDER.map((planId) => {
          const plan = SUBSCRIPTION_PLANS[planId];
          const current = planId === currentPlanId;
          const actionLabel = getPlanActionLabel(currentPlanId, planId);

          return (
            <article
              key={plan.id}
              className={cn(
                "rounded-[18px] border p-4 transition-all duration-200 ease-out hover:-translate-y-0.5",
                current
                  ? settings.scheme === "dark"
                    ? "border-blue-500/80 bg-[linear-gradient(180deg,rgba(37,99,235,0.18),rgba(15,23,42,0.82))] shadow-[0_28px_56px_rgba(37,99,235,0.18)]"
                    : "border-blue-300 bg-[linear-gradient(180deg,rgba(239,246,255,0.98),rgba(255,255,255,0.98))] shadow-[0_24px_48px_rgba(37,99,235,0.13)]"
                  : getManagerCardShellClasses(settings.scheme, { interactive: true }),
              )}
            >
              <div
                className={cn(
                  "text-[1.1rem] font-semibold",
                  getManagerStrongTextClasses(settings.scheme),
                )}
              >
                {plan.label}
              </div>
              <div
                className={cn(
                  "mt-3 text-[2rem] font-bold leading-none",
                  getManagerStrongTextClasses(settings.scheme),
                )}
              >
                {plan.priceDisplay}
                {plan.priceUnit ? (
                  <span className={cn("text-[1rem] font-semibold", getMutedTextClasses(settings.scheme))}>
                    {plan.priceUnit}
                  </span>
                ) : null}
              </div>
              <p className={cn("mt-4 text-[13px] leading-6", getMutedTextClasses(settings.scheme))}>
                {plan.headlineDescription}
              </p>

              <ul
                className={cn(
                  "mt-4 space-y-2.5 text-[13px]",
                  settings.scheme === "dark" ? "text-slate-200" : "text-slate-700",
                )}
              >
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <CheckIcon className="mt-0.5 size-4 text-sky-400" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => {
                  if (!current) {
                    onSelectPlan(plan.id);
                  }
                }}
                className={cn(
                  "mt-5 w-full rounded-[12px] px-4 text-[14px]",
                  current
                    ? getManagerPrimaryButtonClasses(settings.scheme)
                    : getManagerSecondaryButtonClasses(settings.scheme),
                )}
              >
                {actionLabel}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
