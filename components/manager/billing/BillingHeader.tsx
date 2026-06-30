import { UploadIcon } from "../icons";
import {
  cn,
  getManagerAccentPillClasses,
  getManagerCardShellClasses,
  getManagerPageSubtitleClasses,
  getManagerPageTitleClasses,
  getManagerSecondaryButtonClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import { BillingStatCard } from "./BillingStatCard";
import type { BillingStat } from "./billing.types";

interface BillingHeaderProps {
  settings: ManagerSettings;
  stats: BillingStat[];
  onExportReport: () => void;
  isExporting?: boolean;
}

export function BillingHeader({
  settings,
  stats,
  onExportReport,
  isExporting = false,
}: BillingHeaderProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden p-5 sm:p-6",
        getManagerCardShellClasses(settings.scheme, { interactive: true }),
      )}
    >
      <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="relative">
          <span className={getManagerAccentPillClasses(settings.scheme, "brand")}>
            RESTAURANT BILLING
          </span>
          <h2 className={cn("mt-5", getManagerPageTitleClasses())}>Billing</h2>
          <p className={cn("mt-3 max-w-4xl text-[14px] leading-6", getManagerPageSubtitleClasses(settings.scheme))}>
            Convert QR table orders into final bills, collect payments, print receipts,
            manage pending collections, split bills, and track waiter-served order
            payments.
          </p>
        </div>

        <button
          type="button"
          onClick={onExportReport}
          disabled={isExporting}
          className={cn(
            getManagerSecondaryButtonClasses(settings.scheme),
            "h-10 rounded-[14px] px-4 text-[14px]",
            isExporting && "cursor-wait opacity-70",
          )}
        >
          <UploadIcon className="size-4" />
          {isExporting ? "Exporting..." : "Export Report"}
        </button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => (
          <BillingStatCard key={stat.label} settings={settings} stat={stat} />
        ))}
      </div>
    </section>
  );
}
