"use client";

import { useRef, useState } from "react";
import { CheckIcon, ChevronDownIcon } from "../icons";
import {
  cn,
  getFocusRingClasses,
  getManagerControlShellClasses,
  getMutedTextClasses,
  getPopoverClasses,
} from "../managerUtils";
import { useOnClickOutside } from "../useOnClickOutside";
import type { Scheme } from "../managerTypes";

export interface CategorySelectOption {
  value: string;
  label: string;
}

interface CategorySelectProps {
  value: string;
  options: readonly (string | CategorySelectOption)[];
  scheme: Scheme;
  label?: string;
  onChange: (value: string) => void;
}

function normalizeOption(option: string | CategorySelectOption): CategorySelectOption {
  return typeof option === "string" ? { value: option, label: option } : option;
}

export function CategorySelect({
  value,
  options,
  scheme,
  label = "Category",
  onChange,
}: CategorySelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const normalizedOptions = options.map(normalizeOption);
  const selectedOption = normalizedOptions.find((option) => option.value === value);

  useOnClickOutside(rootRef, () => setOpen(false), open);

  return (
    <div className="relative z-20 min-w-[190px]" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "w-full justify-between font-medium",
          getManagerControlShellClasses(scheme),
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">{selectedOption?.label ?? value}</span>
        <ChevronDownIcon className={cn("size-4 transition", open && "rotate-180")} />
      </button>

      {open ? (
        <div
          className={cn(
            "absolute left-0 top-full z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-[18px] border p-2",
            getPopoverClasses(scheme),
          )}
          role="listbox"
        >
          <div className={cn("px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-[0.22em]", getMutedTextClasses(scheme))}>
            {label}
          </div>

          <div className="space-y-1">
            {normalizedOptions.map((option) => {
              const selected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3.5 py-3 text-left text-[15px] transition-all duration-200 ease-out",
                    selected
                      ? scheme === "dark"
                        ? "bg-blue-500/16 text-blue-200"
                        : "bg-blue-50 text-blue-700"
                      : scheme === "dark"
                        ? "text-slate-200 hover:bg-white/8 hover:text-white"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900",
                    getFocusRingClasses(scheme),
                  )}
                >
                  <span>{option.label}</span>
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
