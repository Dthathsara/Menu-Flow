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
}

export function ConfirmPlanModal({
  settings,
  currentPlan,
  targetPlan,
  onClose,
  onConfirm,
}: ConfirmPlanModalProps) {
  const verb = getPlanChangeVerb(currentPlan.id, targetPlan.id);
  const usageImpactLines: string[] = [];

  if (currentPlan.usage.locations.used > targetPlan.usage.locations.limit) {
    usageImpactLines.push(
      `Locations in use: ${currentPlan.usage.locations.used} / ${targetPlan.usage.locations.limit}`,
    );
  }

  if (currentPlan.usage.qrTables.used > targetPlan.usage.qrTables.limit) {
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
      title={`${verb} to ${targetPlan.label}`}
      subtitle={`You are changing from ${currentPlan.label} to ${targetPlan.label}. This will update billing details, invoice summary, usage limits, and the current package view immediately.`}
      maxWidthClassName="max-w-[760px]"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className={cn(getManagerSecondaryButtonClasses(settings.scheme), "rounded-[12px] px-5")}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn(getManagerPrimaryButtonClasses(settings.scheme), "rounded-[12px] px-5")}
          >
            {verb} Plan
          </button>
        </>
      }
      onClose={onClose}
    >
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
