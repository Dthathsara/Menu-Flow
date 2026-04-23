import { TrashIcon } from "../icons";
import { cn } from "../managerUtils";
import { QrSvgPreview } from "./qr-renderer";
import type { QrCodeRecord } from "./types";

interface QrCardProps {
  item: QrCodeRecord;
  onDownload: (item: QrCodeRecord) => void;
  onDelete: (item: QrCodeRecord) => void;
}

export function QrCard({ item, onDownload, onDelete }: QrCardProps) {
  return (
    <article className="flex h-full flex-col rounded-[22px] border border-[#1c3251] bg-[linear-gradient(180deg,#0c1830_0%,#091224_100%)] p-4 shadow-[0_22px_44px_rgba(2,8,23,0.22)]">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex h-8 items-center rounded-full border border-[#116b62] bg-[#083a42] px-4 text-[12px] font-semibold text-[#5df8c3]">
          {item.status}
        </span>

        <button
          type="button"
          onClick={() => onDelete(item)}
          className="inline-flex size-8 items-center justify-center rounded-[11px] border border-[#253b5d] bg-[#142441] text-[#9bb0d6] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[#36527c] hover:bg-[#182b4d] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#081225]"
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
        <h3 className="text-[1.55rem] font-bold tracking-[-0.035em] text-white">
          Table {item.tableNumber}
        </h3>
        <p className="mt-1 text-[15px] font-medium text-white">{item.section}</p>
        <p className="mt-0.5 text-[14px] text-[#a9bbd8]">{item.branch}</p>

        <button
          type="button"
          onClick={() => onDownload(item)}
          className={cn(
            "mt-8 inline-flex h-11 w-full items-center justify-center rounded-[12px] border border-[#243a5e] bg-[#14233f] px-4 text-[14px] font-semibold text-white transition-all duration-200 ease-out",
            "hover:-translate-y-0.5 hover:border-[#31507d] hover:bg-[#192b4d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#081225]",
          )}
        >
          Download
        </button>
      </div>
    </article>
  );
}
