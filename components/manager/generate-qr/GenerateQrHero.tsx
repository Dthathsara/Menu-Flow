import { cn } from "../managerUtils";

interface GenerateQrHeroProps {
  onDownloadAll: () => void;
  onGenerate: () => void;
}

const heroActionBaseClassName =
  "inline-flex h-11 items-center justify-center rounded-[14px] px-5 text-[14px] font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#081225]";

export function GenerateQrHero({
  onDownloadAll,
  onGenerate,
}: GenerateQrHeroProps) {
  return (
    <section className="rounded-[28px] border border-[#183056] bg-[linear-gradient(180deg,#10233e_0%,#0d1f39_100%)] p-4 shadow-[0_32px_80px_rgba(2,8,23,0.28)] sm:p-5">
      <div className="relative overflow-hidden rounded-[22px] border border-[#1c365d] bg-[linear-gradient(180deg,rgba(18,40,72,0.98),rgba(11,27,52,0.98))] px-5 py-5 sm:px-6 sm:py-6 lg:px-9 lg:py-7">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(71,126,255,0.12),transparent)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <span className="inline-flex w-fit rounded-full bg-[#1a3970] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.28em] text-[#9ac1ff]">
              QR Operations
            </span>

            <h2 className="mt-6 text-[2.35rem] font-bold tracking-[-0.04em] text-white sm:text-[3rem]">
              QR Codes
            </h2>

            <p className="mt-3 max-w-[72rem] text-[15px] leading-8 text-[#bed0ef]">
              Generate, assign, preview, print, download, and now delete branded
              table QR codes across your restaurant floor. This version is built
              like a real operations tool with working actions and modal flows.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-3 lg:justify-end">
            <button
              type="button"
              onClick={onDownloadAll}
              className={cn(
                heroActionBaseClassName,
                "border border-[#2b436a] bg-[#112544] text-white hover:-translate-y-0.5 hover:border-[#35527f] hover:bg-[#152c50]",
              )}
            >
              Download All
            </button>

            <button
              type="button"
              onClick={onGenerate}
              className={cn(
                heroActionBaseClassName,
                "bg-[linear-gradient(180deg,#4b8dff_0%,#3478f6_100%)] text-white shadow-[0_20px_38px_rgba(52,120,246,0.28)] hover:-translate-y-0.5 hover:shadow-[0_24px_44px_rgba(52,120,246,0.34)]",
              )}
            >
              + Generate New QR
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
