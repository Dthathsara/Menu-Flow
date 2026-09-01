/**
 * @file invoice.types.ts
 * @description Comprehensive TypeScript type definitions for the Admin Invoices feature,
 * matching the NestJS backend controllers, DTOs, and Prisma database schema contracts.
 */

import type { AdminScheme, AdminModalMode } from "../common/adminTypes";

/**
 * Valid payment statuses supported by the backend invoice system.
 * Maps to Prisma `InvoiceStatus` enum in backend.
 */
export type InvoiceStatus = "Paid" | "Pending" | "Overdue";

/**
 * Manager/account relationship data attached to an invoice.
 * Maps to the relational `User` model representing the restaurant owner or manager.
 */
export interface AdminInvoiceManager {
  /** Unique primary key UUID of the manager user */
  id: string;
  /** Full name of the manager */
  name: string;
  /** Primary contact/login email address */
  email: string;
  /** Optional contact phone number */
  phone?: string;
}

/**
 * Complete Admin Invoice record structure returned by the API.
 * Maps directly to backend `Invoice` Prisma model with client/manager relations.
 */
export interface AdminInvoice {
  /** Primary key UUID of the invoice database record */
  id: string;
  /** Public human-readable invoice reference identifier (e.g., INV-2026-001) */
  invoiceId: string;
  /** Foreign key UUID pointing to the client/restaurant user account */
  clientId: string;
  /** Display name of the restaurant or client business */
  clientName: string;
  /** Relational manager details or null if unassigned */
  manager: AdminInvoiceManager | null;
  /** Invoice total numeric amount in LKR */
  amount: number;
  /** Formatted or ISO date string representing the payment due date */
  dueDate: string;
  /** Formatted or ISO date string representing the invoice billing issue date */
  billingDate: string;
  /** Current payment status */
  status: InvoiceStatus;
  /** Optional name of the subscription plan associated with this invoice */
  planName?: string;
  /** Optional package identifier UUID or code */
  packageId?: string;
  /** Optional billing frequency cycle (e.g. Monthly, Yearly) */
  billingCycle?: string;
  /** ISO timestamp when the invoice record was created */
  createdAt: string;
  /** ISO timestamp when the invoice record was last updated */
  updatedAt: string;
}

/**
 * Summary metrics for the Admin Invoices dashboard tab.
 * Calculated or returned from backend invoice aggregator endpoints.
 */
export interface AdminInvoiceStats {
  /** Sum total value of all invoices issued for the current period */
  monthlyTotalAmount: number;
  /** Sum total value of all paid invoices */
  totalPaidAmount: number;
  /** Count of paid invoices */
  totalPaidCount: number;
  /** Sum total value of pending invoices */
  totalPendingAmount: number;
  /** Count of pending invoices */
  totalPendingCount: number;
}

/**
 * API response payload for GET `/admin_invoice` endpoint.
 */
export interface AdminInvoiceListResponse {
  /** Array of invoice records returned by query */
  invoices: AdminInvoice[];
  /** Aggregated statistics object */
  stats: AdminInvoiceStats;
  /** Optional total count of matching database records */
  total?: number;
}

/**
 * DTO payload required to create a new invoice via POST `/admin_invoice`.
 * Matches backend `CreateInvoiceDto`.
 */
export interface CreateAdminInvoicePayload {
  /** Human-readable invoice identifier */
  invoiceId: string;
  /** Foreign key UUID of target client/restaurant */
  clientId: string;
  /** Numeric invoice amount in LKR (must be > 0) */
  amount: number;
  /** ISO/Date string for payment due date */
  dueDate: string;
  /** Payment status */
  status: InvoiceStatus;
  /** Optional plan name label */
  planName?: string;
  /** Optional package identifier */
  packageId?: string;
  /** Optional billing cycle label */
  billingCycle?: string;
}

/**
 * DTO payload for updating an invoice via PATCH `/admin_invoice/:id`.
 * Matches backend `UpdateInvoiceDto`.
 */
export type UpdateAdminInvoicePayload = Partial<CreateAdminInvoicePayload>;

/**
 * Option item for client dropdown selectors in invoice forms.
 */
export interface ClientOption {
  /** Client database UUID */
  id: string;
  /** Restaurant or business name */
  name: string;
  /** Owner/Manager full name */
  ownerName: string;
  /** Primary contact email address */
  email: string;
}

/**
 * Modal display mode.
 * Alias matching `AdminModalMode` from common admin types.
 */
export type InvoiceModalMode = "add" | "edit" | "delete";

export type { AdminScheme, AdminModalMode };
