"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MenuItem, ServingSize } from "@/types/customer";
import {
  CUSTOMER_PLACEHOLDER_IMAGE,
  formatPrice,
  getImageSrc,
} from "@/components/customer/customerUtils";

interface ItemDetailsModalProps {
  item: MenuItem | null;
  itemsInSection: MenuItem[];
  isOpen: boolean;
  initialServing?: ServingSize;
  initialQuantity?: number;
  submitLabel?: string;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onAddToOrder: (item: MenuItem, serving: ServingSize, quantity: number) => void;
}

const servingOptions: ServingSize[] = ["Small", "Medium", "Large"];

export function ItemDetailsModal({
  item,
  itemsInSection,
  isOpen,
  initialServing = "Medium",
  initialQuantity = 1,
  submitLabel = "Add To Order",
  onClose,
  onNext,
  onPrevious,
  onAddToOrder,
}: ItemDetailsModalProps) {
  const previousFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previousFocusedElementRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previousFocusedElementRef.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen || !item) {
    return null;
  }

  return (
    <ModalContent
      key={item.id}
      item={item}
      itemsInSection={itemsInSection}
      initialServing={initialServing}
      initialQuantity={initialQuantity}
      submitLabel={submitLabel}
      onClose={onClose}
      onNext={onNext}
      onPrevious={onPrevious}
      onAddToOrder={onAddToOrder}
    />
  );
}

interface ModalContentProps {
  item: MenuItem;
  itemsInSection: MenuItem[];
  initialServing: ServingSize;
  initialQuantity: number;
  submitLabel: string;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onAddToOrder: (item: MenuItem, serving: ServingSize, quantity: number) => void;
}

function ModalContent({
  item,
  itemsInSection,
  initialServing,
  initialQuantity,
  submitLabel,
  onClose,
  onNext,
  onPrevious,
  onAddToOrder,
}: ModalContentProps) {
  const [selectedServing, setSelectedServing] =
    useState<ServingSize>(initialServing);
  const [quantityInput, setQuantityInput] = useState(String(initialQuantity));
  const isSubmittingRef = useRef(false);

  const parsedQuantity = Number.parseInt(quantityInput, 10);
  const quantity =
    Number.isNaN(parsedQuantity) || parsedQuantity < 1 ? 1 : parsedQuantity;
  const currentPrice = item.servingPrices[selectedServing] ?? 0;
  const hasMultipleItems = itemsInSection.length > 1;
  const imageSrc = getImageSrc(item.image);

  const submitCurrentSelection = useCallback(() => {
    if (isSubmittingRef.current) {
      return;
    }

    isSubmittingRef.current = true;
    onAddToOrder(item, selectedServing, quantity);
    window.setTimeout(() => {
      isSubmittingRef.current = false;
    }, 300);
  }, [item, onAddToOrder, quantity, selectedServing]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Enter") {
        if (
          event.target instanceof HTMLButtonElement &&
          event.target.type !== "submit"
        ) {
          return;
        }

        event.preventDefault();
        submitCurrentSelection();
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, submitCurrentSelection]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitCurrentSelection();
  }

  function handleKeyDownCapture(event: React.KeyboardEvent<HTMLFormElement>) {
    const eventTarget = event.target;
    const isTextInputTarget =
      eventTarget instanceof HTMLElement &&
      (eventTarget.tagName === "INPUT" ||
        eventTarget.tagName === "TEXTAREA" ||
        eventTarget.tagName === "SELECT" ||
        eventTarget.isContentEditable);

    if (event.key === "ArrowRight" && !isTextInputTarget && hasMultipleItems) {
      event.preventDefault();
      onNext();
      return;
    }

    if (event.key === "ArrowLeft" && !isTextInputTarget && hasMultipleItems) {
      event.preventDefault();
      onPrevious();
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(73,48,37,0.42)] px-4 py-6 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-item-dialog-title"
        className="relative w-full max-w-md rounded-[2rem] border border-[#ddcfc0] bg-[#fffaf4] p-4 shadow-[0_30px_70px_rgba(77,45,34,0.24)] sm:p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <form onSubmit={handleSubmit} onKeyDownCapture={handleKeyDownCapture}>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-[#fffbf7] text-xl font-black text-[#eb3a33] shadow-[0_10px_24px_rgba(164,58,48,0.16)] transition hover:scale-105"
            aria-label="Close item details"
          >
            ×
          </button>

          <h2
            id="customer-item-dialog-title"
            className="pr-12 text-2xl font-black leading-7 text-[#7a2a24]"
          >
            {item.name}
          </h2>

          <div className="mt-4 grid grid-cols-[auto_1fr_auto] items-center gap-3">
            <button
              type="button"
              onClick={onPrevious}
              disabled={!hasMultipleItems}
              className="grid h-10 w-10 place-items-center rounded-full border border-[#ded3c6] bg-white text-2xl text-[#b1998c] transition enabled:hover:border-[#cdb9ac] enabled:hover:text-[#7a2a24] disabled:opacity-40"
              aria-label="Show previous item"
            >
              ‹
            </button>
            <div className="relative h-64 overflow-hidden rounded-[1.4rem] border border-[#eadfce] bg-[#f7f0e5]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageSrc}
                alt={item.name}
                className="h-full w-full object-contain"
                onError={(event) => {
                  if (event.currentTarget.src.endsWith(CUSTOMER_PLACEHOLDER_IMAGE)) {
                    return;
                  }

                  event.currentTarget.src = CUSTOMER_PLACEHOLDER_IMAGE;
                }}
              />
            </div>
            <button
              type="button"
              onClick={onNext}
              disabled={!hasMultipleItems}
              className="grid h-10 w-10 place-items-center rounded-full border border-[#ded3c6] bg-white text-2xl text-[#b1998c] transition enabled:hover:border-[#cdb9ac] enabled:hover:text-[#7a2a24] disabled:opacity-40"
              aria-label="Show next item"
            >
              ›
            </button>
          </div>

          <p className="mt-4 text-base leading-7 text-[#6e5447]">
            {item.description}
          </p>
          <p className="mt-2 text-sm font-semibold text-[#7a6050]">
            Preparation time: {item.prepTime} min
          </p>

          <div className="mt-5 rounded-[1.4rem] bg-[#f6efe5] p-4">
            <div className="text-sm font-semibold text-[#7a2a24]">
              Select Serving
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {servingOptions.map((serving) => {
                const isActive = serving === selectedServing;

                return (
                  <button
                    key={serving}
                    type="button"
                    onClick={() => setSelectedServing(serving)}
                    className={`rounded-[1rem] border px-3 py-2 text-sm font-semibold transition ${
                      isActive
                        ? "border-[#1c8a2c] bg-[#1c8a2c] text-white"
                        : "border-[#ddcfc0] bg-white text-[#7a2a24] hover:border-[#c5b29e]"
                    }`}
                  >
                    <span>{serving}</span>
                    <span className="block text-[0.68rem] font-bold">
                      {formatPrice(item.servingPrices[serving] ?? 0)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-[1fr_auto] items-end gap-4">
            <label className="block">
              <span className="text-sm font-semibold text-[#7a2a24]">Qty</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={quantityInput}
                onChange={(event) => {
                  const nextValue = event.target.value.replace(/[^\d]/g, "");
                  setQuantityInput(nextValue);
                }}
                onBlur={() => setQuantityInput(String(quantity))}
                className="mt-2 h-12 w-full rounded-[1rem] border border-[#ddcfc0] bg-white px-4 text-lg font-semibold text-[#7a2a24] outline-none transition focus:border-[#1c8a2c]"
              />
            </label>

            <div className="min-w-[9rem] text-right">
              <div className="text-sm uppercase tracking-[0.18em] text-[#9d8172]">
                Price
              </div>
              <div className="mt-1 text-3xl font-black text-[#c33b2d]">
                {formatPrice(currentPrice)}
              </div>
              <div className="mt-1 text-sm text-[#6e5447]">
                Subtotal {formatPrice(currentPrice * quantity)}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="mt-5 w-full rounded-[1.1rem] bg-[#218a31] px-4 py-4 text-sm font-black uppercase tracking-[0.18em] text-white transition duration-200 hover:bg-[#176f25]"
          >
            {submitLabel}
          </button>
        </form>
      </div>
    </div>
  );
}
