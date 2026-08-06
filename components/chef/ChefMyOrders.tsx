"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SearchIcon } from "@/components/manager/icons";
import {
  cn,
  getManagerPageSectionClasses,
  getManagerPageSubtitleClasses,
  getManagerPageTitleClasses,
  getManagerTextInputClasses,
  getSearchInputClasses,
} from "@/components/manager/managerUtils";
import { useManagerSettings } from "@/components/manager/useManagerSettings";
import { WaiterEmptyState } from "@/components/waiter/WaiterEmptyState";
import { WaiterLoading } from "@/components/waiter/WaiterLoading";
import { getWorkspaceBadgeClasses, WaiterSurface } from "@/components/waiter/waiter-utils";
import {
  fetchChefMyOrders,
  moveChefOrderToDelivered,
  moveChefOrderToReady,
} from "@/lib/chef-api";
import { getApiErrorMessage } from "@/lib/error-handler";
import { ChefOrderTable } from "./ChefOrderTable";
import type { ChefOrder, ChefOrderStatus } from "./types";

const STATUS_OPTIONS: Array<"all" | ChefOrderStatus> = ["all", "preparing", "ready", "delivered"];

function statusRank(status: ChefOrderStatus) {
  if (status === "preparing") {
    return 0;
  }

  if (status === "ready") {
    return 1;
  }

  if (status === "delivered") {
    return 2;
  }

  return 3;
}

function logChefPageError(error: unknown) {
  if (process.env.NODE_ENV === "development") {
    console.error(error);
  }
}

export function ChefMyOrders() {
  const { settings } = useManagerSettings();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | ChefOrderStatus>("all");
  const [orders, setOrders] = useState<ChefOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [pendingOrderId, setPendingOrderId] = useState("");
  const loadingRef = useRef(false);

  const loadOrders = useCallback(async () => {
    if (loadingRef.current) {
      return;
    }

    loadingRef.current = true;
    setIsLoading(true);
    setErrorMessage("");

    try {
      setOrders(await fetchChefMyOrders());
    } catch (error) {
      logChefPageError(error);
      setOrders([]);
      setErrorMessage(getApiErrorMessage(error, "Unable to load assigned orders. Please try again."));
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  async function runStatusAction(orderId: string, action: () => Promise<ChefOrder>, successMessage: string) {
    if (pendingOrderId) {
      return;
    }

    setPendingOrderId(orderId);
    setActionMessage("");
    setActionError("");

    try {
      const updatedOrder = await action();
      setOrders((current) => current.map((order) => (order.id === orderId ? updatedOrder : order)));
      setActionMessage(successMessage);
    } catch (error) {
      logChefPageError(error);
      setActionError(getApiErrorMessage(error, "Unable to update this order."));
    } finally {
      setPendingOrderId("");
    }
  }

  const visibleOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return [...orders]
      .sort((left, right) => {
        const statusSort = statusRank(left.status) - statusRank(right.status);
        if (statusSort !== 0) {
          return statusSort;
        }

        return (Date.parse(left.acceptedAt || left.time) || 0) - (Date.parse(right.acceptedAt || right.time) || 0);
      })
      .filter((order) => {
        const matchesStatus = status === "all" || order.status === status;
        const matchesQuery =
          !normalizedQuery ||
          [order.orderNumber, order.table, order.customer, order.notes]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);

        return matchesStatus && matchesQuery;
      });
  }, [orders, query, status]);

  return (
    <section className={getManagerPageSectionClasses()}>
      <WaiterSurface settings={settings}>
        <span className={getWorkspaceBadgeClasses(settings.scheme)}>
          Chef workspace
        </span>
        <h2 className={cn("mt-5", getManagerPageTitleClasses())}>My Orders</h2>
        <p className={getManagerPageSubtitleClasses(settings.scheme)}>
          Only orders assigned to your chef account are shown here.
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
              placeholder="Search my orders..."
              className="w-full bg-transparent text-sm outline-none placeholder:inherit"
            />
          </label>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as "all" | ChefOrderStatus)}
            className={cn(getManagerTextInputClasses(settings.scheme), "h-11 lg:w-52")}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option} className="capitalize">
                {option === "all" ? "All statuses" : option}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-5">
          {isLoading ? <WaiterLoading settings={settings} /> : null}
          {errorMessage ? (
            <WaiterEmptyState settings={settings} title="My Orders unavailable" message={errorMessage} />
          ) : visibleOrders.length ? (
            <ChefOrderTable
              settings={settings}
              orders={visibleOrders}
              mode="assigned"
              pendingOrderId={pendingOrderId}
              onMoveToReady={(orderId) => runStatusAction(orderId, () => moveChefOrderToReady(orderId), "Order marked ready.")}
              onMoveToDelivered={(orderId) => runStatusAction(orderId, () => moveChefOrderToDelivered(orderId), "Order marked delivered.")}
            />
          ) : (
            <WaiterEmptyState settings={settings} title="No assigned orders" message="Orders you start preparing will appear here." />
          )}
        </div>
      </WaiterSurface>
    </section>
  );
}
