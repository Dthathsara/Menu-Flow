import { SearchIcon } from "../icons";
import {
  cn,
  getManagerAccentPillClasses,
  getManagerBodyTextClasses,
  getManagerCardShellClasses,
  getManagerControlShellClasses,
  getManagerPanelShellClasses,
  getManagerSectionSubtitleClasses,
  getManagerSectionTitleClasses,
  getMutedTextClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import { FilterDropdown } from "../orders/FilterDropdown";
import { QrCard } from "./QrCard";
import type { QrCodeRecord } from "./types";

interface QrLibrarySectionProps {
  settings: ManagerSettings;
  items: QrCodeRecord[];
<<<<<<< HEAD
  searchValue: string;
  onSearchChange: (value: string) => void;
=======
  totalItemCount: number;
  searchValue: string;
  sectionValue: string;
  sectionOptions: readonly string[];
  isLoading: boolean;
  errorMessage: string;
  onSearchChange: (value: string) => void;
  onSectionChange: (value: string) => void;
  onRetry: () => void;
>>>>>>> Dulnith
  onDownload: (item: QrCodeRecord) => void;
  onDelete: (item: QrCodeRecord) => void;
  deletingId: string;
}

export function QrLibrarySection({
  settings,
  items,
<<<<<<< HEAD
  searchValue,
  onSearchChange,
=======
  totalItemCount,
  searchValue,
  sectionValue,
  sectionOptions,
  isLoading,
  errorMessage,
  onSearchChange,
  onSectionChange,
  onRetry,
>>>>>>> Dulnith
  onDownload,
  onDelete,
  deletingId,
}: QrLibrarySectionProps) {
  return (
    <section className={cn("p-4 sm:p-5", getManagerCardShellClasses(settings.scheme, { interactive: true }))}>
      <div className="px-1">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h2 className={getManagerSectionTitleClasses()}>
              Table QR Library
            </h2>
            <p className={cn("mt-2 text-[14px] leading-7", getManagerSectionSubtitleClasses(settings.scheme))}>
              Search, filter, generate, preview, print, download, and delete QR
              codes from one place.
            </p>
          </div>

          <span className={cn(getManagerAccentPillClasses(settings.scheme, "brand"), "h-8 w-fit items-center px-4")}>
            SORTED BY TABLE AND BRANCH
          </span>
        </div>

        <div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <label className="min-w-0 flex-1">
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

<<<<<<< HEAD
=======
          <div className="min-w-0 xl:w-[220px]">
            <FilterDropdown
              label="Filter QR codes by section"
              settings={settings}
              options={sectionOptions.map((section) => ({
                label: section,
                value: section,
              }))}
              value={sectionValue}
              onChange={onSectionChange}
            />
          </div>

>>>>>>> Dulnith
          <div className={cn("font-medium", getManagerBodyTextClasses(settings.scheme))}>
            {items.length} result{items.length === 1 ? "" : "s"}
          </div>
        </div>
      </div>

<<<<<<< HEAD
      {items.length ? (
=======
      {errorMessage ? (
        <div className={cn("mt-5 px-5 py-10 text-center", getManagerPanelShellClasses(settings.scheme))}>
          <div className={cn("text-[1.05rem] font-semibold", settings.scheme === "dark" ? "text-slate-100" : "text-slate-900")}>
            {errorMessage}
          </div>
          <button
            type="button"
            onClick={onRetry}
            className={cn("mt-4 rounded-[12px] px-4 py-2 text-[14px] font-semibold", getManagerControlShellClasses(settings.scheme))}
          >
            Retry
          </button>
        </div>
      ) : isLoading ? (
        <div className={cn("mt-5 px-5 py-14 text-center", getManagerPanelShellClasses(settings.scheme))}>
          <div className={cn("text-[1.05rem] font-semibold", settings.scheme === "dark" ? "text-slate-100" : "text-slate-900")}>Loading QR codes...</div>
          <p className={cn("mt-2 text-[14px]", getMutedTextClasses(settings.scheme))}>
            Fetching the latest table QR library.
          </p>
        </div>
      ) : items.length ? (
>>>>>>> Dulnith
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <QrCard
              key={item.id}
              settings={settings}
              item={item}
              onDownload={onDownload}
              onDelete={onDelete}
              isDeleting={deletingId === item.id}
            />
          ))}
        </div>
      ) : (
        <div className={cn("mt-5 border-dashed px-5 py-14 text-center", getManagerPanelShellClasses(settings.scheme))}>
          <div className={cn("text-[1.2rem] font-semibold", settings.scheme === "dark" ? "text-slate-100" : "text-slate-900")}>
            {totalItemCount ? "No QR codes found" : "No QR codes yet"}
          </div>
          <p className={cn("mt-2 text-[14px]", getMutedTextClasses(settings.scheme))}>
            {totalItemCount
              ? "Adjust the search term or section filter."
              : "Generate a new table QR code to add it to the library."}
          </p>
        </div>
      )}
    </section>
  );
}
