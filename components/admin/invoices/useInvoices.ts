/**
 * @file useInvoices.ts
 * @description Custom React hook encapsulating state management, concurrent API data fetching,
 * loading flags, and error handling for the Admin Invoices feature.
 */

import { useCallback, useEffect, useState } from "react";
import { getAdminClients, type AdminClient } from "@/lib/system-admin-api";
import { fetchAdminInvoices } from "@/lib/admin-invoices-api";
import { getApiErrorMessage } from "@/lib/error-handler";
import type {
  AdminInvoice,
  AdminInvoiceStats,
  ClientOption,
} from "./invoice.types";

/**
 * Initial empty metrics state before API load.
 */
const DEFAULT_STATS: AdminInvoiceStats = {
  monthlyTotalAmount: 0,
  totalPaidAmount: 0,
  totalPaidCount: 0,
  totalPendingAmount: 0,
  totalPendingCount: 0,
};

/**
 * Custom hook returning Admin Invoices state, clients options, loading state, error text, and refetch handler.
 */
export function useInvoices(searchQuery = "", statusFilter = "") {
  const [invoices, setInvoices] = useState<AdminInvoice[]>([]);
  const [stats, setStats] = useState<AdminInvoiceStats>(DEFAULT_STATS);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Concurrently loads invoices and client dropdown options using Promise.all.
   */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [invoiceRes, rawClients] = await Promise.all([
        fetchAdminInvoices({ search: searchQuery, status: statusFilter }),
        getAdminClients().catch(() => [] as AdminClient[]),
      ]);

      setInvoices(invoiceRes.invoices);
      setStats(invoiceRes.stats);

      const clientOptions: ClientOption[] = rawClients.map((c) => ({
        id: c.tenantId || c.restaurantId || c.id,
        name: c.restaurantName || "Unnamed Restaurant",
        ownerName: c.ownerName || "Manager",
        email: c.loginEmail || c.businessEmail || "",
      }));
      setClients(clientOptions);
    } catch (err) {
      const message = getApiErrorMessage(err, "Unable to load invoice data from backend server.");
      setError(message);
      setInvoices([]);
      setStats(DEFAULT_STATS);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    invoices,
    stats,
    clients,
    isLoading,
    error,
    loadData,
  };
}
