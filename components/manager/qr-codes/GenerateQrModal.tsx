"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { XIcon } from "../icons";
import {
  cn,
  getManagerEyebrowClasses,
  getManagerIconButtonClasses,
  getManagerModalBodyClasses,
  getManagerModalFooterClasses,
  getManagerModalHeaderClasses,
  getManagerModalSurfaceClasses,
  getManagerModalTitleClasses,
  getManagerPrimaryButtonClasses,
  getManagerSecondaryButtonClasses,
  getManagerStrongTextClasses,
  getManagerTextInputClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import type { GenerateQrFormValues } from "./types";

interface GenerateQrModalProps {
  settings: ManagerSettings;
<<<<<<< HEAD
  onClose: () => void;
  onSubmit: (values: GenerateQrFormValues) => void;
=======
  sectionSuggestions: readonly string[];
  tableNumberSuggestions: readonly string[];
  isSubmitting?: boolean;
  errorMessage?: string;
  onClose: () => void;
  onSubmit: (values: GenerateQrFormValues) => Promise<void> | void;
>>>>>>> Dulnith
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
  settings,
<<<<<<< HEAD
=======
  sectionSuggestions,
  tableNumberSuggestions,
  isSubmitting = false,
  errorMessage = "",
>>>>>>> Dulnith
  onClose,
  onSubmit,
}: GenerateQrModalProps) {
  const [values, setValues] = useState<GenerateQrFormValues>(createEmptyFormValues);
  const [localErrorMessage, setLocalErrorMessage] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const closeTimeoutRef = useRef<number | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const closingRef = useRef(false);
  const titleId = useId();
<<<<<<< HEAD
=======
  const sectionListId = useId();
  const tableNumberListId = useId();
>>>>>>> Dulnith
  const requestClose = useCallback(() => {
    if (isSubmitting) {
      return;
    }

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
  }, [isSubmitting, onClose]);

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

<<<<<<< HEAD
    onSubmit({
=======
    const nextValues = {
>>>>>>> Dulnith
      tableNumber: values.tableNumber.trim(),
      section: values.section.trim(),
    };

<<<<<<< HEAD
    requestClose();
=======
    if (!nextValues.tableNumber || !nextValues.section) {
      setLocalErrorMessage("Table number and section are required.");
      return;
    }

    setLocalErrorMessage("");
    await onSubmit(nextValues);
>>>>>>> Dulnith
  }

  const inputClassName = cn(getManagerTextInputClasses(settings.scheme), "h-12 rounded-[14px] text-[14px]");
  const displayErrorMessage = localErrorMessage || errorMessage;

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
          "max-w-[560px] transition-all duration-200 ease-out",
          getManagerModalSurfaceClasses(settings.scheme),
          isVisible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-3 scale-[0.985] opacity-0",
        )}
        >
        <form onSubmit={handleSubmit}>
          <div className={getManagerModalHeaderClasses(settings.scheme)}>
            <div className="min-w-0">
              <h2
                id={titleId}
                className={cn(getManagerModalTitleClasses(), getManagerStrongTextClasses(settings.scheme))}
              >
                Generate New QR Code
              </h2>
              <p className={cn("mt-2 text-[14px] leading-6", settings.scheme === "dark" ? "text-slate-400" : "text-slate-500")}>
                Create a new QR code for a restaurant table or dining area.
              </p>
            </div>

            <button
              type="button"
              onClick={requestClose}
              className={cn(getManagerIconButtonClasses(settings.scheme, true), "rounded-[14px]")}
              aria-label="Close generate QR modal"
            >
              <XIcon className="size-4" />
            </button>
          </div>

          <div className={getManagerModalBodyClasses(settings.scheme)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2.5">
                <label
                  htmlFor="table-number"
                  className={getManagerEyebrowClasses(settings.scheme)}
                >
                  Table Number
                </label>
                <input
                  ref={firstInputRef}
                  id="table-number"
                  list={tableNumberListId}
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
                <datalist id={tableNumberListId}>
                  {tableNumberSuggestions.map((tableNumber) => (
                    <option key={tableNumber} value={tableNumber} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-2.5">
                <label
                  htmlFor="section"
                  className={getManagerEyebrowClasses(settings.scheme)}
                >
                  Section
                </label>
                <input
                  id="section"
<<<<<<< HEAD
=======
                  list={sectionListId}
>>>>>>> Dulnith
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
<<<<<<< HEAD
=======
                <datalist id={sectionListId}>
                  {sectionSuggestions.map((section) => (
                    <option key={section} value={section} />
                  ))}
                </datalist>
>>>>>>> Dulnith
              </div>
            </div>
          </div>

          <div className={getManagerModalFooterClasses(settings.scheme)}>
            {displayErrorMessage ? (
              <div className="text-sm font-medium text-rose-300 sm:mr-auto">
                {displayErrorMessage}
              </div>
            ) : null}

            <button
              type="button"
              onClick={requestClose}
              className={cn(getManagerSecondaryButtonClasses(settings.scheme), "h-11 rounded-[14px] px-5 text-[14px]")}
            >
              Cancel
            </button>

            <button
              type="submit"
              className={cn(getManagerPrimaryButtonClasses(settings.scheme), "h-11 rounded-[14px] px-5 text-[14px]")}
            >
              Generate QR Code
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
