"use client";

import { useMemo, useState } from "react";
import {
  cn,
  getManagerPageSectionClasses,
  getManagerPageSubtitleClasses,
  getManagerPageTitleClasses,
  getManagerSectionSubtitleClasses,
  getManagerSectionTitleClasses,
  getMutedTextClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import {
  getFilteredAndSortedOrders,
  getOrdersSummaryCards,
  ORDER_RECORDS,
} from "./order-data";
import { OrderDetailsModal } from "./OrderDetailsModal";
import { OrdersTable } from "./OrdersTable";
import { OrdersToolbar } from "./OrdersToolbar";
import { SummaryMetricCard } from "../SummaryMetricCard";
import { SectionPill, SurfaceCard } from "./shared";
import type { OrderRecord, OrderStatusFilter, PaymentStatusFilter } from "./types";

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
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);

  const filters = useMemo(
    () => ({
      query,
      paymentStatus,
      orderStatus,
    }),
    [query, paymentStatus, orderStatus],
  );

  const summaryCards = useMemo(() => getOrdersSummaryCards(ORDER_RECORDS), []);
  const orders = useMemo(() => getFilteredAndSortedOrders(ORDER_RECORDS, filters), [filters]);
  const hasActiveFilters = Boolean(
    query || paymentStatus !== "All Payments" || orderStatus !== "All Statuses",
  );

  return (
    <>
      <section className={getManagerPageSectionClasses()}>
        <SurfaceCard settings={settings} className="overflow-hidden p-5 sm:p-6">
          <div className="relative">
            <div className="pointer-events-none absolute -right-16 top-0 h-40 w-40 rounded-full bg-blue-500/12 blur-3xl" />
            <SectionPill settings={settings}>Operations</SectionPill>
            <h2 className={cn("mt-5", getManagerPageTitleClasses())}>Orders</h2>
            <p className={cn("mt-3 max-w-3xl", getManagerPageSubtitleClasses(settings.scheme))}>
              Track active orders, delivery progress, and payment collection across
              every table in real time.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map((card) => (
                <SummaryMetricCard
                  key={card.title}
                  settings={settings}
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
                  Priority-sorted order records with payment tracking and full ticket
                  details.
                </p>
              </div>
              <SectionPill settings={settings}>Sorted by urgency and recency</SectionPill>
            </div>

            <div className="mt-5">
              <OrdersToolbar
                settings={settings}
                query={query}
                paymentStatus={paymentStatus}
                orderStatus={orderStatus}
                resultCount={orders.length}
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

          <OrdersTable settings={settings} orders={orders} onViewDetails={setSelectedOrder} />
        </SurfaceCard>
      </section>

      <OrderDetailsModal
        open={Boolean(selectedOrder)}
        order={selectedOrder}
        settings={settings}
        onClose={() => setSelectedOrder(null)}
      />
    </>
  );
}
