import {
  cn,
  getManagerBadgeClasses,
  getManagerCardShellClasses,
  getManagerEyebrowClasses,
  getManagerPanelShellClasses,
  getManagerSectionSubtitleClasses,
  getManagerSectionTitleClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import type { SubscriptionPlan } from "./invoice.types";

interface CurrentPackageCardProps {
  settings: ManagerSettings;
  plan: SubscriptionPlan;
}

function UsageMetric({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number;
}) {
  const progress = Math.min(100, (used / limit) * 100);

  return (
    <div className="rounded-[14px] border border-white/10 bg-slate-950/38 p-3.5">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </div>
      <div className="mt-2 text-[1.05rem] font-bold text-slate-100">
        {used}/{limit}
      </div>
      <div className="mt-3 h-1.5 rounded-full bg-white/8">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#06b6d4,#38bdf8)]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function CurrentPackageCard({ settings, plan }: CurrentPackageCardProps) {
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
          "bg-[linear-gradient(135deg,rgba(37,99,235,0.18),rgba(15,23,42,0.76))]",
        )}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <div className="text-[1.7rem] font-bold leading-tight text-slate-50">
              {plan.planName}
            </div>
            <p className="mt-2 text-[13px] leading-6 text-slate-300">
              {plan.currentPackageDescription}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-[2rem] font-bold leading-none text-white sm:text-[2.15rem]">
              {plan.priceDisplay}
              {plan.priceUnit ? (
                <span className="text-[0.95rem] font-semibold text-slate-300">
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
            <div key={item.label} className="rounded-[14px] border border-white/10 bg-slate-950/38 p-3.5">
              <div className={getManagerEyebrowClasses(settings.scheme)}>{item.label}</div>
              <div className="mt-2 text-[14px] font-semibold leading-5 text-slate-100">
                {item.value}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-[0.9fr_0.9fr_1.35fr]">
          <UsageMetric
            label="Locations"
            used={plan.usage.locations.used}
            limit={plan.usage.locations.limit}
          />
          <UsageMetric
            label="QR Tables"
            used={plan.usage.qrTables.used}
            limit={plan.usage.qrTables.limit}
          />
          <div className="rounded-[14px] border border-amber-400/60 bg-amber-500/12 p-4 text-amber-200">
            <div className="text-[13px] font-semibold leading-6">{plan.renewalNoticeTitle}</div>
            <div className="mt-2 text-[13px] leading-6 text-amber-100/88">
              {plan.renewalNoticeBody}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
