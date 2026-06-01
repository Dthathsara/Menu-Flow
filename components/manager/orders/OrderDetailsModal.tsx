"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { XIcon } from "../icons";
import {
  cn,
  getManagerIconButtonClasses,
  getManagerModalBodyClasses,
  getManagerModalFooterClasses,
  getManagerModalHeaderClasses,
  getManagerModalSurfaceClasses,
  getManagerModalTitleClasses,
  getManagerSecondaryButtonClasses,
  getManagerSectionSubtitleClasses,
  getManagerSectionTitleClasses,
  getManagerTableHeaderClasses,
  getMutedTextClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import { SessionExpiredError } from "@/lib/auth-session";
import { fetchAdminOrder, updateAdminOrderStatus } from "@/lib/admin-orders-api";
import { EDITABLE_ORDER_STATUSES, formatStatusLabel, getOrderItemCount } from "./order-data";
import {
  DetailKeyValue,
  SecondaryPanel,
  StatusBadge,
  formatCurrency,
  formatDisplayDate,
  formatDisplayTime,
} from "./shared";
import type { OrderRecord, OrderStatus } from "./types";

interface OrderDetailsModalProps {
  open: boolean;
  order: OrderRecord | null;
  settings: ManagerSettings;
  onClose: () => void;
  onOrderUpdated: (order: OrderRecord) => void;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function OrderDetailsModal({
  open,
  order,
  settings,
  onClose,
  onOrderUpdated,
}: OrderDetailsModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [modalOrder, setModalOrder] = useState<OrderRecord | null>(order);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const closeTimeoutRef = useRef<number | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const closingRef = useRef(false);
  const titleId = useId();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const requestClose = useCallback(() => {
    if (closingRef.current) {
      return;
    }

    closingRef.current = true;
    setIsVisible(false);

    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
    }

    closeTimeoutRef.current = window.setTimeout(() => {
      closingRef.current = false;
      onClose();
    }, 180);
  }, [onClose]);

  useEffect(() => {
    setModalOrder(order);
    setErrorMessage("");
  }, [order]);

  useEffect(() => {
    if (!open || !order) {
      return;
    }

    let active = true;
    const orderId = order.id;
    const hasFallbackDetails = order.items.length > 0;

    async function loadDetails() {
      setIsLoadingDetails(true);

      try {
        const nextOrder = await fetchAdminOrder(orderId);

        if (active) {
          setModalOrder(nextOrder);
          setErrorMessage("");
        }
      } catch (error) {
        if (active) {
          setErrorMessage(
            hasFallbackDetails
              ? ""
              : error instanceof SessionExpiredError
                ? "Your session has expired. Please log in again."
                : "Unable to load order details. Please try again.",
          );
        }
      } finally {
        if (active) {
          setIsLoadingDetails(false);
        }
      }
    }

    void loadDetails();

    return () => {
      active = false;
    };
  }, [open, order]);

  useEffect(() => {
    if (!open || !order) {
      return;
    }

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    closingRef.current = false;

    const enterFrame = window.requestAnimationFrame(() => {
      setIsVisible(true);
      closeButtonRef.current?.focus();
    });

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        requestClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
        FOCUSABLE_SELECTOR,
      );

      if (!focusableElements?.length) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(enterFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;

      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }

      previousFocusRef.current?.focus();
    };
  }, [open, order, requestClose]);

  async function handleStatusChange(nextStatus: OrderStatus) {
    if (!modalOrder || nextStatus === modalOrder.order_status || isUpdatingStatus) {
      return;
    }

    setIsUpdatingStatus(true);
    setErrorMessage("");

    try {
      const nextOrder = await updateAdminOrderStatus(modalOrder.id, nextStatus);
      const mergedOrder = {
        ...modalOrder,
        ...nextOrder,
        items: nextOrder.items.length ? nextOrder.items : modalOrder.items,
      };

      setModalOrder(mergedOrder);
      onOrderUpdated(mergedOrder);
    } catch (error) {
      setErrorMessage(
        error instanceof SessionExpiredError
          ? "Your session has expired. Please log in again."
          : "Unable to update order status. Please try again.",
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  if (!isMounted || !open || !order || !modalOrder) {
    return null;
  }

  const totalItems = getOrderItemCount(modalOrder);

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-slate-950/70 px-4 py-6 backdrop-blur-sm transition-opacity duration-200",
        isVisible ? "opacity-100" : "opacity-0",
      )}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          requestClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          getManagerModalSurfaceClasses(settings.scheme),
          "flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden transition-all duration-200",
          isVisible ? "translate-y-0 scale-100 opacity-100" : "translate-y-3 scale-[0.98] opacity-0",
        )}
      >
        <div
          className={cn(
            getManagerModalHeaderClasses(settings.scheme),
            "sticky top-0 z-[10000] shrink-0",
          )}
        >
          <div className="min-w-0 pr-3">
            <p
              className={cn(
                "text-[11px] font-semibold uppercase tracking-[0.26em]",
                getMutedTextClasses(settings.scheme),
              )}
            >
              Order Details
            </p>
            <h3 id={titleId} className={cn("mt-2 truncate", getManagerModalTitleClasses())}>
              {modalOrder.order_number}
            </h3>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={requestClose}
            className={cn(
              getManagerIconButtonClasses(settings.scheme),
              "relative z-[10000] shrink-0",
            )}
            aria-label="Close order details"
          >
            <XIcon className="size-5" />
          </button>
        </div>

        <div className={cn(getManagerModalBodyClasses(settings.scheme), "min-h-0 flex-1 space-y-5 overflow-y-auto pb-8")}>
          {errorMessage ? (
            <p className="rounded-xl bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-500">
              {errorMessage}
            </p>
          ) : null}

          {isLoadingDetails ? (
            <p className={getManagerSectionSubtitleClasses(settings.scheme)}>
              Loading latest order details...
            </p>
          ) : null}

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.85fr)]">
            <div className="space-y-5">
              <SecondaryPanel settings={settings} className="p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className={getManagerSectionTitleClasses()}>General Details</div>
                    <div className={getManagerSectionSubtitleClasses(settings.scheme)}>
                      Real customer order record from the admin orders API.
                    </div>
                  </div>
                  <StatusBadge settings={settings} type="order" value={modalOrder.order_status} />
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <DetailKeyValue label="Order ID" value={modalOrder.order_number} settings={settings} />
                  <DetailKeyValue label="Table Number" value={modalOrder.table_id || "N/A"} settings={settings} />
                  <DetailKeyValue label="Customer Name" value={modalOrder.customer_name || "N/A"} settings={settings} />
                  <DetailKeyValue label="Customer Phone" value={modalOrder.customer_phone || "N/A"} settings={settings} />
                  <DetailKeyValue label="Order Date" value={formatDisplayDate(modalOrder.placed_at)} settings={settings} />
                  <DetailKeyValue label="Ordered Time" value={formatDisplayTime(modalOrder.placed_at)} settings={settings} />
                  <DetailKeyValue label="Order Type" value={modalOrder.order_type || "N/A"} settings={settings} />
                  <DetailKeyValue
                    label="Order Status"
                    value={<StatusBadge settings={settings} type="order" value={modalOrder.order_status} />}
                    settings={settings}
                  />
                  <DetailKeyValue
                    label="Payment Status"
                    value={<StatusBadge settings={settings} type="payment" value={modalOrder.payment_status} />}
                    settings={settings}
                  />
                  <DetailKeyValue
                    label="Customer Note"
                    value={modalOrder.item_note || "N/A"}
                    settings={settings}
                  />
                </div>
              </SecondaryPanel>

              <SecondaryPanel settings={settings} className="p-4 sm:p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className={getManagerSectionTitleClasses()}>Items</div>
                    <div className={getManagerSectionSubtitleClasses(settings.scheme)}>
                      {totalItems} item{totalItems === 1 ? "" : "s"} from database order_items.
                    </div>
                  </div>
                </div>

                <div className="mt-4 hidden overflow-x-auto md:block">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr
                        className={cn("border-b border-black/5", getManagerTableHeaderClasses(settings.scheme))}
                      >
                        <th className="py-3 pr-4">Item Name</th>
                        <th className="py-3 pr-4">Serving Size</th>
                        <th className="py-3 pr-4">Quantity</th>
                        <th className="py-3 pr-4">Unit Price</th>
                        <th className="py-3 pr-4">Line Total</th>
                        <th className="py-3 pr-4">Prep Time</th>
                        <th className="py-3 text-right">Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modalOrder.items.map((item, index) => (
                        <tr key={item.id || `${item.menu_item_id}-${index}`} className="border-b border-black/5 last:border-b-0">
                          <td className="py-3 pr-4 font-medium">{item.name}</td>
                          <td className="py-3 pr-4">{item.serving_size || "N/A"}</td>
                          <td className="py-3 pr-4">{item.quantity}</td>
                          <td className="py-3 pr-4">{formatCurrency(item.unit_price)}</td>
                          <td className="py-3 pr-4 font-semibold">{formatCurrency(item.line_total)}</td>
                          <td className="py-3 pr-4">{item.prep_time_min ? `${item.prep_time_min} min` : "N/A"}</td>
                          <td className="py-3 text-right">{item.note || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 grid gap-3 md:hidden">
                  {modalOrder.items.map((item, index) => (
                    <div
                      key={item.id || `${item.menu_item_id}-${index}`}
                      className={cn(
                        "rounded-[14px] border p-3",
                        settings.scheme === "dark"
                          ? "border-white/10 bg-white/5"
                          : "border-slate-200 bg-slate-50/85",
                      )}
                    >
                      <div className="font-medium">{item.name}</div>
                      <div className="mt-2 text-[15px]">
                        {item.serving_size || "N/A"} · Qty {item.quantity}
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-3 text-[15px]">
                        <span className={getMutedTextClasses(settings.scheme)}>
                          {formatCurrency(item.unit_price)}
                        </span>
                        <span className="font-semibold">
                          {formatCurrency(item.line_total)}
                        </span>
                      </div>
                      {item.note ? (
                        <div className={cn("mt-2 text-sm", getMutedTextClasses(settings.scheme))}>
                          {item.note}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </SecondaryPanel>
            </div>

            <div className="space-y-5">
              <SecondaryPanel settings={settings} className="p-4 sm:p-5">
                <div className={getManagerSectionTitleClasses()}>Billing Summary</div>
                <div className={getManagerSectionSubtitleClasses(settings.scheme)}>
                  Payment status is read-only and comes from the database.
                </div>

                <div className="mt-5 space-y-3">
                  <SummaryRow label="Subtotal" value={formatCurrency(modalOrder.subtotal)} />
                  <SummaryRow label="Tax Amount" value={formatCurrency(modalOrder.tax_amount)} />
                  <SummaryRow
                    label="Service Charges"
                    value={formatCurrency(modalOrder.service_charge_amount)}
                  />
                  {modalOrder.discount_amount > 0 ? (
                    <SummaryRow
                      label="Discount Amount"
                      value={`- ${formatCurrency(modalOrder.discount_amount)}`}
                    />
                  ) : null}
                  <div
                    className={cn(
                      "flex items-center justify-between rounded-[14px] border px-4 py-4",
                      settings.scheme === "dark"
                        ? "border-white/10 bg-[linear-gradient(135deg,rgba(59,130,246,0.12),rgba(59,130,246,0.04),transparent)]"
                        : "border-blue-100 bg-blue-50/70",
                    )}
                  >
                    <span className="text-[15px] font-semibold">Grand Total</span>
                    <span className="text-[1.2rem] font-bold">
                      {formatCurrency(modalOrder.total_amount)}
                    </span>
                  </div>
                </div>
              </SecondaryPanel>

              <SecondaryPanel settings={settings} className="p-4 sm:p-5">
                <div className={getManagerSectionTitleClasses()}>Update Order Status</div>
                <div className={getManagerSectionSubtitleClasses(settings.scheme)}>
                  Updates are sent to the backend status endpoint.
                </div>

                <label className="mt-5 block">
                  <span className="sr-only">Order status</span>
                  <select
                    value={modalOrder.order_status}
                    onChange={(event) =>
                      void handleStatusChange(event.target.value as OrderStatus)
                    }
                    disabled={isUpdatingStatus}
                    className={cn(
                      "w-full rounded-xl border px-4 py-3 text-sm font-semibold outline-none transition",
                      settings.scheme === "dark"
                        ? "border-white/10 bg-slate-950 text-slate-100"
                        : "border-slate-200 bg-white text-slate-900",
                    )}
                  >
                    {EDITABLE_ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {formatStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                </label>
                {isUpdatingStatus ? (
                  <p className={cn("mt-3 text-sm", getMutedTextClasses(settings.scheme))}>
                    Updating status...
                  </p>
                ) : null}
              </SecondaryPanel>
            </div>
          </div>
        </div>

        <div
          className={cn(
            getManagerModalFooterClasses(settings.scheme),
            "sticky bottom-0 z-[10000] shrink-0",
          )}
        >
          <button
            type="button"
            onClick={requestClose}
            className={getManagerSecondaryButtonClasses(settings.scheme)}
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-[15px]">
      <span>{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
