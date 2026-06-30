"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
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
import {
  calculateOrderGrandTotal,
  calculateOrderSubtotal,
  getOrderItemCount,
} from "./order-data";
import {
  DetailKeyValue,
  SecondaryPanel,
  StatusBadge,
  formatCurrency,
  formatDisplayDate,
  formatDisplayTime,
} from "./shared";
import type { OrderRecord } from "./types";

interface OrderDetailsModalProps {
  open: boolean;
  order: OrderRecord | null;
  settings: ManagerSettings;
  onClose: () => void;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function OrderDetailsModal({
  open,
  order,
  settings,
  onClose,
}: OrderDetailsModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const closeTimeoutRef = useRef<number | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const closingRef = useRef(false);
  const titleId = useId();

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

<<<<<<< HEAD
  if (!open || !order) {
=======
  async function handleStatusChange(nextStatus: OrderStatus) {
    if (!modalOrder || isUpdatingStatus) {
      return;
    }

    if (
      !isOrderStatusTransitionAllowed(modalOrder.order_status, nextStatus)
    ) {
      setErrorMessage(
        "Invalid status transition. Please follow the order flow.",
      );
      return;
    }

    setIsUpdatingStatus(true);
    setErrorMessage("");
    detailsRequestIdRef.current += 1;
    setIsLoadingDetails(false);

    try {
      await updateAdminOrderStatus(modalOrder.id, nextStatus);
      const freshOrder = await fetchAdminOrder(modalOrder.id);

      setModalOrder(freshOrder);
      await onOrderUpdated(freshOrder);
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
>>>>>>> Dulnith
    return null;
  }

  const subtotal = calculateOrderSubtotal(order.items);
  const grandTotal = calculateOrderGrandTotal(order);
  const totalItems = getOrderItemCount(order);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[80] flex items-center justify-center p-4 transition-all duration-200 ease-out",
        isVisible ? "bg-black/60 backdrop-blur-sm" : "bg-black/0 backdrop-blur-none",
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
          "flex max-h-[calc(100vh-2rem)] max-w-5xl flex-col transition-all duration-200 ease-out",
          getManagerModalSurfaceClasses(settings.scheme),
          isVisible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-3 scale-[0.985] opacity-0",
        )}
      >
        <div className={getManagerModalHeaderClasses(settings.scheme)}>
          <div className="min-w-0">
            <h2 id={titleId} className={getManagerModalTitleClasses()}>
              {order.orderId}
            </h2>
            <p className={getManagerSectionSubtitleClasses(settings.scheme)}>
              Full order breakdown, itemized billing, and payment progress.
            </p>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={requestClose}
            className={getManagerIconButtonClasses(settings.scheme, true)}
            aria-label={`Close details for ${order.orderId}`}
          >
            <XIcon className="size-4" />
          </button>
        </div>

        <div className={getManagerModalBodyClasses(settings.scheme)}>
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
            <div className="space-y-5">
              <SecondaryPanel settings={settings} className="p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className={getManagerSectionTitleClasses()}>General Details</div>
                    <div className={getManagerSectionSubtitleClasses(settings.scheme)}>
                      Staff assignment, timestamps, and customer metadata.
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge settings={settings} type="order" value={order.orderStatus} />
                    <StatusBadge
                      settings={settings}
                      type="payment"
                      value={order.paymentStatus}
                    />
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <DetailKeyValue label="Order ID" value={order.orderId} settings={settings} />
                  <DetailKeyValue
                    label="Table Number"
                    value={order.tableNumber}
                    settings={settings}
                  />
                  <DetailKeyValue
                    label="Customer Name"
                    value={order.customerName}
                    settings={settings}
                  />
                  <DetailKeyValue
                    label="Order Date"
                    value={formatDisplayDate(order.createdAt)}
                    settings={settings}
                  />
                  <DetailKeyValue
                    label="Ordered Time"
                    value={formatDisplayTime(order.createdAt)}
                    settings={settings}
                  />
                  <DetailKeyValue
                    label="Delivered Time"
                    value={
                      order.deliveredAt
                        ? formatDisplayTime(order.deliveredAt)
                        : "Not delivered yet"
                    }
                    settings={settings}
                  />
                  <DetailKeyValue
                    label="Waiter Name"
                    value={order.waiterName}
                    settings={settings}
                  />
                  <DetailKeyValue
                    label="Waiter Mobile Number"
                    value={order.waiterPhoneNumber}
                    settings={settings}
                  />
                  <DetailKeyValue
                    label="Order Status"
                    value={
                      <StatusBadge
                        settings={settings}
                        type="order"
                        value={order.orderStatus}
                      />
                    }
                    settings={settings}
                  />
                  <DetailKeyValue
                    label="Payment Status"
                    value={
                      <StatusBadge
                        settings={settings}
                        type="payment"
                        value={order.paymentStatus}
                      />
                    }
                    settings={settings}
                  />
                </div>
              </SecondaryPanel>

              <SecondaryPanel settings={settings} className="p-4 sm:p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className={getManagerSectionTitleClasses()}>Items</div>
                    <div className={getManagerSectionSubtitleClasses(settings.scheme)}>
                      {totalItems} item{totalItems === 1 ? "" : "s"} ordered across the ticket.
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
                        <th className="py-3 pr-4">Quantity</th>
                        <th className="py-3 pr-4">Unit Price</th>
                        <th className="py-3 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item) => (
                        <tr key={item.id} className="border-b border-black/5 last:border-b-0">
                          <td className="py-3 pr-4 font-medium">{item.name}</td>
                          <td className="py-3 pr-4">{item.quantity}</td>
                          <td className="py-3 pr-4">{formatCurrency(item.unitPrice)}</td>
                          <td className="py-3 text-right font-semibold">
                            {formatCurrency(item.quantity * item.unitPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 grid gap-3 md:hidden">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "rounded-[14px] border p-3",
                        settings.scheme === "dark"
                          ? "border-white/10 bg-white/5"
                          : "border-slate-200 bg-slate-50/85",
                      )}
                    >
                      <div className="font-medium">{item.name}</div>
                      <div className="mt-2 flex items-center justify-between gap-3 text-[15px]">
                        <span className={getMutedTextClasses(settings.scheme)}>
                          {item.quantity} x {formatCurrency(item.unitPrice)}
                        </span>
                        <span className="font-semibold">
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </SecondaryPanel>
            </div>

            <div className="space-y-5">
              <SecondaryPanel settings={settings} className="p-4 sm:p-5">
                <div className={getManagerSectionTitleClasses()}>Billing Summary</div>
                <div className={getManagerSectionSubtitleClasses(settings.scheme)}>
                  Breakdown of the final bill including tax and service.
                </div>

                <div className="mt-5 space-y-3">
                  <SummaryRow label="Total Amount" value={formatCurrency(subtotal)} />
                  <SummaryRow label="Tax Amount" value={formatCurrency(order.taxAmount)} />
                  <SummaryRow
                    label="Service Charges"
                    value={formatCurrency(order.serviceCharge)}
                  />
                  <div
                    className={cn(
                      "flex items-center justify-between rounded-[14px] border px-4 py-4",
                      settings.scheme === "dark"
                        ? "border-white/10 bg-[linear-gradient(135deg,rgba(59,130,246,0.12),rgba(59,130,246,0.04),transparent)]"
                        : "border-blue-100 bg-blue-50/70",
                    )}
                  >
                    <span className="text-[15px] font-semibold">Grand Total</span>
                    <span className="text-[1.2rem] font-bold">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
              </SecondaryPanel>

              <SecondaryPanel settings={settings} className="p-4 sm:p-5">
                <div className={getManagerSectionTitleClasses()}>Service Contact</div>
                <div className={getManagerSectionSubtitleClasses(settings.scheme)}>
                  Assigned floor support for this order.
                </div>

                <div className="mt-5 space-y-4">
                  <DetailKeyValue label="Waiter Name" value={order.waiterName} settings={settings} />
                  <DetailKeyValue
                    label="Mobile Number"
                    value={order.waiterPhoneNumber}
                    settings={settings}
                  />
                  <DetailKeyValue
                    label="Payment Status"
                    value={
                      <StatusBadge
                        settings={settings}
                        type="payment"
                        value={order.paymentStatus}
                      />
                    }
                    settings={settings}
                  />
                </div>
              </SecondaryPanel>
            </div>
          </div>
        </div>

        <div className={getManagerModalFooterClasses(settings.scheme)}>
          <button
            type="button"
            onClick={requestClose}
            className={getManagerSecondaryButtonClasses(settings.scheme)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
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
