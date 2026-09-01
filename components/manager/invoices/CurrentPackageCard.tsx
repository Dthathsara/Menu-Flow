import {
  cn,
  getManagerBadgeClasses,
  getManagerCardShellClasses,
  getManagerEyebrowClasses,
  getManagerPanelShellClasses,
  getManagerSectionSubtitleClasses,
  getManagerSectionTitleClasses,
  getManagerStrongTextClasses,
  getMutedTextClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import type { SubscriptionPlan } from "./invoice.types";
import { calculateUsageProgress, formatUsageLimit } from "./invoice.helpers";

interface CurrentPackageCardProps {
  settings: ManagerSettings;
  plan: SubscriptionPlan | null;
  autoRenew?: boolean;
  savedMethodLabel?: string;
  isTogglingAutoRenew?: boolean;
  onToggleAutoRenew?: (enabled: boolean) => void;
  onAddPaymentMethod?: () => void;
}

function UsageMetric({
  scheme,
  label,
  used,
  limit,
}: {
  scheme: ManagerSettings["scheme"];
  label: string;
  used: number;
  limit: number | null;
}) {
  const progress = calculateUsageProgress(used, limit);

  return (
    <div
      className={cn(
        "rounded-[14px] border p-3.5",
        scheme === "dark"
          ? "border-white/10 bg-slate-950/38"
          : "border-slate-200 bg-white/86",
      )}
    >
      <div
        className={cn(
          "text-[11px] font-semibold uppercase tracking-[0.18em]",
          getMutedTextClasses(scheme),
        )}
      >
        {label}
      </div>
      <div className={cn("mt-2 text-[1.05rem] font-bold", getManagerStrongTextClasses(scheme))}>
        {formatUsageLimit({ used, limit })}
      </div>
      <div className={cn("mt-3 h-1.5 rounded-full", scheme === "dark" ? "bg-white/8" : "bg-slate-200")}>
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#06b6d4,#38bdf8)]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function CurrentPackageCard({
  settings,
  plan,
  autoRenew = false,
  savedMethodLabel,
  isTogglingAutoRenew = false,
  onToggleAutoRenew,
  onAddPaymentMethod,
}: CurrentPackageCardProps) {
  if (!plan) {
    return (
      <section
        className={cn(
          "p-5 sm:p-6",
          getManagerCardShellClasses(settings.scheme, { interactive: true }),
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className={getManagerSectionTitleClasses()}>Current Package</h3>
            <p className={cn("text-[13px]", getManagerSectionSubtitleClasses(settings.scheme))}>
              Your active MenuFlow subscription details.
            </p>
          </div>
          <span
            className={cn(
              "inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold",
              getManagerBadgeClasses("muted", settings.scheme),
            )}
          >
            No Subscription
          </span>
        </div>

        <div
          className={cn(
            "mt-5 rounded-[18px] border p-6 text-center",
            getManagerPanelShellClasses(settings.scheme),
          )}
        >
          <h4 className={cn("text-lg font-bold", getManagerStrongTextClasses(settings.scheme))}>
            No subscription package assigned
          </h4>
          <p className={cn("mt-2 text-sm leading-6 max-w-md mx-auto", getMutedTextClasses(settings.scheme))}>
            This restaurant does not currently have a subscription package. Select an available package below to get started.
          </p>
        </div>
      </section>
    );
  }
  return (
    <section
      className={cn(
        "p-5 sm:p-6",
        getManagerCardShellClasses(settings.scheme, { interactive: true }),
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className={getManagerSectionTitleClasses()}>Current Package</h3>
          <p className={cn("text-[13px]", getManagerSectionSubtitleClasses(settings.scheme))}>
            Your active MenuFlow subscription details.
          </p>
        </div>
        <span
          className={cn(
            "inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold",
            getManagerBadgeClasses("success", settings.scheme),
          )}
        >
          Active
        </span>
      </div>

      <div
        className={cn(
          "mt-5 rounded-[18px] border p-4 sm:p-5",
          getManagerPanelShellClasses(settings.scheme),
          settings.scheme === "dark"
            ? "bg-[linear-gradient(135deg,rgba(37,99,235,0.18),rgba(15,23,42,0.76))]"
            : "bg-[linear-gradient(135deg,rgba(239,246,255,0.96),rgba(255,255,255,0.98))]",
        )}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <div
              className={cn(
                "text-[1.7rem] font-bold leading-tight",
                getManagerStrongTextClasses(settings.scheme),
              )}
            >
              {plan.planName}
            </div>
            <p className={cn("mt-2 text-[13px] leading-6", getMutedTextClasses(settings.scheme))}>
              {plan.currentPackageDescription}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <div
              className={cn(
                "text-[2rem] font-bold leading-none sm:text-[2.15rem]",
                getManagerStrongTextClasses(settings.scheme),
              )}
            >
              {plan.priceDisplay}
              {plan.priceUnit ? (
                <span className={cn("text-[0.95rem] font-semibold", getMutedTextClasses(settings.scheme))}>
                  {plan.priceUnit}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Restaurant", value: plan.restaurantName },
            { label: "Package Type", value: plan.packageType },
            { label: "Started Date", value: plan.startedDate },
            { label: "Renew Date", value: plan.renewalDate },
          ].map((item) => (
            <div
              key={item.label}
              className={cn(
                "rounded-[14px] border p-3.5",
                settings.scheme === "dark"
                  ? "border-white/10 bg-slate-950/38"
                  : "border-slate-200 bg-white/86",
              )}
            >
              <div className={getManagerEyebrowClasses(settings.scheme)}>{item.label}</div>
              <div
                className={cn(
                  "mt-2 text-[14px] font-semibold leading-5",
                  getManagerStrongTextClasses(settings.scheme),
                )}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-3 rounded-[14px] border border-blue-500/20 bg-blue-500/8 p-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[14px] font-bold text-slate-200">
              <span>Auto Renew</span>
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide", autoRenew ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-slate-700/50 text-slate-400 border border-slate-600/40")}>
                {autoRenew ? "ON" : "OFF"}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-400">
              Automatically renew this package at the end of each billing period using your saved payment method.
            </p>
            {savedMethodLabel ? (
              <p className="mt-1 text-xs font-semibold text-blue-300">
                Payment method: {savedMethodLabel}
              </p>
            ) : (
              <p className="mt-1 text-xs font-medium text-amber-400">
                No payment method saved.{" "}
                {onAddPaymentMethod ? (
                  <button
                    type="button"
                    onClick={onAddPaymentMethod}
                    className="underline hover:text-amber-200 cursor-pointer"
                  >
                    Add a payment method
                  </button>
                ) : null}
              </p>
            )}
          </div>
          {onToggleAutoRenew ? (
            <label className="relative inline-flex cursor-pointer items-center shrink-0">
              <input
                type="checkbox"
                checked={autoRenew}
                disabled={isTogglingAutoRenew}
                onChange={(event) => onToggleAutoRenew(event.target.checked)}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-slate-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50" />
            </label>
          ) : null}
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-[0.9fr_0.9fr_1.35fr]">
          <UsageMetric
            scheme={settings.scheme}
            label="Locations"
            used={plan.usage.locations.used}
            limit={plan.usage.locations.limit}
          />
          <UsageMetric
            scheme={settings.scheme}
            label="QR Tables"
            used={plan.usage.qrTables.used}
            limit={plan.usage.qrTables.limit}
          />
          <div
            className={cn(
              "rounded-[14px] border p-4",
              settings.scheme === "dark"
                ? "border-amber-400/60 bg-amber-500/12 text-amber-200"
                : "border-amber-200 bg-amber-50 text-amber-800",
            )}
          >
            <div className="text-[13px] font-semibold leading-6">{plan.renewalNoticeTitle}</div>
            <div
              className={cn(
                "mt-2 text-[13px] leading-6",
                settings.scheme === "dark" ? "text-amber-100/88" : "text-amber-700",
              )}
            >
              {plan.renewalNoticeBody}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
