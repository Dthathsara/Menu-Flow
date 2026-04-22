import { cn } from "@/components/manager/managerUtils";

interface BrandProps {
  size?: "sidebar" | "navbar";
  inverted?: boolean;
  showText?: boolean;
  hideSubtitleOnMobile?: boolean;
  className?: string;
}

export function Brand({
  size = "navbar",
  inverted = false,
  showText = true,
  hideSubtitleOnMobile = false,
  className,
}: BrandProps) {
  const logoSize = size === "sidebar" ? "size-11 rounded-lg text-lg" : "size-9 rounded-md text-sm";
  const titleSize = size === "sidebar" ? "text-base" : "text-[15px]";

  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <span
        className={cn(
          "flex shrink-0 items-center justify-center bg-gradient-to-br from-orange-500 via-fuchsia-500 to-purple-600 font-bold text-white shadow-[0_14px_30px_rgba(124,58,237,0.22)]",
          logoSize,
        )}
        aria-hidden="true"
      >
        M
      </span>

      {showText ? (
        <span className="min-w-0">
          <span
            className={cn(
              "block truncate font-bold leading-none",
              titleSize,
              inverted ? "text-white" : "text-slate-900",
            )}
          >
            MenuFlow
          </span>
          <span
            className={cn(
              "mt-1 block truncate text-xs",
              hideSubtitleOnMobile && "hidden sm:block",
              inverted ? "text-white/68" : "text-slate-500",
            )}
          >
            Smart menus. Faster service.
          </span>
        </span>
      ) : null}
    </div>
  );
}
