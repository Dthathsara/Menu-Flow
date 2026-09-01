import { getPlanChangeVerb } from "./invoice.helpers";
import { InvoiceModalFrame } from "./InvoiceModalFrame";
import {
  cn,
  getManagerPrimaryButtonClasses,
  getManagerSecondaryButtonClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import type { SubscriptionPlan } from "./invoice.types";

interface ConfirmPlanModalProps {
  settings: ManagerSettings;
  currentPlan: SubscriptionPlan;
  targetPlan: SubscriptionPlan;
  onClose: () => void;
  onConfirm: () => void;
  isSaving?: boolean;
  errorMessage?: string;
}

export function ConfirmPlanModal({
  settings,
  currentPlan,
  targetPlan,
  onClose,
  onConfirm,
  isSaving = false,
  errorMessage = "",
}: ConfirmPlanModalProps) {
  const verb = getPlanChangeVerb(currentPlan, targetPlan);
  const targetName = targetPlan.label || targetPlan.planName;
  const currentName = currentPlan.label || currentPlan.planName;
  const actionText = verb === "Upgrade" ? "upgrading" : "changing";
  const usageImpactLines: string[] = [];

  if (
    targetPlan.usage.locations.limit !== null &&
    currentPlan.usage.locations.used > targetPlan.usage.locations.limit
  ) {
    usageImpactLines.push(
      `Locations in use: ${currentPlan.usage.locations.used} / ${targetPlan.usage.locations.limit}`,
    );
  }

  if (
    targetPlan.usage.qrTables.limit !== null &&
    currentPlan.usage.qrTables.used > targetPlan.usage.qrTables.limit
  ) {
    usageImpactLines.push(
      `QR tables in use: ${currentPlan.usage.qrTables.used} / ${targetPlan.usage.qrTables.limit}`,
    );
  }

  const customQuotePlan = targetPlan.id === "premium";
  const showWarningBox = customQuotePlan || usageImpactLines.length > 0;
  const summaryLines = customQuotePlan
    ? [
        `Premium billing: ${targetPlan.billingCycle}`,
        `Tax / Service: ${targetPlan.taxDisplay}`,
        `Total: ${targetPlan.totalDisplay}`,
      ]
    : usageImpactLines.length > 0
      ? usageImpactLines
      : [
          `Billing cycle: ${targetPlan.billingCycle}`,
          `Next renewal: ${targetPlan.renewalDate}`,
          `Total due: ${targetPlan.totalDisplay}`,
        ];

  return (
    <InvoiceModalFrame
      open
      settings={settings}
      title={`${verb} to ${targetName}`}
      subtitle={`You are ${actionText} from ${currentName} to ${targetName}. This will update billing details, invoice summary, usage limits, and the current package view immediately.`}
      maxWidthClassName="max-w-[760px]"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className={cn(getManagerSecondaryButtonClasses(settings.scheme), "rounded-[12px] px-5 disabled:cursor-not-allowed disabled:opacity-55")}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSaving}
            className={cn(getManagerPrimaryButtonClasses(settings.scheme), "rounded-[12px] px-5 disabled:cursor-not-allowed disabled:opacity-55")}
          >
            {isSaving ? "Saving..." : `${verb} Plan`}
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

      <div
        className={cn(
          "rounded-[18px] border p-4 sm:p-5",
          showWarningBox
            ? "border-amber-400/60 bg-amber-500/12 text-amber-100"
            : settings.scheme === "dark"
              ? "border-white/10 bg-slate-900/68 text-slate-100"
              : "border-slate-200 bg-slate-50 text-slate-900",
        )}
      >
        {usageImpactLines.length > 0 ? (
          <div className="mb-4 text-[1.05rem] font-semibold leading-7">
            This change affects current usage limits.
          </div>
        ) : null}

        <div className="space-y-3 text-[15px] leading-7">
          {summaryLines.map((line) => (
            <div key={line} className="font-semibold">
              {line}
            </div>
          ))}
        </div>
      </div>
    </InvoiceModalFrame>
  );
}
