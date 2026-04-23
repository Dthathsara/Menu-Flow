"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CheckIcon, ChevronDownIcon } from "../icons";
import { useOnClickOutside } from "../useOnClickOutside";
import {
  cn,
  getManagerControlShellClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";

export interface FilterDropdownOption<T extends string> {
  label: string;
  value: T;
}

interface FilterDropdownProps<T extends string> {
  label: string;
  options: readonly FilterDropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  placeholder?: string;
  settings: ManagerSettings;
}

export function FilterDropdown<T extends string>({
  label,
  options,
  value,
  onChange,
  placeholder,
  settings,
}: FilterDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const listboxId = useId();
  const triggerId = useId();
  const isDark = settings.scheme === "dark";

  const selectedOption =
    options.find((option) => option.value === value) ?? null;

  const selectedIndex = useMemo(
    () => options.findIndex((option) => option.value === value),
    [options, value],
  );
  const defaultOpenIndex = selectedIndex >= 0 ? selectedIndex : 0;

  useOnClickOutside(containerRef, () => setOpen(false), open);

  useEffect(() => {
    if (!open || activeIndex < 0) {
      return;
    }

    optionRefs.current[activeIndex]?.focus();
  }, [activeIndex, open]);

  function closeDropdown({ focusTrigger = false }: { focusTrigger?: boolean } = {}) {
    setOpen(false);

    if (focusTrigger) {
      window.requestAnimationFrame(() => {
        triggerRef.current?.focus();
      });
    }
  }

  function handleSelect(nextValue: T) {
    onChange(nextValue);
    closeDropdown({ focusTrigger: true });
  }

  function openDropdown() {
    setActiveIndex(defaultOpenIndex);
    setOpen(true);
  }

  function handleTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      openDropdown();
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open) {
        closeDropdown();
        return;
      }

      openDropdown();
    }
  }

  function handleOptionKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
    optionValue: T,
  ) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index + 1) % options.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index - 1 + options.length) % options.length);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(options.length - 1);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeDropdown({ focusTrigger: true });
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSelect(optionValue);
    }
  }

  return (
    <div ref={containerRef} className="relative min-w-0">
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={label}
        onClick={() => {
          if (open) {
            closeDropdown();
            return;
          }

          openDropdown();
        }}
        onKeyDown={handleTriggerKeyDown}
        className={cn(
          "w-full justify-between text-left font-medium",
          getManagerControlShellClasses(settings.scheme),
          isDark
            ? "border-[#1f2a44] bg-[#0B1A2B] text-white hover:border-blue-500/70 hover:bg-[#102032]"
            : "text-slate-700",
        )}
      >
        <span className="min-w-0 truncate">
          {selectedOption?.label ?? placeholder ?? label}
        </span>
        <ChevronDownIcon
          className={cn(
            "size-4 shrink-0 transition-transform duration-200 ease-out",
            isDark ? "text-slate-300" : "text-slate-500",
            open && "rotate-180",
          )}
        />
      </button>

      <div
        className={cn(
          "absolute left-0 right-0 top-full z-50 mt-2 origin-top rounded-lg transition-all duration-150 ease-out",
          open
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-1 scale-[0.98] opacity-0",
        )}
      >
        <div
          id={listboxId}
          role="listbox"
          aria-labelledby={triggerId}
          className={cn(
            "overflow-hidden rounded-[18px] border shadow-lg",
            isDark
              ? "border-[#1f2a44] bg-[#0B1A2B] shadow-[0_24px_52px_rgba(2,6,23,0.42)]"
              : "border-slate-200 bg-white shadow-[0_20px_40px_rgba(15,23,42,0.12)]",
          )}
        >
          <div className="max-h-64 overflow-y-auto p-1.5">
            {options.map((option, index) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  ref={(element) => {
                    optionRefs.current[index] = element;
                  }}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={open ? 0 : -1}
                  onClick={() => handleSelect(option.value)}
                  onKeyDown={(event) => handleOptionKeyDown(event, index, option.value)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-lg px-3.5 py-3 text-[15px] transition-colors duration-150 ease-out",
                    isDark
                      ? "text-white hover:bg-[#13243a] focus:bg-[#13243a]"
                      : "text-slate-700 hover:bg-slate-100 focus:bg-slate-100",
                    isSelected &&
                      (isDark
                        ? "bg-blue-600 text-white"
                        : "bg-blue-50 text-blue-700"),
                    !isSelected &&
                      activeIndex === index &&
                      (isDark ? "bg-[#13243a]" : "bg-slate-100"),
                    "focus:outline-none",
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  <CheckIcon
                    className={cn(
                      "size-4 shrink-0 transition-opacity duration-150",
                      isSelected ? "opacity-100" : "opacity-0",
                    )}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
