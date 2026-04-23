import { QrCard } from "./QrCard";
import type { QrCodeRecord } from "./types";

interface QrLibrarySectionProps {
  items: QrCodeRecord[];
  totalCount: number;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onDownload: (item: QrCodeRecord) => void;
  onDelete: (item: QrCodeRecord) => void;
}

export function QrLibrarySection({
  items,
  totalCount,
  searchValue,
  onSearchChange,
  onDownload,
  onDelete,
}: QrLibrarySectionProps) {
  return (
    <section className="rounded-[28px] border border-[#152845] bg-[linear-gradient(180deg,#071325_0%,#050d1c_100%)] p-4 shadow-[0_30px_74px_rgba(2,8,23,0.24)] sm:p-5">
      <div className="px-1">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h2 className="text-[2.1rem] font-bold tracking-[-0.04em] text-white">
              Table QR Library
            </h2>
            <p className="mt-2 text-[14px] leading-7 text-[#adc0de]">
              Search, filter, generate, preview, print, download, and delete QR
              codes from one place.
            </p>
          </div>

          <span className="inline-flex h-8 w-fit items-center rounded-full bg-[#243d71] px-4 text-[11px] font-bold uppercase tracking-[0.24em] text-white">
            {totalCount} QR CODES
          </span>
        </div>

        <div className="mt-5">
          <input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by Table Number, Section, or Branch"
            className="h-12 w-full rounded-[14px] border border-[#1b3152] bg-[#091528] px-4 text-[14px] text-white outline-none transition-all duration-200 ease-out placeholder:text-[#7487a8] hover:border-[#28436c] focus:border-[#3f75dd] focus:ring-2 focus:ring-[#3f75dd]/35"
            aria-label="Search QR codes"
          />
        </div>
      </div>

      {items.length ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <QrCard
              key={item.id}
              item={item}
              onDownload={onDownload}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-[22px] border border-dashed border-[#253a5c] bg-[#081225] px-5 py-14 text-center">
          <div className="text-[1.2rem] font-semibold text-white">No QR codes found</div>
          <p className="mt-2 text-[14px] text-[#97abcb]">
            Adjust the search term or generate a new table QR code.
          </p>
        </div>
      )}
    </section>
  );
}
