"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useManagerSettings } from "@/components/manager/useManagerSettings";
import { cn, getManagerSecondaryButtonClasses } from "@/components/manager/managerUtils";
import { WaiterEmptyState } from "@/components/waiter/WaiterEmptyState";
import { WaiterLoading } from "@/components/waiter/WaiterLoading";
import {
  fetchChefAcceptedOrders,
  fetchChefDashboardSummary,
  fetchChefMyOrders,
} from "@/lib/chef-api";
import { ChefDashboardOverview } from "./ChefDashboardOverview";
import type { ChefDashboardSummary, ChefOrder, ChefPageProps } from "./types";

function logChefPageError(error: unknown) {
  if (process.env.NODE_ENV === "development") {
    console.error(error);
  }
}

const EMPTY_CHEF_DASHBOARD_SUMMARY: ChefDashboardSummary = {
  acceptedOrdersToday: 0,
  myPreparingOrders: 0,
  readyOrders: 0,
  completedToday: 0,
  averagePreparationTimeMinutes: 0,
  statusCounts: {
    accepted: 0,
    preparing: 0,
    ready: 0,
    delivered: 0,
  },
  recentOrders: [],
  hourlyActivity: [],
  topItems: [],
};

export function ChefDashboard() {
  const { settings } = useManagerSettings();
  const [summary, setSummary] = useState<ChefDashboardSummary | null>(null);
  const [acceptedOrders, setAcceptedOrders] = useState<ChefOrder[]>([]);
  const [myOrders, setMyOrders] = useState<ChefOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const loadingRef = useRef(false);

  const loadSummary = useCallback(async () => {
    if (loadingRef.current) {
      return;
    }

    loadingRef.current = true;
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [summaryResult, acceptedOrdersResult, myOrdersResult] = await Promise.allSettled([
        fetchChefDashboardSummary(),
        fetchChefAcceptedOrders(),
        fetchChefMyOrders(),
      ]);
      const nextSummary =
        summaryResult.status === "fulfilled"
          ? summaryResult.value
          : EMPTY_CHEF_DASHBOARD_SUMMARY;
      const nextAcceptedOrders =
        acceptedOrdersResult.status === "fulfilled" ? acceptedOrdersResult.value : [];
      const nextMyOrders =
        myOrdersResult.status === "fulfilled" ? myOrdersResult.value : [];

      if (
        summaryResult.status === "rejected" &&
        acceptedOrdersResult.status === "rejected" &&
        myOrdersResult.status === "rejected"
      ) {
        throw summaryResult.reason;
      }

      setAcceptedOrders(nextAcceptedOrders);
      setMyOrders(nextMyOrders);
      setSummary(deriveChefDashboardSummary(nextSummary, nextAcceptedOrders, nextMyOrders));
    } catch (error) {
      logChefPageError(error);
      setSummary(null);
      setAcceptedOrders([]);
      setMyOrders([]);
      setErrorMessage("Unable to load chef dashboard. Please try again.");
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  if (errorMessage) {
    return (
      <div className="space-y-4">
        <WaiterEmptyState
          settings={settings}
          title="Chef dashboard unavailable"
          message={errorMessage}
        />
        <button type="button" onClick={() => void loadSummary()} className={cn(getManagerSecondaryButtonClasses(settings.scheme), "px-4")}>
          Retry
        </button>
      </div>
    );
  }

  if (isLoading && !summary) {
    return <WaiterLoading settings={settings} />;
  }

  const pageProps: ChefPageProps = {
    settings,
    summary,
    acceptedOrders,
    myOrders,
    tables: [],
    isLoading,
    errorMessage: "",
    actionMessage: "",
    actionError: "",
    pendingOrderId: "",
    onRefresh: loadSummary,
    onStartPreparing: async () => undefined,
    onMoveToReady: async () => undefined,
    onMoveToDelivered: async () => undefined,
  };

  return <ChefDashboardOverview {...pageProps} />;
}

function isToday(value: string) {
  if (!value) {
    return true;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return true;
  }

  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function deriveChefDashboardSummary(
  summary: ChefDashboardSummary,
  acceptedOrders: ChefOrder[],
  myOrders: ChefOrder[],
): ChefDashboardSummary {
  const acceptedToday = acceptedOrders.filter((order) =>
    isToday(order.acceptedAt || order.time),
  ).length;
  const preparingMine = myOrders.filter((order) => order.status === "preparing").length;
  const readyMine = myOrders.filter((order) => order.status === "ready").length;
  const deliveredToday = myOrders.filter(
    (order) => order.status === "delivered" && isToday(order.updatedAt || order.time),
  ).length;
  const statusCounts = {
    accepted: Math.max(summary.statusCounts.accepted, acceptedToday),
    preparing: Math.max(summary.statusCounts.preparing, preparingMine),
    ready: Math.max(summary.statusCounts.ready, readyMine),
    delivered: Math.max(summary.statusCounts.delivered, deliveredToday),
  };

  return {
    ...summary,
    acceptedOrdersToday: Math.max(summary.acceptedOrdersToday, acceptedToday),
    myPreparingOrders: Math.max(summary.myPreparingOrders, preparingMine),
    readyOrders: Math.max(summary.readyOrders, readyMine),
    completedToday: Math.max(summary.completedToday, deliveredToday),
    statusCounts,
  };
}
