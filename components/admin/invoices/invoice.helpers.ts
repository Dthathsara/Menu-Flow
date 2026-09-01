/**
 * @file invoice.helpers.ts
 * @description Formatting, calculation, and normalization utilities for Admin Invoices.
 */

import type { AdminInvoice, AdminInvoiceStats, InvoiceStatus } from "./invoice.types";

/**
 * Parses any raw monetary input (number, string with currency prefixes/commas) into a valid number.
 * Returns 0 if input is null, undefined, or unparseable.
 *
 * @param value - The input value to parse into a numeric number.
 * @returns Parsed number or 0.
 */
export function parseAmount(value: unknown): number {
  if (typeof value === "number" && !isNaN(value)) {
    return value;
  }
  if (typeof value === "string") {
    const cleaned = value.replace(/[^\d.-]/g, "");
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

/**
 * Formats a numeric or string monetary value into standard LKR currency representation.
 * Handles null, undefined, and string numeric inputs safely.
 *
 * @param amount - The raw numeric amount or string to format.
 * @returns Formatted currency string, e.g. "Rs. 48,500.00" or "Rs. 0.00".
 *
 * @example
 * formatLKR(48500) // => "Rs. 48,500.00"
 * formatLKR("14500") // => "Rs. 14,500.00"
 * formatLKR(null) // => "Rs. 0.00"
 */
export function formatLKR(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === "") {
    return "Rs. 0.00";
  }

  const num = parseAmount(amount);

  const formatted = num.toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `Rs. ${formatted}`;
}

/**
 * Alias for formatLKR for exact currency display.
 */
export const formatExactCurrency = formatLKR;

/**
 * Formats a monetary value as full integer LKR currency representation with comma separators.
 * Does NOT use compact K/M/B notation.
 *
 * @param value - The numeric value to format.
 * @returns Formatted full currency string, e.g. "Rs. 6,000", "Rs. 44,100", "Rs. 0".
 */
export function formatFullCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return "Rs. 0";
  }

  const num = parseAmount(value);
  const formatted = Math.round(num).toLocaleString("en-US");

  return `Rs. ${formatted}`;
}

/**
 * Compact currency formatter using 'K' (thousands) and 'M' (millions) notation.
 * Used for summary stat cards to keep values legible.
 *
 * @param value - The numeric value to format.
 * @returns Formatted compact string, e.g. "Rs. 48.5K", "Rs. 2.4M", "Rs. 500".
 */
export function formatCompactCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return "Rs. 0";
  }

  if (value >= 1_000_000) {
    return `Rs. ${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }

  if (value >= 1_000) {
    return `Rs. ${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }

  return `Rs. ${value.toLocaleString("en-US")}`;
}

/**
 * Formats an ISO or raw date string into "MMM D, YYYY" format (e.g. "Aug 21, 2026").
 * Catches invalid date values safely and returns a fallback string.
 *
 * @param dateString - The raw date string or null/undefined value to format.
 * @returns Formatted date string or fallback "—".
 *
 * @example
 * formatInvoiceDate("2026-08-21T00:00:00Z") // => "Aug 21, 2026"
 * formatInvoiceDate(null) // => "—"
 */
export function formatInvoiceDate(dateString: string | null | undefined): string {
  if (!dateString || typeof dateString !== "string" || !dateString.trim()) {
    return "—";
  }

  const date = new Date(dateString.trim());
  if (isNaN(date.getTime())) {
    return dateString.trim() || "—";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Safely normalizes arbitrary status strings from API payloads into `InvoiceStatus`.
 * Performs case-insensitive matching and defaults to 'Pending' for unrecognized inputs.
 *
 * @param status - The raw status string from backend or input.
 * @returns Validated `InvoiceStatus` enum ('Paid' | 'Pending' | 'Overdue').
 */
export function normalizeInvoiceStatus(status: string | undefined | null): InvoiceStatus {
  if (!status || typeof status !== "string") {
    return "Pending";
  }

  const normalized = status.trim().toLowerCase();

  if (normalized === "paid" || normalized === "completed" || normalized === "active") {
    return "Paid";
  }

  if (normalized === "overdue" || normalized === "expired" || normalized === "failed") {
    return "Overdue";
  }

  return "Pending";
}

/**
 * Calculates metrics statistics (`monthlyTotalAmount`, `totalPaidAmount`, `totalPaidCount`,
 * `totalPendingAmount`, `totalPendingCount`) from an array of admin invoice records.
 *
 * @param invoices - List of admin invoices.
 * @returns Computed `AdminInvoiceStats` object.
 */
export function calculateInvoiceStats(invoices: AdminInvoice[]): AdminInvoiceStats {
  let monthlyTotalAmount = 0;
  let totalPaidAmount = 0;
  let totalPaidCount = 0;
  let totalPendingAmount = 0;
  let totalPendingCount = 0;

  for (const inv of invoices) {
    const amt = parseAmount(inv.amount);
    monthlyTotalAmount += amt;
    if (inv.status === "Paid") {
      totalPaidAmount += amt;
      totalPaidCount++;
    } else if (inv.status === "Pending") {
      totalPendingAmount += amt;
      totalPendingCount++;
    }
  }

  return {
    monthlyTotalAmount,
    totalPaidAmount,
    totalPaidCount,
    totalPendingAmount,
    totalPendingCount,
  };
}

/**
 * Filters an array of `AdminInvoice` records against a search query.
 * Matches against `invoiceId`, `clientName`, `manager.name`, `manager.email`, `amount`, and `status`.
 *
 * @param invoices - List of invoices to filter.
 * @param query - Search string from user input.
 * @returns Array of matching `AdminInvoice` records.
 */
export function filterAdminInvoices(invoices: AdminInvoice[], query: string): AdminInvoice[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return invoices;
  }

  return invoices.filter((invoice) => {
    const matchId = invoice.invoiceId.toLowerCase().includes(q);
    const matchClient = invoice.clientName.toLowerCase().includes(q);
    const matchManagerName = invoice.manager?.name ? invoice.manager.name.toLowerCase().includes(q) : false;
    const matchManagerEmail = invoice.manager?.email ? invoice.manager.email.toLowerCase().includes(q) : false;
    const matchAmount = String(invoice.amount).includes(q) || formatLKR(invoice.amount).toLowerCase().includes(q);
    const matchStatus = invoice.status.toLowerCase().includes(q);

    return matchId || matchClient || matchManagerName || matchManagerEmail || matchAmount || matchStatus;
  });
}

/**
 * Alias for filterAdminInvoices.
 */
export const filterInvoices = filterAdminInvoices;
