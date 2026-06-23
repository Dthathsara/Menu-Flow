"use client";

import { useCallback, useEffect, useRef } from "react";
import type { MenuItem, ServingSize } from "@/types/customer";
import { formatPrice } from "@/components/customer/customerUtils";

interface OrderConfirmModalProps {
  item?: MenuItem | null;
  serving?: ServingSize | null;
  price?: number | string | null;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function OrderConfirmModal({
  item,
  serving,
  price,
  isOpen,
  onCancel,
  onConfirm,
}: OrderConfirmModalProps) {
  const confirmButtonRef = useRef<HTMLButtonElement | null>(null);
  const isConfirmingRef = useRef(false);

  const handleConfirm = useCallback(() => {
    if (isConfirmingRef.current) {
      return;
    }

    isConfirmingRef.current = true;
    onConfirm();
  }, [onConfirm]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    isConfirmingRef.current = false;
    confirmButtonRef.current?.focus();
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
    itemName && serving
      ? `Add ${itemName} (${serving}) to your order?`
      : "Add this item to your order?";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(73,48,37,0.42)] px-4 py-6 backdrop-blur-[2px]"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-confirm-title"
        className="w-full max-w-sm rounded-[2rem] border border-[#ddcfc0] bg-[#fffaf4] p-5 text-[#7a2a24] shadow-[0_30px_70px_rgba(77,45,34,0.24)]"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[#3d9238]">
          Order
        </p>
        <h2
          id="order-confirm-title"
          className="mt-2 text-2xl font-black leading-7"
        >
          Confirm Order Item
        </h2>
        <p className="mt-4 text-base leading-7 text-[#6e5447]">{message}</p>
        <div className="mt-4 rounded-[1.2rem] bg-[#f6efe5] px-4 py-3">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#9d8172]">
            Price
          </div>
          <div className="mt-1 text-2xl font-black text-[#2b8a38]">
            {formatPrice(price)}
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-[1rem] border border-[#d8cab8] bg-white px-4 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#7a2a24] transition hover:bg-[#fffdfa]"
          >
            Cancel
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            onClick={handleConfirm}
            className="rounded-[1rem] bg-[#218a31] px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#176f25]"
          >
            Add to Order
          </button>
        </div>
      </div>
    </div>
  );
}
