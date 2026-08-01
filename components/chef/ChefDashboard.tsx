"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useManagerSettings } from "@/components/manager/useManagerSettings";
import { cn, getManagerSecondaryButtonClasses } from "@/components/manager/managerUtils";
import { WaiterEmptyState } from "@/components/waiter/WaiterEmptyState";
import { WaiterLoading } from "@/components/waiter/WaiterLoading";
import { fetchChefDashboardSummary } from "@/lib/chef-api";
import { ChefDashboardOverview } from "./ChefDashboardOverview";
import type { ChefDashboardSummary, ChefPageProps } from "./types";

function logChefPageError(error: unknown) {
  if (process.env.NODE_ENV === "development") {
    console.error(error);
  }
}

export function ChefDashboard() {
  const { settings } = useManagerSettings();
  const [summary, setSummary] = useState<ChefDashboardSummary | null>(null);
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
      setSummary(await fetchChefDashboardSummary());
    } catch (error) {
      logChefPageError(error);
      setSummary(null);
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
    acceptedOrders: [],
    myOrders: [],
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
