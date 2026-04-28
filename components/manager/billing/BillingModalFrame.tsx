"use client";

import { useEffect } from "react";
import { XIcon } from "../icons";
import {
  cn,
  getManagerIconButtonClasses,
  getManagerModalSurfaceClasses,
  getManagerModalTitleClasses,
  getManagerSectionSubtitleClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";

interface BillingModalFrameProps {
  open: boolean;
  settings: ManagerSettings;
  title: string;
  subtitle: string;
  maxWidthClassName: string;
  bodyClassName?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  onClose: () => void;
}

export function BillingModalFrame({
  open,
  settings,
  title,
  subtitle,
  maxWidthClassName,
  bodyClassName,
  footer,
  children,
  onClose,
}: BillingModalFrameProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-black/60 px-4 py-4 backdrop-blur-md md:py-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          maxWidthClassName,
          "my-auto w-[calc(100vw-32px)] overflow-visible rounded-[24px] shadow-2xl",
          "max-h-[90vh]",
          getManagerModalSurfaceClasses(settings.scheme),
        )}
      >
        <div className="flex max-h-[90vh] flex-col overflow-hidden rounded-[24px]">
          <div
            className={cn(
              "flex items-start justify-between gap-4 border-b px-6 py-5",
              settings.scheme === "dark"
                ? "border-white/10 bg-slate-900/72"
                : "border-slate-200 bg-slate-50/85",
            )}
          >
            <div className="min-w-0">
              <h2 className={getManagerModalTitleClasses()}>{title}</h2>
              <p className={getManagerSectionSubtitleClasses(settings.scheme)}>{subtitle}</p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={getManagerIconButtonClasses(settings.scheme, true)}
              aria-label={`Close ${title}`}
            >
              <XIcon className="size-4" />
            </button>
          </div>

          <div
            className={cn(
              "overflow-visible px-6 py-6 max-md:max-h-[calc(90vh-11.5rem)]",
              bodyClassName,
              settings.scheme === "dark" ? "bg-slate-950/98" : "bg-white/98",
            )}
          >
            {children}
          </div>

          {footer ? (
            <div
              className={cn(
                "flex justify-end gap-3 border-t px-6 py-5",
                settings.scheme === "dark"
                  ? "border-white/10 bg-slate-900/72"
                  : "border-slate-200 bg-slate-50/85",
              )}
            >
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
