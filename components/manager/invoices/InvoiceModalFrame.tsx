"use client";

import { createPortal } from "react-dom";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { XIcon } from "../icons";
import {
  cn,
  getManagerIconButtonClasses,
  getManagerModalSurfaceClasses,
  getManagerModalTitleClasses,
  getManagerSectionSubtitleClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";

interface InvoiceModalFrameProps {
  open: boolean;
  settings: ManagerSettings;
  title: string;
  subtitle: string;
  maxWidthClassName: string;
  bodyClassName?: string;
  footer?: ReactNode;
  children: ReactNode;
  onClose: () => void;
}

export function InvoiceModalFrame({
  open,
  settings,
  title,
  subtitle,
  maxWidthClassName,
  bodyClassName,
  footer,
  children,
  onClose,
}: InvoiceModalFrameProps) {
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

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-slate-950/76 px-4 py-5 backdrop-blur-md sm:px-6"
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
          "my-auto w-full overflow-hidden rounded-[28px] shadow-[0_34px_90px_rgba(2,6,23,0.42)]",
          "max-h-[92vh]",
          maxWidthClassName,
          getManagerModalSurfaceClasses(settings.scheme),
        )}
      >
        <div className="flex max-h-[92vh] flex-col">
          <div
            className={cn(
              "flex items-start justify-between gap-4 border-b px-6 py-5 sm:px-7",
              settings.scheme === "dark"
                ? "border-white/10 bg-slate-900/78"
                : "border-slate-200 bg-slate-50/90",
            )}
          >
            <div className="min-w-0">
              <h2 className={getManagerModalTitleClasses()}>{title}</h2>
              <p className={cn("mt-2 max-w-2xl", getManagerSectionSubtitleClasses(settings.scheme))}>
                {subtitle}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label={`Close ${title}`}
              className={getManagerIconButtonClasses(settings.scheme, true)}
            >
              <XIcon className="size-4" />
            </button>
          </div>

          <div
            className={cn(
              "overflow-y-auto px-6 py-6 sm:px-7",
              settings.scheme === "dark" ? "bg-slate-950/98" : "bg-white/98",
              bodyClassName,
            )}
          >
            {children}
          </div>

          {footer ? (
            <div
              className={cn(
                "flex flex-col-reverse gap-3 border-t px-6 py-5 sm:flex-row sm:justify-end sm:px-7",
                settings.scheme === "dark"
                  ? "border-white/10 bg-slate-900/78"
                  : "border-slate-200 bg-slate-50/90",
              )}
            >
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}
