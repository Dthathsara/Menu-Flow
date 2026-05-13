"use client";

import { useRef } from "react";
import { CheckIcon, ChevronDownIcon, GlobeIcon } from "./icons";
import { cn, getFocusRingClasses, getMutedTextClasses, getPopoverClasses } from "./managerUtils";
import { useOnClickOutside } from "./useOnClickOutside";
import type { LanguageOption, Scheme } from "./managerTypes";

interface LanguageDropdownProps {
  open: boolean;
  scheme: Scheme;
  selectedLanguage: LanguageOption;
  languages: LanguageOption[];
  triggerClassName: string;
  onToggle: () => void;
  onClose: () => void;
  onSelect: (language: LanguageOption) => void;
}

export function LanguageDropdown({
  open,
  scheme,
  selectedLanguage,
  languages,
  triggerClassName,
  onToggle,
  onClose,
  onSelect,
}: LanguageDropdownProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useOnClickOutside(rootRef, onClose, open);

  return (
    <div className="relative z-20 shrink-0 overflow-visible" ref={rootRef}>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "inline-flex h-11 items-center gap-2 rounded-lg border px-3 text-sm font-semibold",
          triggerClassName,
          getFocusRingClasses(scheme),
        )}
      >
        <GlobeIcon className="size-4" />
        <span className="hidden lg:inline">{selectedLanguage.label}</span>
        <ChevronDownIcon
          className={cn("size-4 transition", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div
          className={cn(
            "absolute left-0 right-auto top-full z-50 mt-2 w-56 max-w-[calc(100vw-1rem)] rounded-lg border p-2 sm:left-auto sm:right-0",
            getPopoverClasses(scheme),
          )}
        >
          <div className={cn("px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-[0.22em]", getMutedTextClasses(scheme))}>
            Language
          </div>

          <div className="space-y-1">
            {languages.map((language) => {
              const selected = language.code === selectedLanguage.code;

              return (
                <button
                  key={language.code}
                  type="button"
                  onClick={() => onSelect(language)}
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2.5 text-left text-sm transition-all duration-200 ease-out",
                    selected
                      ? scheme === "dark"
                        ? "bg-blue-500/16 text-blue-200 hover:bg-blue-500/24"
                        : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                      : scheme === "dark"
                        ? "text-slate-200 hover:bg-white/8 hover:text-white"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900",
                    getFocusRingClasses(scheme),
                  )}
                >
                  <span>{language.label}</span>
                  {selected ? <CheckIcon className="size-4" /> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
