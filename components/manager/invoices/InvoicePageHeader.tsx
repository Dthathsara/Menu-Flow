import {
  cn,
  getManagerAccentPillClasses,
  getManagerCardShellClasses,
  getManagerPageSubtitleClasses,
  getManagerPageTitleClasses,
  getManagerPrimaryButtonClasses,
  getManagerSecondaryButtonClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";

interface InvoicePageHeaderProps {
  settings: ManagerSettings;
  onViewLatest: () => void;
  onPrintLatest: () => void;
  onDownloadLatest: () => void;
  onOpenChangePlan: () => void;
}

export function InvoicePageHeader({
  settings,
  onViewLatest,
  onPrintLatest,
  onDownloadLatest,
  onOpenChangePlan,
}: InvoicePageHeaderProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden p-5 sm:p-6",
        getManagerCardShellClasses(settings.scheme, { interactive: true }),
      )}
    >
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[38%] bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.18),_transparent_62%)]" />

      <div className="relative flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-4xl">
          <span className={getManagerAccentPillClasses(settings.scheme, "brand")}>
            CLIENT BILLING
          </span>
          <h2 className={cn("mt-4", getManagerPageTitleClasses())}>
            Subscription &amp; Invoices
          </h2>
          <p
            className={cn(
              "mt-3 max-w-3xl text-[14px] leading-6",
              getManagerPageSubtitleClasses(settings.scheme),
            )}
          >
            Manage your MenuFlow package, renewal cycle, payment method, tax details,
            invoice history, downloads, print-ready receipts, and upgrade requests.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-start gap-2 xl:justify-end">
          <button
            type="button"
            onClick={onViewLatest}
            className={cn(
              getManagerSecondaryButtonClasses(settings.scheme),
              "h-10 rounded-[12px] px-4 text-[13px]",
            )}
          >
            View Latest Invoice
          </button>
          <button
            type="button"
            onClick={onPrintLatest}
            className={cn(
              getManagerSecondaryButtonClasses(settings.scheme),
              "h-10 rounded-[12px] px-4 text-[13px]",
            )}
          >
            Print
          </button>
          <button
            type="button"
            onClick={onDownloadLatest}
            className={cn(
              getManagerSecondaryButtonClasses(settings.scheme),
              "h-10 rounded-[12px] px-4 text-[13px]",
            )}
          >
            Download
          </button>
          <button
            type="button"
            onClick={onOpenChangePlan}
            className={cn(
              getManagerPrimaryButtonClasses(settings.scheme),
              "h-10 rounded-[12px] px-4 text-[13px]",
            )}
          >
            Upgrade Plan
          </button>
        </div>
      </div>
    </section>
  );
}
