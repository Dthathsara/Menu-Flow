"use client";

import { useRef, useState } from "react";
import { CheckIcon, ChevronDownIcon } from "../icons";
import { cn, getFocusRingClasses, getMutedTextClasses, getPopoverClasses } from "../managerUtils";
import { useOnClickOutside } from "../useOnClickOutside";
import type { Scheme } from "../managerTypes";
import type { MenuFilterCategory } from "./types";

interface CategorySelectProps {
  value: MenuFilterCategory;
  options: readonly MenuFilterCategory[];
  scheme: Scheme;
  onChange: (value: MenuFilterCategory) => void;
}

export function CategorySelect({
  value,
  options,
  scheme,
  onChange,
}: CategorySelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useOnClickOutside(rootRef, () => setOpen(false), open);

  return (
    <div className="relative z-20 min-w-[190px]" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "inline-flex h-11 w-full items-center justify-between gap-3 rounded-md border px-3 text-sm font-medium transition-all duration-200 ease-out",
          scheme === "dark"
            ? "border-white/10 bg-slate-950/40 text-slate-100 hover:border-white/16 hover:bg-slate-950/56"
            : "border-slate-200 bg-slate-50/90 text-slate-700 hover:border-slate-300 hover:bg-white",
          "hover:-translate-y-0.5",
          getFocusRingClasses(scheme),
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">{value}</span>
        <ChevronDownIcon className={cn("size-4 transition", open && "rotate-180")} />
      </button>

      {open ? (
        <div
          className={cn(
            "absolute left-0 top-full z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-md border p-2",
            getPopoverClasses(scheme),
          )}
          role="listbox"
        >
          <div className={cn("px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-[0.22em]", getMutedTextClasses(scheme))}>
            Category
          </div>

          <div className="space-y-1">
            {options.map((option) => {
              const selected = option === value;

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm transition-all duration-200 ease-out",
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
                  <span>{option}</span>
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
