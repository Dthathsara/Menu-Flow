import { ChevronDownIcon } from "../icons";
import { InvoiceModalFrame } from "./InvoiceModalFrame";
import {
  cn,
  getManagerLabelClasses,
  getManagerPrimaryButtonClasses,
  getManagerSecondaryButtonClasses,
  getManagerTextInputClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import type { PlanId, SubscriptionPlan } from "./invoice.types";

interface ChangePlanModalProps {
  settings: ManagerSettings;
  currentPlan: SubscriptionPlan;
  targetPlanId: PlanId;
  availablePlans: SubscriptionPlan[];
  onChangeTarget: (planId: PlanId) => void;
  onClose: () => void;
  onContinue: () => void;
  isSaving?: boolean;
  errorMessage?: string;
}

export function ChangePlanModal({
  settings,
  currentPlan,
  targetPlanId,
  availablePlans,
  onChangeTarget,
  onClose,
  onContinue,
  isSaving = false,
  errorMessage = "",
}: ChangePlanModalProps) {
  return (
    <InvoiceModalFrame
      open
      settings={settings}
      title="Change Plan"
      subtitle="Select a package and continue to confirmation."
      maxWidthClassName="max-w-[760px]"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className={cn(
              getManagerSecondaryButtonClasses(settings.scheme),
              "rounded-[12px] px-5 disabled:cursor-not-allowed disabled:opacity-55",
            )}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onContinue}
            disabled={isSaving || availablePlans.length === 0}
            className={cn(
              getManagerPrimaryButtonClasses(settings.scheme),
              "rounded-[12px] px-5 disabled:cursor-not-allowed disabled:opacity-55",
            )}
          >
            Continue
          </button>
        </>
      }
      onClose={onClose}
      disableClose={isSaving}
    >
      {errorMessage ? (
        <div className="mb-4 rounded-[14px] border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-[13px] font-semibold text-rose-300">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={getManagerLabelClasses(settings.scheme)}>Current Plan</label>
          <input
            type="text"
            value={currentPlan.planName}
            readOnly
            className={cn("mt-2", getManagerTextInputClasses(settings.scheme))}
          />
        </div>

        <div>
          <label className={getManagerLabelClasses(settings.scheme)}>Change To</label>
          <div className="relative mt-2">
            <select
              value={targetPlanId}
              onChange={(event) => onChangeTarget(event.target.value as PlanId)}
              disabled={isSaving || availablePlans.length === 0}
              className={cn(
                "w-full appearance-none pr-10 disabled:cursor-not-allowed disabled:opacity-60",
                getManagerTextInputClasses(settings.scheme),
              )}
            >
              {availablePlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.changePlanLabel}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </div>
    </InvoiceModalFrame>
  );
}
