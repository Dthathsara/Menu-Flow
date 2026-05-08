import { SearchIcon } from "../icons";
import {
  cn,
  getManagerAccentPillClasses,
  getManagerCardShellClasses,
  getManagerControlShellClasses,
  getManagerPanelShellClasses,
  getManagerSectionSubtitleClasses,
  getMutedTextClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import { QrCard } from "./QrCard";
import type { QrCodeRecord } from "./types";

interface QrLibrarySectionProps {
  settings: ManagerSettings;
  items: QrCodeRecord[];
  totalCount: number;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onDownload: (item: QrCodeRecord) => void;
  onDelete: (item: QrCodeRecord) => void;
}

export function QrLibrarySection({
  settings,
  items,
  totalCount,
  searchValue,
  onSearchChange,
  onDownload,
  onDelete,
}: QrLibrarySectionProps) {
  return (
    <section className={cn("p-4 sm:p-5", getManagerCardShellClasses(settings.scheme, { interactive: true }))}>
      <div className="px-1">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h2 className={cn("text-[1.95rem] font-bold tracking-tight sm:text-[2.1rem]", settings.scheme === "dark" ? "text-slate-100" : "text-slate-900")}>
              Table QR Library
            </h2>
            <p className={cn("mt-2 text-[14px] leading-7", getManagerSectionSubtitleClasses(settings.scheme))}>
              Search, filter, generate, preview, print, download, and delete QR
              codes from one place.
            </p>
          </div>

          <span className={cn(getManagerAccentPillClasses(settings.scheme, "brand"), "h-8 w-fit items-center px-4")}>
            {totalCount} QR CODES
          </span>
        </div>

        <div className="mt-5">
          <label className="block">
            <span className="sr-only">Search QR codes</span>
            <div className={cn(getManagerControlShellClasses(settings.scheme), "h-12 rounded-[14px]")}>
              <SearchIcon className="size-4 text-slate-400" />
              <input
                value={searchValue}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search by Table Number, Section, or Branch"
                className="w-full bg-transparent text-[14px] outline-none placeholder:text-inherit"
                aria-label="Search QR codes"
              />
            </div>
          </label>
        </div>
      </div>

      {items.length ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <QrCard
              key={item.id}
              settings={settings}
              item={item}
              onDownload={onDownload}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div className={cn("mt-5 border-dashed px-5 py-14 text-center", getManagerPanelShellClasses(settings.scheme))}>
          <div className={cn("text-[1.2rem] font-semibold", settings.scheme === "dark" ? "text-slate-100" : "text-slate-900")}>No QR codes found</div>
          <p className={cn("mt-2 text-[14px]", getMutedTextClasses(settings.scheme))}>
            Adjust the search term or generate a new table QR code.
          </p>
        </div>
      )}
    </section>
  );
}
