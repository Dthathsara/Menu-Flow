"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchManagerAccessStatus, type ManagerAccessStatus } from "@/lib/manager-invoices-api";

let inFlightStatusRequest: Promise<ManagerAccessStatus> | null = null;

function getManagerAccessStatusDeduplicated() {
  if (!inFlightStatusRequest) {
    inFlightStatusRequest = fetchManagerAccessStatus().finally(() => {
      inFlightStatusRequest = null;
    });
  }
  return inFlightStatusRequest;
}

let cachedStatus: { data: ManagerAccessStatus; timestamp: number } | null = null;

export function useManagerAccessStatus() {
  const [accessStatus, setAccessStatus] = useState<ManagerAccessStatus>({
    locked: false,
    status: "active",
  });
  const [isLoading, setIsLoading] = useState(false);

  const checkStatus = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && cachedStatus && now - cachedStatus.timestamp < 10000) {
      const data = cachedStatus.data;
      setAccessStatus((current) => {
        if (
          current.locked === data.locked &&
          current.status === data.status &&
          current.reason === data.reason &&
          current.pendingInvoiceId === data.pendingInvoiceId
        ) {
          return current;
        }
        return data;
      });
      return;
    }

    try {
      const status = await getManagerAccessStatusDeduplicated();
      cachedStatus = { data: status, timestamp: Date.now() };
      setAccessStatus((current) => {
        if (
          current.locked === status.locked &&
          current.status === status.status &&
          current.reason === status.reason &&
          current.pendingInvoiceId === status.pendingInvoiceId
        ) {
          return current;
        }
        return status;
      });
    } catch {
      // In case of network error, do not aggressively lock out
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void checkStatus();
    const handler = () => void checkStatus(true);
    window.addEventListener("menuflow:subscription-updated", handler);
    return () => window.removeEventListener("menuflow:subscription-updated", handler);
  }, [checkStatus]);

  return {
    ...accessStatus,
    isLoading,
    refetch: () => checkStatus(true),
  };
}
