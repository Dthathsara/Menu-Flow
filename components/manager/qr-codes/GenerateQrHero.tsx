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

interface GenerateQrHeroProps {
  settings: ManagerSettings;
  onDownloadAll: () => void;
  onGenerate: () => void;
}

export function GenerateQrHero({
  settings,
  onDownloadAll,
  onGenerate,
}: GenerateQrHeroProps) {
  return (
    <section className={cn("overflow-hidden p-5 sm:p-6", getManagerCardShellClasses(settings.scheme, { interactive: true }))}>
      <div className="relative">
        <div className="pointer-events-none absolute -right-10 top-0 h-36 w-36 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <span className={getManagerAccentPillClasses(settings.scheme, "brand")}>
              QR Operations
            </span>

            <h2 className={cn("mt-5", getManagerPageTitleClasses())}>
              QR Codes
            </h2>

            <p className={cn("mt-3 max-w-[72rem]", getManagerPageSubtitleClasses(settings.scheme))}>
              Generate, assign, preview, print, download, and now delete branded
              table QR codes across your restaurant floor. This version is built
              like a real operations tool with working actions and modal flows.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-3 lg:justify-end">
            <button
              type="button"
              onClick={onDownloadAll}
              className={cn(getManagerSecondaryButtonClasses(settings.scheme), "h-11 rounded-[14px] px-5 text-[14px]")}
            >
              Download All
            </button>

            <button
              type="button"
              onClick={onGenerate}
              className={cn(getManagerPrimaryButtonClasses(settings.scheme), "h-11 rounded-[14px] px-5 text-[14px]")}
            >
              + Generate New QR
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
