"use client";

import { createPortal } from "react-dom";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CheckIcon, ChevronDownIcon } from "../icons";
import {
  cn,
  getManagerControlShellClasses,
  getPopoverClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import type { SettingsSelectOption } from "./settings.types";

interface MenuPosition {
  left: number;
  top: number;
  width: number;
}

interface SettingsSelectProps<T extends string> {
  label: string;
  options: readonly SettingsSelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  settings: ManagerSettings;
}

export function SettingsSelect<T extends string>({
  label,
  options,
  value,
  onChange,
  settings,
}: SettingsSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const triggerId = useId();
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const selectedIndex = useMemo(
    () => options.findIndex((option) => option.value === value),
    [options, value],
  );
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : options[0] ?? null;

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (containerRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }

      setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open || activeIndex < 0) {
      return;
    }

    optionRefs.current[activeIndex]?.focus();
  }, [activeIndex, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function updatePosition() {
      const trigger = triggerRef.current;

      if (!trigger) {
        return;
      }

      const rect = trigger.getBoundingClientRect();
      const estimatedMenuHeight = Math.min(options.length * 48 + 16, 280);
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom - 24;
      const openUpward = spaceBelow < estimatedMenuHeight && rect.top > estimatedMenuHeight + 24;
      const top = openUpward ? Math.max(16, rect.top - estimatedMenuHeight - 8) : rect.bottom + 8;

      setMenuPosition({
        left: Math.max(16, rect.left),
        top,
        width: rect.width,
      });
    }

    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, options.length]);

  function closeDropdown(focusTrigger = false) {
    setOpen(false);

    if (focusTrigger) {
      window.requestAnimationFrame(() => {
        triggerRef.current?.focus();
      });
    }
  }

  function openDropdown() {
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
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
        closeDropdown(true);
      } else {
        openDropdown();
      }
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
      closeDropdown(true);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onChange(optionValue);
      closeDropdown(true);
    }
  }

  return (
    <>
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
            getManagerControlShellClasses(settings.scheme),
            "h-10 w-full justify-between rounded-[14px] px-4 text-left text-[15px] font-medium",
            settings.scheme === "dark" ? "bg-slate-950/48" : "bg-white",
          )}
        >
          <span className="min-w-0 truncate">{selectedOption?.label ?? label}</span>
          <ChevronDownIcon
            className={cn(
              "size-4 shrink-0 transition-transform duration-200 ease-out",
              settings.scheme === "dark" ? "text-slate-300" : "text-slate-500",
              open && "rotate-180",
            )}
          />
        </button>
      </div>

      {open && menuPosition
        ? createPortal(
            <div
              ref={menuRef}
              className="fixed z-[150] origin-top"
              style={{
                left: menuPosition.left,
                top: menuPosition.top,
                width: menuPosition.width,
              }}
            >
              <div
                id={listboxId}
                role="listbox"
                aria-labelledby={triggerId}
                className={cn(
                  "max-h-[280px] overflow-y-auto rounded-[18px] border p-1.5",
                  getPopoverClasses(settings.scheme),
                )}
              >
                {options.map((option, index) => {
                  const selected = option.value === value;

                  return (
                    <button
                      key={option.value}
                      ref={(element) => {
                        optionRefs.current[index] = element;
                      }}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => {
                        onChange(option.value);
                        closeDropdown(true);
                      }}
                      onMouseEnter={() => setActiveIndex(index)}
                      onKeyDown={(event) => handleOptionKeyDown(event, index, option.value)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-[12px] px-3.5 py-3 text-left text-[15px] transition-all duration-150 ease-out",
                        "hover:-translate-y-0.5 active:scale-[0.98] focus:outline-none",
                        selected
                          ? "bg-blue-500 text-white"
                          : settings.scheme === "dark"
                            ? "text-slate-100 hover:bg-white/[0.05] focus:bg-white/[0.05]"
                            : "text-slate-800 hover:bg-slate-100 focus:bg-slate-100",
                        !selected &&
                          activeIndex === index &&
                          (settings.scheme === "dark" ? "bg-white/[0.04]" : "bg-slate-100"),
                      )}
                    >
                      <span className="truncate">{option.label}</span>
                      <CheckIcon className={cn("size-4 shrink-0", selected ? "opacity-100" : "opacity-0")} />
                    </button>
                  );
                })}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
