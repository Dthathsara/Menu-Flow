import { TrashIcon } from "../icons";
import {
  cn,
  getManagerBadgeClasses,
  getManagerIconButtonClasses,
  getManagerPanelShellClasses,
  getManagerSecondaryButtonClasses,
  getManagerStrongTextClasses,
  getMutedTextClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import { QrSvgPreview } from "./qr-renderer";
import type { QrCodeRecord } from "./types";

interface QrCardProps {
  settings: ManagerSettings;
  item: QrCodeRecord;
  onDownload: (item: QrCodeRecord) => void;
  onDelete: (item: QrCodeRecord) => void;
}

export function QrCard({ settings, item, onDownload, onDelete }: QrCardProps) {
  return (
    <article className={cn("flex h-full flex-col p-4", getManagerPanelShellClasses(settings.scheme))}>
      <div className="flex items-center justify-between gap-3">
        <span
          className={cn(
            "inline-flex h-8 items-center rounded-full border px-4 text-[12px] font-semibold",
            getManagerBadgeClasses("success", settings.scheme),
          )}
        >
          {item.status}
        </span>

        <button
          type="button"
          onClick={() => onDelete(item)}
          className={cn(getManagerIconButtonClasses(settings.scheme, true), "size-8 rounded-[11px]")}
          aria-label={`Delete QR code for ${item.tableNumber}`}
        >
          <TrashIcon className="size-3.5" />
        </button>
      </div>

      <div className="mt-3 rounded-[18px] bg-white p-1.5 shadow-[inset_0_0_0_1px_rgba(17,24,39,0.06)]">
        <QrSvgPreview
          value={item.qrValue}
          title={`QR code for table ${item.tableNumber}`}
          className="aspect-square w-full overflow-hidden rounded-[14px]"
          svgClassName="rounded-[14px] bg-white"
        />
      </div>

      <div className="mt-4 flex flex-1 flex-col">
        <h3 className={cn("text-[1.55rem] font-bold tracking-[-0.035em]", getManagerStrongTextClasses(settings.scheme))}>
          Table {item.tableNumber}
        </h3>
        <p className={cn("mt-1 text-[15px] font-medium", getManagerStrongTextClasses(settings.scheme))}>{item.section}</p>
        <p className={cn("mt-0.5 text-[14px]", getMutedTextClasses(settings.scheme))}>{item.branch}</p>

        <button
          type="button"
          onClick={() => onDownload(item)}
          className={cn(
            getManagerSecondaryButtonClasses(settings.scheme),
            "mt-8 inline-flex h-11 w-full rounded-[12px] px-4 text-[14px]",
          )}
        >
          Download
        </button>
      </div>
    </article>
  );
}
