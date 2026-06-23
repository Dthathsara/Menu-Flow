"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SummaryCard } from "@/components/common/SummaryCard";
import {
  cn,
  getManagerAccentPillClasses,
  getManagerPageSectionClasses,
  getManagerPageSubtitleClasses,
  getManagerPageTitleClasses,
  getManagerSectionSubtitleClasses,
  getManagerSectionTitleClasses,
  getMutedTextClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import { SessionExpiredError } from "@/lib/auth-session";
import { fetchAdminOrders } from "@/lib/admin-orders-api";
import {
  filterOrdersLocally,
  getEmptyOrdersSummary,
  getOrdersSummaryCards,
  sortOrdersByNewest,
} from "./order-data";
import { OrderDetailsModal } from "./OrderDetailsModal";
import { OrdersTable } from "./OrdersTable";
import { OrdersToolbar } from "./OrdersToolbar";
import { SectionPill, SurfaceCard } from "./shared";
import type {
  OrderRecord,
  OrdersSummary,
  OrderStatusFilter,
  PaymentStatusFilter,
} from "./types";

interface OrdersPageViewProps {
  settings: ManagerSettings;
}

const DEFAULT_FILTERS = {
  query: "",
  paymentStatus: "All Payments",
  orderStatus: "All Statuses",
} as const;

export function OrdersPageView({ settings }: OrdersPageViewProps) {
  const [query, setQuery] = useState<string>(DEFAULT_FILTERS.query);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusFilter>(
    DEFAULT_FILTERS.paymentStatus,
  );
  const [orderStatus, setOrderStatus] = useState<OrderStatusFilter>(
    DEFAULT_FILTERS.orderStatus,
  );
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [summary, setSummary] = useState<OrdersSummary>(getEmptyOrdersSummary);
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedQuery(query), 300);
    return () => window.clearTimeout(timeoutId);
  }, [query]);

  const loadOrders = useCallback(
    async (showLoading = false) => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      if (showLoading) {
        setIsLoading(true);
      }

      try {
        const result = await fetchAdminOrders({
          search: debouncedQuery,
          paymentStatus,
          orderStatus,
        });

        if (requestIdRef.current !== requestId) {
          return;
        }

        setOrders(sortOrdersByNewest(result.orders));
        setSummary(result.summary);
        setErrorMessage("");
      } catch (error) {
        if (requestIdRef.current !== requestId) {
          return;
        }

        setOrders([]);
        setSummary(getEmptyOrdersSummary());
        setErrorMessage(
          error instanceof SessionExpiredError
            ? "Your session has expired. Please log in again."
            : "Unable to load orders. Please try again.",
        );
      } finally {
        if (requestIdRef.current === requestId) {
          setIsLoading(false);
        }
      }
    },
    [debouncedQuery, orderStatus, paymentStatus],
  );

  useEffect(() => {
    void loadOrders(true);
  }, [loadOrders]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void loadOrders(false);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [loadOrders]);

  const filters = useMemo(
    () => ({
      query,
      paymentStatus,
      orderStatus,
    }),
    [query, paymentStatus, orderStatus],
  );

  const visibleOrders = useMemo(
    () => filterOrdersLocally(orders, filters),
    [filters, orders],
  );
  const summaryCards = useMemo(() => getOrdersSummaryCards(summary), [summary]);
  const hasActiveFilters = Boolean(
    query || paymentStatus !== "All Payments" || orderStatus !== "All Statuses",
  );

  return (
    <>
      <section className={getManagerPageSectionClasses()}>
        <SurfaceCard settings={settings} className="overflow-hidden p-5 sm:p-6">
          <div className="relative">
            <div className="pointer-events-none absolute -right-16 top-0 h-40 w-40 rounded-full bg-blue-500/12 blur-3xl" />
            <span className={getManagerAccentPillClasses(settings.scheme, "brand")}>
              Live order management
            </span>
            <h2 className={cn("mt-5", getManagerPageTitleClasses())}>Orders</h2>
            <p className={cn("mt-3 max-w-3xl", getManagerPageSubtitleClasses(settings.scheme))}>
              Track active orders, delivery progress, and payment collection across
              every table in real time.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map((card) => (
                <SummaryCard
                  key={card.title}
                  scheme={settings.scheme}
                  accent={card.accent}
                  title={card.title}
                  value={card.value}
                  note={card.note}
                  className="p-4 sm:p-5"
                  titleClassName={cn(
                    "text-[11px] font-semibold uppercase tracking-[0.22em]",
                    getMutedTextClasses(settings.scheme),
                  )}
                  noteClassName={getManagerSectionSubtitleClasses(settings.scheme)}
                />
              ))}
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard settings={settings} className="overflow-hidden">
          <div className="border-b border-black/5 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h3 className={getManagerSectionTitleClasses()}>Orders Queue</h3>
                <p className={getManagerSectionSubtitleClasses(settings.scheme)}>
                  Live backend order records with payment tracking and full ticket
                  details.
                </p>
              </div>
              <SectionPill settings={settings}>
                {isLoading ? "Loading backend orders" : "Live backend orders"}
              </SectionPill>
            </div>

            {errorMessage ? (
              <p className="mt-4 rounded-xl bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-500">
                {errorMessage}
              </p>
            ) : null}

            <div className="mt-5">
              <OrdersToolbar
                settings={settings}
                query={query}
                paymentStatus={paymentStatus}
                orderStatus={orderStatus}
                resultCount={visibleOrders.length}
                hasActiveFilters={hasActiveFilters}
                onQueryChange={setQuery}
                onPaymentStatusChange={setPaymentStatus}
                onOrderStatusChange={setOrderStatus}
                onClearFilters={() => {
                  setQuery(DEFAULT_FILTERS.query);
                  setPaymentStatus(DEFAULT_FILTERS.paymentStatus);
                  setOrderStatus(DEFAULT_FILTERS.orderStatus);
                }}
              />
            </div>
          </div>

          <OrdersTable
            settings={settings}
            orders={visibleOrders}
            isLoading={isLoading}
            hasActiveFilters={hasActiveFilters}
            onViewDetails={setSelectedOrder}
          />
        </SurfaceCard>
      </section>

      <OrderDetailsModal
        open={Boolean(selectedOrder)}
        order={selectedOrder}
        settings={settings}
        onClose={() => setSelectedOrder(null)}
        onOrderUpdated={async (nextOrder) => {
          setSelectedOrder(nextOrder);
          setOrders((current) =>
            current.map((order) => (order.id === nextOrder.id ? nextOrder : order)),
          );
          await loadOrders(false);
        }}
      />
    </>
  );
}
