"use client";

import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import { useEffect } from "react";

import {
  cn,
  getAuthMutedTextClasses,
  getAuthOverlayClasses,
  getAuthSurfaceClasses,
  type AuthTheme,
} from "@/components/common/theme";

function getAuthCloseButtonClasses(theme: AuthTheme) {
  return cn(
    "inline-flex h-11 w-11 items-center justify-center rounded-2xl border bg-[var(--button-secondary-bg)] text-[var(--button-secondary-text)] shadow-[var(--button-secondary-shadow)] transition duration-300",
    "hover:-translate-y-0.5 hover:bg-[var(--button-secondary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/60",
    "[border-color:var(--border-soft)]",
    theme === "dark" ? "hover:text-white" : "hover:text-slate-900",
  );
}

export function AuthModalShell({
  open,
  onClose,
  theme,
  title,
  subtitle,
  maxWidthClassName = "max-w-[520px]",
  children,
}: {
  open: boolean;
  onClose: () => void;
  theme: AuthTheme;
  title: string;
  subtitle: string;
  maxWidthClassName?: string;
  children: ReactNode;
}) {
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

  const modalContent = (
    <div
      className={cn("fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6 sm:px-6", getAuthOverlayClasses(theme))}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={cn(maxWidthClassName, getAuthSurfaceClasses(theme))}>
        <div className="pointer-events-none absolute -left-16 top-0 h-40 w-40 rounded-full bg-orange-500/18 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-44 w-44 rounded-full bg-fuchsia-500/14 blur-3xl" />

        <div className="relative p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[1.9rem] font-semibold tracking-tight text-[var(--text-primary)]">
                {title}
              </h2>
              <p className={cn("mt-3 max-w-[32rem]", getAuthMutedTextClasses(theme))}>
                {subtitle}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label={`Close ${title} modal`}
              className={getAuthCloseButtonClasses(theme)}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4 stroke-current"
                fill="none"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
