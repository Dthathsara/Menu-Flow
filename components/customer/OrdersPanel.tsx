"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
<<<<<<< HEAD
import type { CartItem } from "@/types/customer";
import { formatPrice } from "@/components/customer/customerUtils";
=======
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
>>>>>>> Dulnith

interface OrdersPanelProps {
  items: CartItem[];
  subtotal: number;
<<<<<<< HEAD
  tax: number;
  serviceCharge: number;
  total: number;
=======
  restaurant: RestaurantInfo;
  tenantId: string;
  tableId?: string;
  qrToken?: string;
  onOrderSuccess: () => void;
>>>>>>> Dulnith
  onEdit: (item: CartItem) => void;
  onRemove: (key: string) => void;
}

<<<<<<< HEAD
const orderStatuses = ["Accepted", "Preparing", "Ready", "Delivered"] as const;
=======
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
>>>>>>> Dulnith

export function OrdersPanel({
  items,
  subtotal,
<<<<<<< HEAD
  tax,
  serviceCharge,
  total,
=======
  restaurant,
  tenantId,
  tableId = "",
  qrToken = "",
  onOrderSuccess,
>>>>>>> Dulnith
  onEdit,
  onRemove,
}: OrdersPanelProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
<<<<<<< HEAD
=======
  const [detailsOrder, setDetailsOrder] = useState<CustomerOrderHistory | null>(null);
  const [currentOrder, setCurrentOrder] = useState<CustomerOrderRecord | null>(null);
  const historyLoadIdRef = useRef(0);
  const cleanTenantId = tenantId.trim();
  const cleanTableId = tableId.trim();
  const cleanQrToken = qrToken.trim();
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
>>>>>>> Dulnith

  useEffect(() => {
    if (!isStatusModalOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsStatusModalOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isStatusModalOpen]);

  function handlePlaceOrder() {
    if (items.length === 0 || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage("");

<<<<<<< HEAD
    window.setTimeout(() => {
=======
    try {
      const customerSessionId = getCustomerSessionId(cleanTenantId);

      const order = await createCustomerOrder({
        tenant_id: cleanTenantId,
        table_id: cleanTableId || undefined,
        qr_token: cleanQrToken || undefined,
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
>>>>>>> Dulnith
      setIsSubmitting(false);
      setSuccessMessage("Order placed successfully.");
    }, 900);
  }

  if (items.length === 0) {
    return (
      <section className="rounded-[2rem] border border-[#dfd5c7] bg-[#fffaf4] p-6 text-center shadow-[0_18px_48px_rgba(108,79,55,0.08)]">
        <p className="text-[0.78rem] font-bold uppercase tracking-[0.24em] text-[#3d9238]">
          Orders
        </p>
        <h2 className="mt-3 text-2xl font-black text-[#7a2a24]">
          No items added yet
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#8e7364]">
          Open any menu item, choose a serving size, set a quantity, and add it
          to your order.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] border border-[#dfd5c7] bg-[#fffaf4] p-4 shadow-[0_18px_48px_rgba(108,79,55,0.08)] sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[0.78rem] font-bold uppercase tracking-[0.24em] text-[#3d9238]">
            Orders
          </p>
          <h2 className="mt-2 text-2xl font-black text-[#7a2a24]">
            Current selections
          </h2>
        </div>
        <div className="rounded-full bg-[#f0eadf] px-4 py-2 text-sm font-semibold text-[#7a6050]">
          {items.length} item{items.length === 1 ? "" : "s"}
        </div>
      </div>

<<<<<<< HEAD
      <div className="mt-5 space-y-3">
        {items.map((item) => {
          const subtotal = item.unitPrice * item.quantity;

          return (
            <article
              key={item.key}
              className="flex gap-3 rounded-[1.4rem] bg-[#f6efe5] p-3"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[1rem] border border-[#eadfce] bg-white">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-base font-bold leading-5 text-[#7a2a24]">
                  {item.name}
                </div>
                <div className="mt-2 text-sm text-[#8e7364]">
                  {item.serving} serving
                  {item.crust ? ` · ${item.crust}` : ""} · Qty {item.quantity}
                </div>
                <div className="mt-1 text-sm text-[#8e7364]">
                  {formatPrice(item.unitPrice)} each
                </div>
                <div className="mt-3 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-lg font-black text-[#2b8a38]">
                    {formatPrice(subtotal)}
=======
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
>>>>>>> Dulnith
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
                      onClick={() => onRemove(item.key)}
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

      <div className="mt-5 rounded-[1.4rem] bg-[#6c2a20] px-4 py-4 text-[#fff7f2]">
        <div className="space-y-3 border-b border-white/10 pb-4 text-sm text-[#f6ddd0]">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Tax (5%)</span>
            <span>{formatPrice(tax)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Service Charge (3%)</span>
            <span>{formatPrice(serviceCharge)}</span>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-4">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f4d6c5]">
            Total Amount
          </span>
          <span className="inline-flex items-baseline gap-1 whitespace-nowrap text-white">
            <span className="text-lg font-semibold">Rs.</span>
            <span className="text-3xl font-black">{total.toFixed(2)}</span>
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handlePlaceOrder}
        disabled={items.length === 0 || isSubmitting}
        className="mt-4 w-full rounded-2xl bg-[#188a24] px-4 py-3 text-base font-bold text-white transition duration-200 hover:bg-[#116b1b] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#188a24]"
      >
        {isSubmitting ? "Placing Order..." : "Place Order"}
      </button>

      {successMessage ? (
        <p className="mt-3 text-center text-sm font-semibold text-[#2b8a38]">
          {successMessage}
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => setIsStatusModalOpen(true)}
        disabled={items.length === 0}
        className="mt-4 w-full rounded-2xl border border-[#d8cab8] bg-white px-4 py-3 text-base font-bold text-[#7a2a24] transition duration-200 hover:bg-[#f8f1e7] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
      >
        View Order Status
      </button>

      {isStatusModalOpen ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(73,48,37,0.42)] px-4 py-6 backdrop-blur-[2px]"
          onClick={() => setIsStatusModalOpen(false)}
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
                <h3
                  id="order-status-title"
                  className="mt-2 text-2xl font-black text-[#7a2a24]"
                >
                  Track your order progress
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsStatusModalOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-full border border-[#ddcfc0] bg-white text-xl font-black text-[#b03a34] transition hover:bg-[#fff1ee]"
                aria-label="Close order status"
              >
                ×
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {orderStatuses.map((status, index) => {
                const isActive = index === 0;
                const isUpcoming = index > 0;

                return (
                  <div key={status} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`grid h-10 w-10 place-items-center rounded-full border-2 text-sm font-black ${
                          isActive
                            ? "border-[#188a24] bg-[#188a24] text-white"
                            : "border-[#d9cbbb] bg-[#f6efe5] text-[#8e7364]"
                        }`}
                      >
                        {index + 1}
                      </div>
                      {index < orderStatuses.length - 1 ? (
                        <div
                          className={`mt-2 h-10 w-0.5 ${
                            isUpcoming ? "bg-[#eadfce]" : "bg-[#188a24]"
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
                        {status}
                      </div>
                      <div className="mt-1 text-sm text-[#8e7364]">
                        {isActive
                          ? "Your order has been received and confirmed."
                          : "This step will update as your order progresses."}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setIsStatusModalOpen(false)}
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
