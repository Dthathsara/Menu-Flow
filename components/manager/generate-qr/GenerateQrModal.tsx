"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { XIcon } from "../icons";
import { cn } from "../managerUtils";
import type { GenerateQrFormValues } from "./types";

interface GenerateQrModalProps {
  onClose: () => void;
  onSubmit: (values: GenerateQrFormValues) => void;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

function createEmptyFormValues(): GenerateQrFormValues {
  return {
    tableNumber: "",
    section: "",
  };
}

export function GenerateQrModal({
  onClose,
  onSubmit,
}: GenerateQrModalProps) {
  const [values, setValues] = useState<GenerateQrFormValues>(createEmptyFormValues);
  const [isVisible, setIsVisible] = useState(false);
  const closeTimeoutRef = useRef<number | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const closingRef = useRef(false);
  const titleId = useId();
  const requestClose = useCallback(() => {
    if (closingRef.current) {
      return;
    }

    closingRef.current = true;
    setIsVisible(false);

    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
    }

    closeTimeoutRef.current = window.setTimeout(() => {
      closingRef.current = false;
      onClose();
    }, 180);
  }, [onClose]);

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    closingRef.current = false;

    const enterFrame = window.requestAnimationFrame(() => {
      setIsVisible(true);
      firstInputRef.current?.focus();
    });

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        requestClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
        FOCUSABLE_SELECTOR,
      );

      if (!focusableElements?.length) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(enterFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;

      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }

      previousFocusRef.current?.focus();
    };
  }, [requestClose]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onSubmit({
      tableNumber: values.tableNumber.trim(),
      section: values.section.trim(),
    });

    requestClose();
  }

  const inputClassName =
    "h-12 w-full rounded-[14px] border border-[#1d3150] bg-[#0a1325] px-4 text-[14px] text-white outline-none transition-all duration-200 ease-out placeholder:text-[#6f7f9d] hover:border-[#28456c] focus:border-[#3f75dd] focus:ring-2 focus:ring-[#3f75dd]/35";

  return (
    <div
      className={cn(
        "fixed inset-0 z-[80] flex items-center justify-center p-4 transition-all duration-200 ease-out",
        isVisible ? "bg-[#030917]/70 backdrop-blur-md" : "bg-[#030917]/0 backdrop-blur-none",
      )}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          requestClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "w-full max-w-[560px] overflow-hidden rounded-[26px] border border-[#183058] bg-[linear-gradient(180deg,#091427_0%,#07101f_100%)] shadow-[0_40px_100px_rgba(2,8,23,0.42)] transition-all duration-200 ease-out",
          isVisible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-3 scale-[0.985] opacity-0",
        )}
      >
        <form onSubmit={handleSubmit}>
          <div className="flex items-start justify-between gap-4 border-b border-[#142847] px-6 py-5">
            <div className="min-w-0">
              <h2
                id={titleId}
                className="text-[1.2rem] font-bold tracking-[-0.03em] text-white sm:text-[1.45rem]"
              >
                Generate New QR Code
              </h2>
              <p className="mt-2 text-[14px] leading-6 text-[#9eb1d1]">
                Create a new QR code for a restaurant table or dining area.
              </p>
            </div>

            <button
              type="button"
              onClick={requestClose}
              className="inline-flex size-10 items-center justify-center rounded-[14px] border border-[#20385f] bg-[#13223f] text-[#d7e6ff] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[#32527f] hover:bg-[#182b4d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#081225]"
              aria-label="Close generate QR modal"
            >
              <XIcon className="size-4" />
            </button>
          </div>

          <div className="px-6 py-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2.5">
                <label
                  htmlFor="table-number"
                  className="block text-[11px] font-bold uppercase tracking-[0.24em] text-[#9fb0cf]"
                >
                  Table Number
                </label>
                <input
                  ref={firstInputRef}
                  id="table-number"
                  value={values.tableNumber}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      tableNumber: event.target.value,
                    }))
                  }
                  placeholder="e.g. T-09"
                  className={inputClassName}
                  required
                />
              </div>

              <div className="space-y-2.5">
                <label
                  htmlFor="section"
                  className="block text-[11px] font-bold uppercase tracking-[0.24em] text-[#9fb0cf]"
                >
                  Section
                </label>
                <input
                  id="section"
                  value={values.section}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      section: event.target.value,
                    }))
                  }
                  placeholder="e.g. Indoor / Outdoor"
                  className={inputClassName}
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-[#142847] px-6 py-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={requestClose}
              className="inline-flex h-11 items-center justify-center rounded-[14px] border border-[#23395d] bg-[#13223f] px-5 text-[14px] font-semibold text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[#31507b] hover:bg-[#17294a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#081225]"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-[14px] bg-[linear-gradient(180deg,#4b8dff_0%,#3478f6_100%)] px-5 text-[14px] font-semibold text-white shadow-[0_18px_34px_rgba(52,120,246,0.28)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_22px_40px_rgba(52,120,246,0.34)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#081225]"
            >
              Generate QR Code
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
