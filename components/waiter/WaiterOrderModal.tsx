"use client";

import { createPortal } from "react-dom";
import { XIcon } from "@/components/manager/icons";
import { cn, getManagerIconButtonClasses, getManagerModalBodyClasses, getManagerModalFooterClasses, getManagerModalHeaderClasses, getManagerModalSurfaceClasses, getManagerModalTitleClasses, getManagerSecondaryButtonClasses, getMutedTextClasses } from "@/components/manager/managerUtils";
import type { ManagerSettings } from "@/components/manager/managerTypes";
import type { WaiterOrder } from "./types";
import { WaiterStatusBadge } from "./WaiterStatusBadge";

export function WaiterOrderModal({
  settings,
  order,
  onClose,
}: {
  settings: ManagerSettings;
  order: WaiterOrder | null;
  onClose: () => void;
}) {
  if (!order) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/65 px-5 py-8 backdrop-blur-md">
      <div className={cn("max-w-[680px]", getManagerModalSurfaceClasses(settings.scheme))} role="dialog" aria-modal="true">
        <div className={getManagerModalHeaderClasses(settings.scheme)}>
          <div>
            <h2 className={getManagerModalTitleClasses()}>{order.orderNumber}</h2>
            <p className={cn("mt-1 text-sm", getMutedTextClasses(settings.scheme))}>
              {order.table} · {order.customer} · {order.time}
            </p>
          </div>
          <button type="button" onClick={onClose} className={getManagerIconButtonClasses(settings.scheme, true)} aria-label="Close order">
            <XIcon className="size-4" />
          </button>
        </div>
        <div className={getManagerModalBodyClasses(settings.scheme)}>
          <div className="flex flex-wrap gap-2">
            <WaiterStatusBadge status={order.status} settings={settings} />
            <WaiterStatusBadge status={order.paymentStatus} settings={settings} />
          </div>
          <div className="mt-5 space-y-3">
            {order.items.map((item, index) => (
              <div key={`${item.name}-${index}`} className={cn("rounded-[14px] border px-4 py-3", settings.scheme === "dark" ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50")}>
                <div className="flex justify-between gap-3">
                  <span className="font-semibold">{item.name}</span>
                  <span>x{item.quantity}</span>
                </div>
                {item.note ? <p className={cn("mt-1 text-sm", getMutedTextClasses(settings.scheme))}>{item.note}</p> : null}
              </div>
            ))}
          </div>
          {order.notes ? <p className={cn("mt-5 text-sm", getMutedTextClasses(settings.scheme))}>Notes: {order.notes}</p> : null}
        </div>
        <div className={getManagerModalFooterClasses(settings.scheme)}>
          <button type="button" onClick={onClose} className={getManagerSecondaryButtonClasses(settings.scheme)}>
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
