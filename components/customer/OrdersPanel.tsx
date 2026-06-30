"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type {
  CartItem,
  CustomerOrderHistory,
  RestaurantInfo,
} from "@/types/customer";
import {
  CUSTOMER_PLACEHOLDER_IMAGE,
  formatPrice,
  getImageSrc,
} from "@/components/customer/customerUtils";
import {
  createCustomerOrder,
  fetchCustomerOrder,
  fetchCustomerSessionOrders,
  type CustomerOrderRecord,
} from "@/lib/customer-menu-api";

interface OrdersPanelProps {
  items: CartItem[];
  subtotal: number;
  restaurant: RestaurantInfo;
  tenantId: string;
  onOrderSuccess: () => void;
  onEdit: (item: CartItem) => void;
  onRemove: (item: CartItem) => void;
}

type OrderType = "dine_in" | "takeaway" | "delivery";

type DetailsForm = {
  customerName: string;
  mobileNumber: string;
  orderType: OrderType | "";
  note: string;
};

type PaymentForm = {
  cardNumber: string;
  expiry: string;
  cvc: string;
};

const statusLabels: Record<string, string> = {
  accepted: "Accepted",
  preparing: "Preparing",
  ready: "Ready",
  delivered: "Delivered",
  cancelled: "Cancelled",
};
const orderStatuses = ["accepted", "preparing", "ready", "delivered"] as const;
const fallbackImage = CUSTOMER_PLACEHOLDER_IMAGE;
function getCustomerSessionId(tenantId: string) {
  if (typeof window === "undefined") {
    return "";
  }

  const cleanTenantId = tenantId.trim();

  if (!cleanTenantId) {
    return "";
  }

  const sessionStorageKey = `menuflow_customer_session_id_${cleanTenantId}`;
  const existing = window.localStorage.getItem(sessionStorageKey);

  if (existing) {
    return existing;
  }

  const next =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  window.localStorage.setItem(sessionStorageKey, next);
  return next;
}

function getDigits(value: string) {
  return value.replace(/\D/g, "");
}

function getOrderStatus(
  order: CustomerOrderRecord | CustomerOrderHistory | null,
) {
  return String(order?.order_status || "").toLowerCase();
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value || "-";
  }

  return date.toLocaleString();
}

function getOrderQuantity(order: CustomerOrderHistory) {
  return order.items.reduce((total, item) => total + item.quantity, 0);
}

function getOrderItemsText(order: CustomerOrderHistory) {
  if (!order.items.length) {
    return "No items listed";
  }

  return order.items
    .map((item) => `${item.food_name}${item.serving_size ? ` (${item.serving_size})` : ""} x ${item.quantity}`)
    .join("\n");
}

export function OrdersPanel({
  items,
  subtotal,
  restaurant,
  tenantId,
  onOrderSuccess,
  onEdit,
  onRemove,
}: OrdersPanelProps) {
  const [detailsForm, setDetailsForm] = useState<DetailsForm>({
    customerName: "",
    mobileNumber: "",
    orderType: "",
    note: "",
  });
  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    cardNumber: "",
    expiry: "",
    cvc: "",
  });
  const [detailsErrors, setDetailsErrors] = useState<Partial<Record<keyof DetailsForm, string>>>({});
  const [paymentErrors, setPaymentErrors] = useState<Partial<Record<keyof PaymentForm, string>>>({});
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [historyErrorMessage, setHistoryErrorMessage] = useState("");
  const [orderHistory, setOrderHistory] = useState<CustomerOrderHistory[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [detailsOrder, setDetailsOrder] = useState<CustomerOrderHistory | null>(null);
  const [currentOrder, setCurrentOrder] = useState<CustomerOrderRecord | null>(null);
  const historyLoadIdRef = useRef(0);
  const cleanTenantId = tenantId.trim();
  const taxRate = Number(restaurant.taxRate ?? 5);
  const serviceChargeRate = Number(restaurant.serviceChargeRate ?? 3);
  const discountRate = Number(restaurant.discountRate ?? 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const serviceChargeAmount = (subtotal * serviceChargeRate) / 100;
  const discountAmount = discountRate > 0 ? (subtotal * discountRate) / 100 : 0;
  const totalAmount = subtotal + taxAmount + serviceChargeAmount - discountAmount;

  const itemCount = useMemo(
    () => items.reduce((count, item) => count + item.quantity, 0),
    [items],
  );
  const latestHistoryOrder = orderHistory[0] ?? null;
  const statusOrder = currentOrder ?? latestHistoryOrder;
  const status = getOrderStatus(statusOrder);
  const hasPlacedOrder = Boolean(statusOrder?.id);

  const loadOrderHistory = useCallback(async () => {
    const requestId = historyLoadIdRef.current + 1;
    historyLoadIdRef.current = requestId;

    if (!cleanTenantId) {
      setOrderHistory([]);
      setCurrentOrder(null);
      setHistoryErrorMessage("");
      setIsHistoryLoading(false);
      return;
    }

    const customerSessionId = getCustomerSessionId(cleanTenantId);

    if (!customerSessionId || !cleanTenantId) {
      setOrderHistory([]);
      setCurrentOrder(null);
      return;
    }

    console.log("CUSTOMER ORDERS LOAD", {
      tenantId: cleanTenantId,
      customerSessionId,
    });

    setIsHistoryLoading(true);

    try {
      const orders = await fetchCustomerSessionOrders(customerSessionId, cleanTenantId);

      if (historyLoadIdRef.current !== requestId) {
        return;
      }

      setOrderHistory(orders);
      setHistoryErrorMessage("");

      setCurrentOrder((current) => {
        if (!orders[0]) {
          return null;
        }

        return current ?? {
          ...orders[0],
          order_status: orders[0].order_status,
        };
      });
    } catch {
      if (historyLoadIdRef.current === requestId) {
        setOrderHistory([]);
        setCurrentOrder(null);
        setHistoryErrorMessage("Unable to load your previous orders.");
      }
    } finally {
      if (historyLoadIdRef.current === requestId) {
        setIsHistoryLoading(false);
      }
    }
  }, [cleanTenantId]);

  useEffect(() => {
    historyLoadIdRef.current += 1;
    setOrderHistory([]);
    setCurrentOrder(null);
    setDetailsOrder(null);
    setHistoryErrorMessage("");
    setErrorMessage("");
    setIsStatusModalOpen(false);
  }, [cleanTenantId]);

  useEffect(() => {
    void loadOrderHistory();
  }, [loadOrderHistory]);

  useEffect(() => {
    if (!isStatusModalOpen || !statusOrder?.id) {
      return;
    }

    let active = true;

    async function refreshStatus() {
      try {
        const nextOrder = await fetchCustomerOrder(
          statusOrder?.id ?? "",
          cleanTenantId,
        );

        if (active) {
          setCurrentOrder(nextOrder);
          void loadOrderHistory();
        }
      } catch {
        if (active) {
          setErrorMessage("Unable to refresh order status right now.");
        }
      }
    }

    void refreshStatus();
    const intervalId = window.setInterval(refreshStatus, 5000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [cleanTenantId, isStatusModalOpen, loadOrderHistory, statusOrder?.id]);

  const closeStatusModal = useCallback(() => {
    setIsStatusModalOpen(false);
    void loadOrderHistory();
  }, [loadOrderHistory]);

  useEffect(() => {
    if (!isDetailsModalOpen && !isPaymentModalOpen && !isStatusModalOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDetailsModalOpen(false);
        setIsPaymentModalOpen(false);
        closeStatusModal();
        setDetailsOrder(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeStatusModal, isDetailsModalOpen, isPaymentModalOpen, isStatusModalOpen]);

  function openStatusModal() {
    if (latestHistoryOrder && !currentOrder) {
      setCurrentOrder({
        ...latestHistoryOrder,
        order_status: latestHistoryOrder.order_status,
      });
    }

    setIsStatusModalOpen(true);
  }

  function openDetailsModal() {
    if (items.length === 0 || isSubmitting) {
      return;
    }

    setSuccessMessage("");
    setErrorMessage("");
    setDetailsErrors({});
    setIsDetailsModalOpen(true);
  }

  function handleProceedToPayment() {
    const nextErrors: Partial<Record<keyof DetailsForm, string>> = {};

    if (!detailsForm.customerName.trim()) {
      nextErrors.customerName = "Customer name is required.";
    }

    if (!detailsForm.mobileNumber.trim()) {
      nextErrors.mobileNumber = "Mobile number is required.";
    }

    if (!detailsForm.orderType) {
      nextErrors.orderType = "Order type is required.";
    }

    setDetailsErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsDetailsModalOpen(false);
    setPaymentErrors({});
    setIsPaymentModalOpen(true);
  }

  async function handlePayNow() {
    if (isSubmitting) {
      return;
    }

    const cardDigits = getDigits(paymentForm.cardNumber);
    const nextErrors: Partial<Record<keyof PaymentForm, string>> = {};

    if (!cardDigits) {
      nextErrors.cardNumber = "Card number is required.";
    } else if (cardDigits.length < 12) {
      nextErrors.cardNumber = "Card number is too short.";
    }

    if (!paymentForm.expiry.trim()) {
      nextErrors.expiry = "Expiry date is required.";
    }

    if (!paymentForm.cvc.trim()) {
      nextErrors.cvc = "CVC is required.";
    }

    setPaymentErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    if (!cleanTenantId) {
      setErrorMessage("Unable to place order because the restaurant tenant is missing.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const customerSessionId = getCustomerSessionId(cleanTenantId);

      console.log("CUSTOMER ORDER CREATE", {
        tenantId: cleanTenantId,
        customerSessionId,
      });

      const order = await createCustomerOrder({
        tenant_id: cleanTenantId,
        customer_session_id: customerSessionId,
        customer_name: detailsForm.customerName.trim(),
        customer_phone: detailsForm.mobileNumber.trim(),
        order_type: detailsForm.orderType || "dine_in",
        item_note: detailsForm.note.trim() || undefined,
        items: items.map((item) => ({
          menu_item_id: item.itemId,
          food_name: item.name,
          category_name: item.categoryName || "",
          sub_category_name: item.subCategoryName || "",
          serving_size: item.serving,
          unit_price: item.unitPrice,
          quantity: item.quantity,
          prep_time_min: item.prepTime ?? 0,
          image_url: item.image,
          item_note: detailsForm.note.trim() || undefined,
        })),
        payment: {
          status: "paid",
          card_last4: cardDigits.slice(-4),
        },
      });

      if (!order.id) {
        throw new Error("Order was created, but the backend did not return an order id.");
      }

      setCurrentOrder(order);
      setSuccessMessage("Order placed successfully.");
      setIsPaymentModalOpen(false);
      setPaymentForm({ cardNumber: "", expiry: "", cvc: "" });
      onOrderSuccess();
      await loadOrderHistory();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to create order. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const summary = (
    <div className="mt-5 rounded-[1.4rem] bg-[#6c2a20] px-4 py-4 text-[#fff7f2]">
      <div className="space-y-3 border-b border-white/10 pb-4 text-sm text-[#f6ddd0]">
        <div className="flex items-center justify-between">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Tax ({taxRate}%)</span>
          <span>{formatPrice(taxAmount)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Service Charge ({serviceChargeRate}%)</span>
          <span>{formatPrice(serviceChargeAmount)}</span>
        </div>
        {discountRate > 0 ? (
          <div className="flex items-center justify-between">
            <span>Discount ({discountRate}%)</span>
            <span>- {formatPrice(discountAmount)}</span>
          </div>
        ) : null}
      </div>
      <div className="mt-4 flex items-center justify-between gap-4">
        <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f4d6c5]">
          Total Amount
        </span>
        <span className="inline-flex items-baseline gap-1 whitespace-nowrap text-white">
          <span className="text-lg font-semibold">Rs.</span>
          <span className="text-3xl font-black">{totalAmount.toFixed(2)}</span>
        </span>
      </div>
    </div>
  );

  const orderHistoryTable = orderHistory.length ? (
    <div className="mt-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-xl font-black text-[#7a2a24]">Your Orders</h3>
        {isHistoryLoading ? (
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#8e7364]">
            Loading
          </span>
        ) : null}
      </div>
      <div className="overflow-x-auto rounded-[1.4rem] border border-[#eadfce] bg-[#fffdf9]">
        <table className="min-w-[980px] w-full border-collapse text-left text-sm">
          <thead className="bg-[#f0eadf] text-xs uppercase tracking-[0.16em] text-[#7a6050]">
            <tr>
              <th className="px-4 py-3">Order No</th>
              <th className="px-4 py-3">Placed At</th>
              <th className="px-4 py-3">Items Bought</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Order Type</th>
              <th className="px-4 py-3">Order Status</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eadfce] text-[#7a6050]">
            {orderHistory.map((order) => (
              <tr key={order.id || order.order_number}>
                <td className="px-4 py-3 font-bold text-[#7a2a24]">
                  {order.order_number || order.id}
                </td>
                <td className="px-4 py-3">{formatDateTime(order.placed_at)}</td>
                <td className="whitespace-pre-line px-4 py-3">
                  {getOrderItemsText(order)}
                </td>
                <td className="px-4 py-3">{getOrderQuantity(order)}</td>
                <td className="px-4 py-3">{order.order_type}</td>
                <td className="px-4 py-3">{order.order_status}</td>
                <td className="px-4 py-3">{order.payment_status}</td>
                <td className="px-4 py-3 font-bold text-[#2b8a38]">
                  {formatPrice(order.total_amount)}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setDetailsOrder(order)}
                    className="rounded-full border border-[#d8cab8] bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#7a2a24] transition hover:bg-[#f8f1e7]"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ) : null;

  return (
    <section className="rounded-[2rem] border border-[#dfd5c7] bg-[#fffaf4] p-4 shadow-[0_18px_48px_rgba(108,79,55,0.08)] sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[0.78rem] font-bold uppercase tracking-[0.24em] text-[#3d9238]">
            Orders
          </p>
          <h2 className="mt-2 text-2xl font-black text-[#7a2a24]">
            {items.length
              ? "Current selections"
              : orderHistory.length
                ? "Your Orders"
                : "No items added yet"}
          </h2>
        </div>
        <div className="rounded-full bg-[#f0eadf] px-4 py-2 text-sm font-semibold text-[#7a6050]">
          {itemCount} item{itemCount === 1 ? "" : "s"}
        </div>
      </div>

      {items.length ? (
        <>
          <div className="mt-5 space-y-3">
            {items.map((item) => {
              const itemSubtotal = item.unitPrice * item.quantity;
              const imageSrc = getImageSrc(item.image);

              return (
                <article
                  key={item.key}
                  className="flex gap-3 rounded-[1.4rem] bg-[#f6efe5] p-3"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[1rem] border border-[#eadfce] bg-white">
                    <Image
                      src={imageSrc}
                      alt={item.name}
                      fill
                      unoptimized
                      sizes="80px"
                      className="object-cover"
                      onError={(event) => {
                        event.currentTarget.src = fallbackImage;
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-base font-bold leading-5 text-[#7a2a24]">
                      {item.name}
                    </div>
                    <div className="mt-2 text-sm text-[#8e7364]">
                      {item.serving} serving
                      {item.crust ? ` - ${item.crust}` : ""} - Qty {item.quantity}
                    </div>
                    <div className="mt-1 text-sm text-[#8e7364]">
                      {formatPrice(item.unitPrice)} each
                    </div>
                    <div className="mt-3 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-lg font-black text-[#2b8a38]">
                        {formatPrice(itemSubtotal)}
                      </div>
                      <div className="flex max-w-full flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(item)}
                          className="rounded-full border border-[#d9d0c3] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#7a6050] transition hover:bg-[#fdf6ec]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemove(item)}
                          className="rounded-full border border-[#d9b6ad] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#b03a34] transition hover:bg-[#fff1ee]"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {summary}

          <button
            type="button"
            onClick={openDetailsModal}
            disabled={items.length === 0 || isSubmitting}
            className="mt-4 w-full rounded-2xl bg-[#188a24] px-4 py-3 text-base font-bold text-white transition duration-200 hover:bg-[#116b1b] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#188a24]"
          >
            {isSubmitting ? "Processing..." : "Place Order"}
          </button>
        </>
      ) : (
        <p className="mt-3 text-sm leading-6 text-[#8e7364]">
          Open any menu item, choose a serving size, set a quantity, and add it
          to your order.
        </p>
      )}

      {historyErrorMessage ? (
        <p className="mt-3 text-sm font-semibold text-[#b03a34]">
          {historyErrorMessage}
        </p>
      ) : null}

      {orderHistoryTable}

      {successMessage ? (
        <p className="mt-3 text-center text-sm font-semibold text-[#2b8a38]">
          {successMessage}
        </p>
      ) : null}

      {errorMessage ? (
        <p className="mt-3 text-center text-sm font-semibold text-[#b03a34]">
          {errorMessage}
        </p>
      ) : null}

      {hasPlacedOrder ? (
        <button
          type="button"
          onClick={openStatusModal}
          className="mt-4 w-full rounded-2xl border border-[#d8cab8] bg-white px-4 py-3 text-base font-bold text-[#7a2a24] transition duration-200 hover:bg-[#f8f1e7]"
        >
          View Order Status
        </button>
      ) : null}

      {isDetailsModalOpen ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(73,48,37,0.42)] px-4 py-6 backdrop-blur-[2px]"
          onClick={() => setIsDetailsModalOpen(false)}
        >
          <form
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-details-title"
            className="w-full max-w-lg rounded-[2rem] border border-[#ddcfc0] bg-[#fffaf4] p-5 shadow-[0_30px_70px_rgba(77,45,34,0.24)] sm:p-6"
            onClick={(event) => event.stopPropagation()}
            onSubmit={(event) => {
              event.preventDefault();
              handleProceedToPayment();
            }}
            noValidate
          >
            <h3 id="order-details-title" className="text-2xl font-black text-[#7a2a24]">
              Confirm Order Details
            </h3>
            <div className="mt-5 space-y-4">
              <label className="block text-sm font-bold text-[#7a6050]">
                Customer name
                <input
                  value={detailsForm.customerName}
                  onChange={(event) =>
                    setDetailsForm((current) => ({
                      ...current,
                      customerName: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-[#ddcfc0] bg-white px-4 py-3 text-[#7a2a24] outline-none focus:border-[#188a24]"
                />
                {detailsErrors.customerName ? (
                  <span className="mt-1 block text-xs text-[#b03a34]">
                    {detailsErrors.customerName}
                  </span>
                ) : null}
              </label>
              <label className="block text-sm font-bold text-[#7a6050]">
                Mobile number
                <input
                  value={detailsForm.mobileNumber}
                  onChange={(event) =>
                    setDetailsForm((current) => ({
                      ...current,
                      mobileNumber: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-[#ddcfc0] bg-white px-4 py-3 text-[#7a2a24] outline-none focus:border-[#188a24]"
                />
                {detailsErrors.mobileNumber ? (
                  <span className="mt-1 block text-xs text-[#b03a34]">
                    {detailsErrors.mobileNumber}
                  </span>
                ) : null}
              </label>
              <label className="block text-sm font-bold text-[#7a6050]">
                Order type
                <select
                  value={detailsForm.orderType}
                  onChange={(event) =>
                    setDetailsForm((current) => ({
                      ...current,
                      orderType: event.target.value as OrderType | "",
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-[#ddcfc0] bg-white px-4 py-3 text-[#7a2a24] outline-none focus:border-[#188a24]"
                >
                  <option value="">Select order type</option>
                  <option value="dine_in">Dine in</option>
                  <option value="takeaway">Takeaway</option>
                  <option value="delivery">Delivery</option>
                </select>
                {detailsErrors.orderType ? (
                  <span className="mt-1 block text-xs text-[#b03a34]">
                    {detailsErrors.orderType}
                  </span>
                ) : null}
              </label>
              <label className="block text-sm font-bold text-[#7a6050]">
                Note
                <textarea
                  value={detailsForm.note}
                  onChange={(event) =>
                    setDetailsForm((current) => ({
                      ...current,
                      note: event.target.value,
                    }))
                  }
                  rows={3}
                  className="mt-2 w-full resize-none rounded-2xl border border-[#ddcfc0] bg-white px-4 py-3 text-[#7a2a24] outline-none focus:border-[#188a24]"
                />
              </label>
            </div>
            <button
              type="submit"
              className="mt-5 w-full rounded-2xl bg-[#188a24] px-4 py-3 text-base font-bold text-white transition hover:bg-[#116b1b]"
            >
              Proceed to Payment
            </button>
          </form>
        </div>
      ) : null}

      {isPaymentModalOpen ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(73,48,37,0.42)] px-4 py-6 backdrop-blur-[2px]"
          onClick={() => setIsPaymentModalOpen(false)}
        >
          <form
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-title"
            className="w-full max-w-lg rounded-[2rem] border border-[#ddcfc0] bg-[#fffaf4] p-5 shadow-[0_30px_70px_rgba(77,45,34,0.24)] sm:p-6"
            onClick={(event) => event.stopPropagation()}
            onSubmit={(event) => {
              event.preventDefault();
              void handlePayNow();
            }}
            noValidate
          >
            <p className="text-[0.78rem] font-bold uppercase tracking-[0.24em] text-[#3d9238]">
              {restaurant.name}
            </p>
            <h3 id="payment-title" className="mt-2 text-2xl font-black text-[#7a2a24]">
              Secure Payment
            </h3>
            <div className="mt-4 rounded-[1.4rem] bg-[#6c2a20] px-4 py-3 text-[#fff7f2]">
              <span className="text-sm text-[#f6ddd0]">Amount Due: </span>
              <span className="text-xl font-black">{formatPrice(totalAmount)}</span>
            </div>
            <div className="mt-5 space-y-4">
              <label className="block text-sm font-bold text-[#7a6050]">
                Card number
                <input
                  value={paymentForm.cardNumber}
                  inputMode="numeric"
                  autoComplete="cc-number"
                  onChange={(event) =>
                    setPaymentForm((current) => ({
                      ...current,
                      cardNumber: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-[#ddcfc0] bg-white px-4 py-3 text-[#7a2a24] outline-none focus:border-[#188a24]"
                />
                {paymentErrors.cardNumber ? (
                  <span className="mt-1 block text-xs text-[#b03a34]">
                    {paymentErrors.cardNumber}
                  </span>
                ) : null}
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-bold text-[#7a6050]">
                  Expiry date
                  <input
                    value={paymentForm.expiry}
                    autoComplete="cc-exp"
                    placeholder="MM/YY"
                    onChange={(event) =>
                      setPaymentForm((current) => ({
                        ...current,
                        expiry: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-2xl border border-[#ddcfc0] bg-white px-4 py-3 text-[#7a2a24] outline-none focus:border-[#188a24]"
                  />
                  {paymentErrors.expiry ? (
                    <span className="mt-1 block text-xs text-[#b03a34]">
                      {paymentErrors.expiry}
                    </span>
                  ) : null}
                </label>
                <label className="block text-sm font-bold text-[#7a6050]">
                  CVC
                  <input
                    value={paymentForm.cvc}
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    onChange={(event) =>
                      setPaymentForm((current) => ({
                        ...current,
                        cvc: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-2xl border border-[#ddcfc0] bg-white px-4 py-3 text-[#7a2a24] outline-none focus:border-[#188a24]"
                  />
                  {paymentErrors.cvc ? (
                    <span className="mt-1 block text-xs text-[#b03a34]">
                      {paymentErrors.cvc}
                    </span>
                  ) : null}
                </label>
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-5 w-full rounded-2xl bg-[#188a24] px-4 py-3 text-base font-bold text-white transition hover:bg-[#116b1b] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Paying..." : "Pay Now"}
            </button>
          </form>
        </div>
      ) : null}

      {detailsOrder ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(73,48,37,0.42)] px-4 py-6 backdrop-blur-[2px]"
          onClick={() => setDetailsOrder(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-history-details-title"
            className="max-h-[88vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] border border-[#ddcfc0] bg-[#fffaf4] p-5 shadow-[0_30px_70px_rgba(77,45,34,0.24)] sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.78rem] font-bold uppercase tracking-[0.24em] text-[#3d9238]">
                  Order Details
                </p>
                <h3
                  id="order-history-details-title"
                  className="mt-2 text-2xl font-black text-[#7a2a24]"
                >
                  {detailsOrder.order_number || detailsOrder.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailsOrder(null)}
                className="grid h-10 w-10 place-items-center rounded-full border border-[#ddcfc0] bg-white text-xl font-black text-[#b03a34] transition hover:bg-[#fff1ee]"
                aria-label="Close order details"
              >
                x
              </button>
            </div>

            <div className="mt-5 grid gap-3 rounded-[1.4rem] bg-[#f6efe5] p-4 text-sm text-[#7a6050] sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="font-bold text-[#7a2a24]">Customer</div>
                <div>{detailsOrder.customer_name || "-"}</div>
              </div>
              <div>
                <div className="font-bold text-[#7a2a24]">Phone</div>
                <div>{detailsOrder.customer_phone || "-"}</div>
              </div>
              <div>
                <div className="font-bold text-[#7a2a24]">Order Type</div>
                <div>{detailsOrder.order_type || "-"}</div>
              </div>
              <div>
                <div className="font-bold text-[#7a2a24]">Order Status</div>
                <div>{detailsOrder.order_status || "-"}</div>
              </div>
              <div>
                <div className="font-bold text-[#7a2a24]">Payment</div>
                <div>{detailsOrder.payment_status || "-"}</div>
              </div>
              <div>
                <div className="font-bold text-[#7a2a24]">Total</div>
                <div>{formatPrice(detailsOrder.total_amount)}</div>
              </div>
              <div className="sm:col-span-2">
                <div className="font-bold text-[#7a2a24]">Item Notes</div>
                <div>
                  {detailsOrder.items
                    .map((item) => item.item_note)
                    .filter(Boolean)
                    .join(", ") || "-"}
                </div>
              </div>
            </div>

            <div className="mt-5 overflow-x-auto rounded-[1.4rem] border border-[#eadfce] bg-[#fffdf9]">
              <table className="min-w-[920px] w-full border-collapse text-left text-sm">
                <thead className="bg-[#f0eadf] text-xs uppercase tracking-[0.16em] text-[#7a6050]">
                  <tr>
                    <th className="px-4 py-3">Food Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Sub Category</th>
                    <th className="px-4 py-3">Serving Size</th>
                    <th className="px-4 py-3">Unit Price</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Line Total</th>
                    <th className="px-4 py-3">Prep Time</th>
                    <th className="px-4 py-3">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eadfce] text-[#7a6050]">
                  {detailsOrder.items.map((item, index) => (
                    <tr key={item.id || `${item.menu_item_id}-${index}`}>
                      <td className="px-4 py-3 font-bold text-[#7a2a24]">
                        {item.food_name}
                      </td>
                      <td className="px-4 py-3">{item.category_name || "-"}</td>
                      <td className="px-4 py-3">{item.sub_category_name || "-"}</td>
                      <td className="px-4 py-3">{item.serving_size || "-"}</td>
                      <td className="px-4 py-3">{formatPrice(item.unit_price)}</td>
                      <td className="px-4 py-3">{item.quantity}</td>
                      <td className="px-4 py-3">{formatPrice(item.line_total)}</td>
                      <td className="px-4 py-3">
                        {item.prep_time_min ? `${item.prep_time_min} min` : "-"}
                      </td>
                      <td className="px-4 py-3">{item.item_note || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      {isStatusModalOpen ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(73,48,37,0.42)] px-4 py-6 backdrop-blur-[2px]"
          onClick={closeStatusModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-status-title"
            className="w-full max-w-lg rounded-[2rem] border border-[#ddcfc0] bg-[#fffaf4] p-5 shadow-[0_30px_70px_rgba(77,45,34,0.24)] sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.78rem] font-bold uppercase tracking-[0.24em] text-[#3d9238]">
                  Order Status
                </p>
                <h3 id="order-status-title" className="mt-2 text-2xl font-black text-[#7a2a24]">
                  Track your order progress
                </h3>
              </div>
              <button
                type="button"
                onClick={closeStatusModal}
                className="grid h-10 w-10 place-items-center rounded-full border border-[#ddcfc0] bg-white text-xl font-black text-[#b03a34] transition hover:bg-[#fff1ee]"
                aria-label="Close order status"
              >
                x
              </button>
            </div>

            {!statusOrder ? (
              <p className="mt-6 rounded-[1.3rem] bg-[#f6efe5] px-4 py-3 text-sm font-semibold text-[#7a6050]">
                No order has been placed yet.
              </p>
            ) : status === "cancelled" ? (
              <p className="mt-6 rounded-[1.3rem] bg-[#fff1ee] px-4 py-3 text-sm font-semibold text-[#b03a34]">
                Order status: {statusLabels.cancelled}
              </p>
            ) : (
              <div className="mt-6 space-y-4">
                {orderStatuses.map((entry, index) => {
                  const currentIndex = Math.max(
                    0,
                    orderStatuses.findIndex((item) => item === status),
                  );
                  const isActive = index === currentIndex;
                  const isComplete = index < currentIndex;

                  return (
                    <div key={entry} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`grid h-10 w-10 place-items-center rounded-full border-2 text-sm font-black ${
                            isActive || isComplete
                              ? "border-[#188a24] bg-[#188a24] text-white"
                              : "border-[#d9cbbb] bg-[#f6efe5] text-[#8e7364]"
                          }`}
                        >
                          {index + 1}
                        </div>
                        {index < orderStatuses.length - 1 ? (
                          <div
                            className={`mt-2 h-10 w-0.5 ${
                              isComplete ? "bg-[#188a24]" : "bg-[#eadfce]"
                            }`}
                          />
                        ) : null}
                      </div>
                      <div
                        className={`flex-1 rounded-[1.3rem] px-4 py-3 ${
                          isActive ? "bg-[#eef8ef]" : "bg-[#f6efe5]"
                        }`}
                      >
                        <div
                          className={`text-base font-bold ${
                            isActive ? "text-[#188a24]" : "text-[#7a2a24]"
                          }`}
                        >
                          {statusLabels[entry]}
                        </div>
                        <div className="mt-1 text-sm text-[#8e7364]">
                          {isActive
                            ? `Current backend status: ${statusLabels[entry]}.`
                            : "This step will update as your order progresses."}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              type="button"
              onClick={closeStatusModal}
              className="mt-6 w-full rounded-2xl bg-[#188a24] px-4 py-3 text-base font-bold text-white transition duration-200 hover:bg-[#116b1b]"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
