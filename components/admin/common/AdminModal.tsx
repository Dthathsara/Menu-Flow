import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { XIcon } from "@/components/manager/icons";
import { cn } from "@/components/manager/managerUtils";
import { adminCardClasses } from "./adminStyles";
import type { AdminScheme } from "./adminTypes";

interface AdminModalProps {
  open: boolean;
  scheme: AdminScheme;
  title: string;
  subtitle?: string;
  size?: "sm" | "md" | "lg" | "xl";
  footer?: React.ReactNode;
  children: React.ReactNode;
  onClose: () => void;
}

export function AdminModal({
  open,
  scheme,
  title,
  subtitle,
  size = "lg",
  footer,
  children,
  onClose,
}: AdminModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!open || !mounted) {
    return null;
  }

  const widthClass =
    size === "sm" ? "max-w-md" : size === "md" ? "max-w-2xl" : size === "xl" ? "max-w-5xl" : "max-w-[720px]";

  const content = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-pointer bg-black/75 backdrop-blur-sm"
        aria-label="Close modal"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative flex flex-col max-h-[calc(100dvh-2rem)] w-full overflow-hidden rounded-2xl shadow-[0_28px_80px_rgba(0,0,0,0.45)]",
          widthClass,
          adminCardClasses(scheme),
        )}
      >
        <div
          className={cn(
            "flex shrink-0 items-center justify-between border-b px-5 py-4 sm:px-7",
            scheme === "dark" ? "border-[#263650] bg-[#101a2b]" : "border-slate-200 bg-white",
          )}
        >
          <div className="min-w-0">
            <h2 className="text-[1.35rem] sm:text-[1.55rem] font-extrabold tracking-tight">{title}</h2>
            {subtitle ? (
              <p className={cn("mt-0.5 text-xs sm:text-sm", scheme === "dark" ? "text-slate-400" : "text-slate-500")}>
                {subtitle}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-[12px] border transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35",
              scheme === "dark"
                ? "border-[#263650] bg-[#101a2b] text-slate-300 hover:border-blue-400/40 hover:bg-[#162236] hover:text-white"
                : "border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900",
            )}
            aria-label="Close"
          >
            <XIcon className="size-4" />
          </button>
        </div>
        <div
          className={cn(
            "flex-1 min-h-0 overflow-y-auto px-5 py-5 sm:px-7",
            scheme === "dark" ? "bg-[#101a2b]" : "bg-white",
          )}
        >
          {children}
        </div>
        {footer ? (
          <div
            className={cn(
              "flex shrink-0 flex-col-reverse gap-3 border-t px-5 py-4 sm:flex-row sm:justify-end sm:px-7",
              scheme === "dark" ? "border-[#263650] bg-[#101a2b]" : "border-slate-200 bg-white",
            )}
          >
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
