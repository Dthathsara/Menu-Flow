import {
  cn,
  getInteractiveCardClasses,
  getManagerAccentPillClasses,
  getManagerCardShellClasses,
  getManagerEyebrowClasses,
  getManagerPanelShellClasses,
  getManagerSectionSubtitleClasses,
  getManagerSectionTitleClasses,
  getManagerStrongTextClasses,
  getMutedTextClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import { formatCurrency, getSuccessButtonClasses } from "./billing.helpers";
import type { BillRecord } from "./billing.types";

interface PendingCollectionQueueProps {
  settings: ManagerSettings;
  bills: BillRecord[];
  onCollect: (bill: BillRecord) => void;
}

export function PendingCollectionQueue({
  settings,
  bills,
  onCollect,
}: PendingCollectionQueueProps) {
  return (
    <section
      className={cn(
        "p-5 sm:p-6",
        getManagerCardShellClasses(settings.scheme, { interactive: true }),
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className={getManagerSectionTitleClasses()}>Pending Collection Queue</h3>
          <p className={getManagerSectionSubtitleClasses(settings.scheme)}>
            Tables that need cashier confirmation before closing.
          </p>
        </div>
        <span className={getManagerAccentPillClasses(settings.scheme, "brand")}>
          ACTION NEEDED
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {bills.length ? (
          bills.map((bill) => (
            <div
              key={bill.id}
              className={cn(
                getManagerPanelShellClasses(settings.scheme),
                getInteractiveCardClasses(settings.scheme),
                "relative overflow-hidden px-4 py-4 sm:px-5",
              )}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-r from-blue-500/10 via-transparent to-transparent" />
              <div className={getManagerEyebrowClasses(settings.scheme)}>
                {`${bill.billId} \u00B7 ${bill.tableNumber}`}
              </div>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div
                    className={cn(
                      "text-[1.8rem] font-bold tracking-tight",
                      getManagerStrongTextClasses(settings.scheme),
                    )}
                  >
                    {formatCurrency(bill.total)}
                  </div>
                  <p className={cn("mt-2 text-[13px] leading-5", getMutedTextClasses(settings.scheme))}>
                    {bill.waiterName} served this table. Waiting for payment.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onCollect(bill)}
                  className={getSuccessButtonClasses(settings.scheme)}
                >
                  Collect
                </button>
              </div>
            </div>
          ))
        ) : (
          <div
            className={cn(
              getManagerPanelShellClasses(settings.scheme),
              "px-4 py-8 text-center text-[14px]",
              getMutedTextClasses(settings.scheme),
            )}
          >
            No pending table payments right now.
          </div>
        )}
      </div>
    </section>
  );
}
