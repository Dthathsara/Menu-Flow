"use client";

import { useEffect } from "react";
import type { RefObject } from "react";

export function useOnClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  onClose: () => void,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }

      onClose();
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [enabled, onClose, ref]);
}
