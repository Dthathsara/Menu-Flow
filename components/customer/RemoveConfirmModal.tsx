"use client";

import { useCallback, useEffect, useRef } from "react";
import type { CartItem } from "@/types/customer";

interface RemoveConfirmModalProps {
  item?: CartItem | null;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function RemoveConfirmModal({
  item,
  isOpen,
  onCancel,
  onConfirm,
}: RemoveConfirmModalProps) {
  const removeButtonRef = useRef<HTMLButtonElement | null>(null);
  const isRemovingRef = useRef(false);

  const handleConfirm = useCallback(() => {
    if (isRemovingRef.current) {
      return;
    }

    isRemovingRef.current = true;
    onConfirm();
  }, [onConfirm]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    isRemovingRef.current = false;
    removeButtonRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Enter") {
        event.preventDefault();
        handleConfirm();
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleConfirm, isOpen, onCancel]);

  if (!isOpen) {
    return null;
  }

  const itemName = item?.name?.trim();
  const message =
    itemName && item?.serving
      ? `Remove ${itemName} (${item.serving}) from your order?`
      : "Remove this item from your order?";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(73,48,37,0.42)] px-4 py-6 backdrop-blur-[2px]"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="remove-confirm-title"
        className="w-full max-w-sm rounded-[2rem] border border-[#ddcfc0] bg-[#fffaf4] p-5 text-[#7a2a24] shadow-[0_30px_70px_rgba(77,45,34,0.24)]"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[#b03a34]">
          Order
        </p>
        <h2
          id="remove-confirm-title"
          className="mt-2 text-2xl font-black leading-7"
        >
          Remove Order Item
        </h2>
        <p className="mt-4 text-base leading-7 text-[#6e5447]">{message}</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-[1rem] border border-[#d8cab8] bg-white px-4 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#7a2a24] transition hover:bg-[#fffdfa]"
          >
            Cancel
          </button>
          <button
            ref={removeButtonRef}
            type="button"
            onClick={handleConfirm}
            className="rounded-[1rem] bg-[#7a2a24] px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#5f211d]"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
