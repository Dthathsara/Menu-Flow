"use client";

import { useEffect, useState } from "react";
import { ClockIcon, XIcon } from "../icons";
import {
  cn,
  getManagerBodyTextClasses,
  getManagerIconButtonClasses,
  getManagerLabelClasses,
  getManagerModalBodyClasses,
  getManagerModalFooterClasses,
  getManagerModalHeaderClasses,
  getManagerModalSurfaceClasses,
  getManagerModalTitleClasses,
  getManagerPanelShellClasses,
  getManagerPrimaryButtonClasses,
  getManagerSecondaryButtonClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import { ImageUploadField } from "./ImageUploadField";
import type { MenuCategory, MenuItemFormValues, MenuItemRecord } from "./types";

interface MenuItemModalProps {
  mode: "add" | "edit";
  settings: ManagerSettings;
  categories: readonly MenuCategory[];
  item?: MenuItemRecord | null;
  onClose: () => void;
  onSave: (values: MenuItemFormValues) => void;
}

function createEmptyValues(category: MenuCategory): MenuItemFormValues {
  return {
    name: "",
    category,
    description: "",
    smallPrice: "",
    mediumPrice: "",
    largePrice: "",
    image: "",
    available: true,
    prepTime: "12",
    sku: "",
  };
}

function createFormValues(item: MenuItemRecord | null | undefined, fallbackCategory: MenuCategory) {
  if (!item) {
    return createEmptyValues(fallbackCategory);
  }

  return {
    name: item.name,
    category: item.category,
    description: item.description,
    smallPrice: String(item.prices.small),
    mediumPrice: String(item.prices.medium),
    largePrice: String(item.prices.large),
    image: item.image,
    available: item.available,
    prepTime: String(item.prepTime),
    sku: item.sku,
  } satisfies MenuItemFormValues;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Unable to read file."));
    reader.readAsDataURL(file);
  });
}

export function MenuItemModal({
  mode,
  settings,
  categories,
  item,
  onClose,
  onSave,
}: MenuItemModalProps) {
  const [values, setValues] = useState<MenuItemFormValues>(() =>
    createFormValues(item, categories[0]),
  );
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const isDark = settings.scheme === "dark";
  const modalFocusClasses =
    isDark
      ? "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#061533]"
      : "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8FAFC]";

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const inputClasses = cn(
    "box-border h-11 w-full min-w-0 max-w-full appearance-none rounded-lg border px-4 text-[15px] outline-none transition-all duration-200 ease-out",
    isDark
      ? "border-white/10 bg-[#0B1A3A] text-white placeholder:text-slate-400 hover:border-white/20 focus:border-blue-400"
      : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500",
    modalFocusClasses,
  );

  const textAreaClasses = cn(
    "box-border min-h-[120px] w-full min-w-0 max-w-full rounded-lg border px-4 py-3.5 text-[15px] outline-none transition-all duration-200 ease-out",
    isDark
      ? "border-white/10 bg-[#0B1A3A] text-white placeholder:text-slate-400 hover:border-white/20 focus:border-blue-400"
      : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500",
    modalFocusClasses,
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextImage = pendingFile ? await readFileAsDataUrl(pendingFile) : values.image;

    onSave({
      ...values,
      image: nextImage,
    });
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={cn("max-w-4xl", getManagerModalSurfaceClasses(settings.scheme))}
        role="dialog"
        aria-modal="true"
        aria-labelledby="menu-item-modal-title"
      >
        <form onSubmit={handleSubmit} className="flex max-h-[calc(100vh-2rem)] flex-col">
          <div className={getManagerModalHeaderClasses(settings.scheme)}>
            <div>
              <h3
                id="menu-item-modal-title"
                className={cn(getManagerModalTitleClasses(), isDark ? "text-white" : "text-slate-900")}
              >
                {mode === "add" ? "Add Menu Item" : "Edit Menu Item"}
              </h3>
              <p className={cn("mt-1", getManagerBodyTextClasses(settings.scheme))}>
                Configure pricing, imagery, and availability for this menu item.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={cn(getManagerIconButtonClasses(settings.scheme, true), modalFocusClasses)}
              aria-label="Close menu item modal"
            >
              <XIcon className="size-4" />
            </button>
          </div>

          <div className={getManagerModalBodyClasses(settings.scheme)}>
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
              <div className="space-y-5">
                <div
                  className={cn(
                    "p-5",
                    getManagerPanelShellClasses(settings.scheme),
                    isDark ? "border-white/10 bg-[#0B1A3A]" : "border-slate-200 bg-white",
                  )}
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="min-w-0 space-y-2 sm:col-span-2">
                      <label htmlFor="menu-item-name" className={getManagerLabelClasses(settings.scheme)}>
                        Food Name
                      </label>
                      <input
                        id="menu-item-name"
                        value={values.name}
                        onChange={(event) =>
                          setValues((current) => ({ ...current, name: event.target.value }))
                        }
                        placeholder="Enter menu item name"
                        className={inputClasses}
                        required
                      />
                    </div>

                    <div className="min-w-0 space-y-2">
                      <label htmlFor="menu-item-category" className={getManagerLabelClasses(settings.scheme)}>
                        Category
                      </label>
                      <select
                        id="menu-item-category"
                        value={values.category}
                        onChange={(event) =>
                          setValues((current) => ({
                            ...current,
                            category: event.target.value as MenuCategory,
                          }))
                        }
                        className={inputClasses}
                      >
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="min-w-0 space-y-2 sm:col-span-2">
                      <label htmlFor="menu-item-description" className={getManagerLabelClasses(settings.scheme)}>
                        Description
                      </label>
                      <textarea
                        id="menu-item-description"
                        value={values.description}
                        onChange={(event) =>
                          setValues((current) => ({
                            ...current,
                            description: event.target.value,
                          }))
                        }
                        placeholder="Write a short, customer-facing description."
                        className={textAreaClasses}
                        required
                      />
                    </div>

                    <div className="min-w-0 space-y-2">
                      <label htmlFor="menu-item-price-small" className={getManagerLabelClasses(settings.scheme)}>
                        Small Price
                      </label>
                      <input
                        id="menu-item-price-small"
                        type="number"
                        min="0"
                        step="0.01"
                        value={values.smallPrice}
                        onChange={(event) =>
                          setValues((current) => ({
                            ...current,
                            smallPrice: event.target.value,
                          }))
                        }
                        placeholder="0.00"
                        className={inputClasses}
                        required
                      />
                    </div>

                    <div className="min-w-0 space-y-2">
                      <label htmlFor="menu-item-price-medium" className={getManagerLabelClasses(settings.scheme)}>
                        Medium Price
                      </label>
                      <input
                        id="menu-item-price-medium"
                        type="number"
                        min="0"
                        step="0.01"
                        value={values.mediumPrice}
                        onChange={(event) =>
                          setValues((current) => ({
                            ...current,
                            mediumPrice: event.target.value,
                          }))
                        }
                        placeholder="0.00"
                        className={inputClasses}
                        required
                      />
                    </div>

                    <div className="min-w-0 space-y-2">
                      <label htmlFor="menu-item-price-large" className={getManagerLabelClasses(settings.scheme)}>
                        Large Price
                      </label>
                      <input
                        id="menu-item-price-large"
                        type="number"
                        min="0"
                        step="0.01"
                        value={values.largePrice}
                        onChange={(event) =>
                          setValues((current) => ({
                            ...current,
                            largePrice: event.target.value,
                          }))
                        }
                        placeholder="0.00"
                        className={inputClasses}
                        required
                      />
                    </div>

                    <div className="min-w-0 space-y-2">
                      <label htmlFor="menu-item-prep-time" className={getManagerLabelClasses(settings.scheme)}>
                        Preparation Time
                      </label>
                      <div className="relative w-full min-w-0">
                        <ClockIcon
                          className={cn(
                            "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2",
                            isDark ? "text-slate-300" : "text-slate-500",
                          )}
                        />
                        <input
                          id="menu-item-prep-time"
                          type="number"
                          min="1"
                          value={values.prepTime}
                          onChange={(event) =>
                            setValues((current) => ({
                              ...current,
                              prepTime: event.target.value,
                            }))
                          }
                          placeholder="12"
                          className={cn(inputClasses, "pl-10")}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <ImageUploadField
                  preview={values.image}
                  scheme={settings.scheme}
                  onChange={(file) => {
                    setPendingFile(file);
                    if (!file) {
                      return;
                    }

                    readFileAsDataUrl(file).then((dataUrl) => {
                      setValues((current) => ({ ...current, image: dataUrl }));
                    });
                  }}
                />

                <div
                  className={cn(
                    "p-5",
                    getManagerPanelShellClasses(settings.scheme),
                    isDark ? "border-white/10 bg-[#0B1A3A]" : "border-slate-200 bg-white",
                  )}
                >
                  <div className={cn("text-[15px] font-semibold", isDark ? "text-white" : "text-slate-900")}>Availability</div>
                  <p className={cn("mt-1", getManagerBodyTextClasses(settings.scheme))}>
                    Mark unavailable items so staff can keep them listed without allowing orders.
                  </p>

                  <div className="mt-4 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setValues((current) => ({ ...current, available: !current.available }))
                      }
                      className={cn(
                        "inline-flex h-8 w-14 items-center rounded-full border px-1 transition-all duration-200 ease-out",
                        values.available
                          ? "border-blue-600 bg-blue-600"
                          : isDark
                            ? "border-white/10 bg-white/10"
                            : "border-slate-300 bg-slate-300",
                        modalFocusClasses,
                      )}
                      aria-pressed={values.available}
                    >
                      <span
                        className={cn(
                          "size-6 rounded-full bg-white shadow-[0_8px_18px_rgba(15,23,42,0.18)] transition-all duration-200 ease-out",
                          values.available ? "translate-x-5" : "translate-x-0",
                        )}
                      />
                    </button>
                    <div>
                      <div className={cn("text-[15px] font-semibold", isDark ? "text-white" : "text-slate-900")}>
                        {values.available ? "Available" : "Unavailable"}
                      </div>
                      <div className={cn("text-xs", isDark ? "text-slate-300" : "text-slate-500")}>
                        Visible to the team in the current menu board.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={cn(getManagerModalFooterClasses(settings.scheme), "items-stretch sm:items-center")}>
            <button
              type="button"
              onClick={onClose}
              className={cn(getManagerSecondaryButtonClasses(settings.scheme), modalFocusClasses)}
            >
              Cancel
            </button>

            <button
              type="submit"
              className={cn(getManagerPrimaryButtonClasses(settings.scheme), modalFocusClasses)}
            >
              Save Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
