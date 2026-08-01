"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SearchIcon } from "@/components/manager/icons";
import {
  cn,
  getManagerPageSectionClasses,
  getManagerPageSubtitleClasses,
  getManagerPageTitleClasses,
  getManagerSecondaryButtonClasses,
  getSearchInputClasses,
} from "@/components/manager/managerUtils";
import { useManagerSettings } from "@/components/manager/useManagerSettings";
import { WaiterEmptyState } from "@/components/waiter/WaiterEmptyState";
import { WaiterLoading } from "@/components/waiter/WaiterLoading";
import { WaiterSurface } from "@/components/waiter/waiter-utils";
import {
  fetchChefAcceptedOrders,
  startChefOrderPreparing,
} from "@/lib/chef-api";
import { getApiErrorMessage, getApiStatusCode } from "@/lib/error-handler";
import { ChefOrderTable } from "./ChefOrderTable";
import type { ChefOrder } from "./types";

function sortOldestAccepted(orders: ChefOrder[]) {
  return [...orders].sort((left, right) => {
    const leftTime = Date.parse(left.acceptedAt || left.time);
    const rightTime = Date.parse(right.acceptedAt || right.time);
    return (Number.isFinite(leftTime) ? leftTime : 0) - (Number.isFinite(rightTime) ? rightTime : 0);
  });
}

function getStartPreparingErrorMessage(error: unknown) {
  const statusCode = getApiStatusCode(error);

  if (statusCode === 409) {
    return "This order was already claimed by another chef.";
  }

  if (statusCode === 400) {
    return "Unable to start preparing this order. Please refresh and try again.";
  }

  if (statusCode === 403) {
    return "You do not have permission to start preparing this order.";
  }

  if (statusCode === 404) {
    return "This order is no longer available.";
  }

  return getApiErrorMessage(error, "Unable to start preparing this order.");
}

export function ChefOrders() {
  const { settings } = useManagerSettings();
  const [query, setQuery] = useState("");
  const [orders, setOrders] = useState<ChefOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [pendingOrderId, setPendingOrderId] = useState("");
  const loadingRef = useRef(false);
  const pendingOrderRef = useRef("");

  const loadOrders = useCallback(async () => {
    if (loadingRef.current) {
      return;
    }

    loadingRef.current = true;
    setIsLoading(true);
    setErrorMessage("");

    try {
      setOrders(await fetchChefAcceptedOrders());
    } catch (error) {
      setOrders([]);
      setErrorMessage(getApiErrorMessage(error, "Unable to load accepted orders. Please try again."));
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  async function handleStartPreparing(orderId: string) {
    if (pendingOrderRef.current) {
      return;
    }

    pendingOrderRef.current = orderId;
    setPendingOrderId(orderId);
    setActionMessage("");
    setActionError("");

    try {
      await startChefOrderPreparing(orderId);
      setOrders((current) => current.filter((order) => order.id !== orderId));
      setActionMessage("Order moved to My Orders.");
    } catch (error) {
      setActionError(getStartPreparingErrorMessage(error));
    } finally {
      pendingOrderRef.current = "";
      setPendingOrderId("");
    }
  }

  const visibleOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return sortOldestAccepted(orders).filter((order) => {
      if (!normalizedQuery) {
        return true;
      }

      return [order.orderNumber, order.table, order.customer, order.notes]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [orders, query]);

  return (
    <section className={getManagerPageSectionClasses()}>
      <WaiterSurface settings={settings}>
        <span className="inline-flex rounded-full border border-blue-400/24 bg-blue-500/14 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-100">
          Chef workspace
        </span>
        <h2 className={cn("mt-5", getManagerPageTitleClasses())}>Orders</h2>
        <p className={getManagerPageSubtitleClasses(settings.scheme)}>
          Accepted orders for your restaurant, sorted oldest first.
        </p>
      </WaiterSurface>

      {actionMessage ? (
        <div className="rounded-lg border border-emerald-400/24 bg-emerald-500/12 px-4 py-3 text-sm font-medium text-emerald-200">
          {actionMessage}
        </div>
      ) : null}
      {actionError ? (
        <div className="rounded-lg border border-rose-400/24 bg-rose-500/12 px-4 py-3 text-sm font-medium text-rose-200">
          {actionError}
        </div>
      ) : null}

      <WaiterSurface settings={settings}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className={cn("flex h-11 min-w-0 items-center gap-2 rounded-lg border px-3 lg:w-[360px]", getSearchInputClasses(settings.topbar, settings.scheme))}>
            <SearchIcon className="size-4" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search orders, tables, customers..."
              className="w-full bg-transparent text-sm outline-none placeholder:inherit"
            />
          </label>
          <button type="button" onClick={() => void loadOrders()} className={cn(getManagerSecondaryButtonClasses(settings.scheme), "h-11 rounded-[14px] px-4 text-sm")}>
            Refresh
          </button>
        </div>

        <div className="mt-5">
          {isLoading ? <WaiterLoading settings={settings} /> : null}
          {errorMessage ? (
            <WaiterEmptyState settings={settings} title="Orders unavailable" message={errorMessage} />
          ) : visibleOrders.length ? (
            <ChefOrderTable
              settings={settings}
              orders={visibleOrders}
              mode="accepted"
              pendingOrderId={pendingOrderId}
              onStartPreparing={handleStartPreparing}
            />
          ) : (
            <WaiterEmptyState settings={settings} title="No accepted orders" message="Accepted restaurant orders will appear here for chefs to start preparing." />
          )}
        </div>
      </WaiterSurface>
    </section>
  );
}
