/**
 * @file invoice.schema.ts
 * @description Frontend validation schema and helper validators for Admin Invoices.
 * Aligns strictly with backend NestJS DTO validation rules (`class-validator` decorators like `@IsNotEmpty`, `@IsUUID`, `@IsNumber`, `@IsPositive`, `@IsEnum`, `@IsDateString`).
 */

import type { CreateAdminInvoicePayload, InvoiceStatus, UpdateAdminInvoicePayload } from "./invoice.types";

/**
 * Result structure returned by schema validation methods.
 */
export interface ValidationResult<T> {
  /** True if payload passed validation */
  success: boolean;
  /** Parsed payload object if valid */
  data?: T;
  /** Map of field names to error messages if invalid */
  errors?: Record<string, string>;
}

/**
 * UUID regex pattern for verifying clientId database identifiers.
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validates a payload for creating a new invoice.
 * Matches backend `CreateInvoiceDto` validation rules.
 */
export const createInvoiceSchema = {
  /**
   * Safely parses and validates creation input.
   */
  safeParse(input: unknown): ValidationResult<CreateAdminInvoicePayload> {
    const errors: Record<string, string> = {};
    if (typeof input !== "object" || input === null) {
      return { success: false, errors: { _form: "Invalid form input object." } };
    }

    const record = input as Record<string, unknown>;

    const invoiceId = String(record.invoiceId ?? "").trim();
    if (!invoiceId) {
      errors.invoiceId = "Invoice ID is required and cannot be empty.";
    }

    const clientId = String(record.clientId ?? "").trim();
    if (!clientId) {
      errors.clientId = "Please select a valid client/restaurant.";
    } else if (clientId.length > 10 && !UUID_REGEX.test(clientId) && !/^[a-z0-9_-]+$/i.test(clientId)) {
      errors.clientId = "Selected client ID format is invalid.";
    }

    const amountNum = typeof record.amount === "number"
      ? record.amount
      : parseFloat(String(record.amount ?? "").replace(/[^\d.-]/g, ""));
    
    if (isNaN(amountNum) || amountNum <= 0) {
      errors.amount = "Amount must be a positive number greater than 0.";
    }

    const dueDate = String(record.dueDate ?? "").trim();
    if (!dueDate) {
      errors.dueDate = "Due date is required.";
    } else if (isNaN(Date.parse(dueDate))) {
      errors.dueDate = "Please provide a valid date format.";
    }

    const statusStr = String(record.status ?? "").trim();
    if (!statusStr || !["Paid", "Pending", "Overdue"].includes(statusStr)) {
      errors.status = "Status must be 'Paid', 'Pending', or 'Overdue'.";
    }

    if (Object.keys(errors).length > 0) {
      return { success: false, errors };
    }

    return {
      success: true,
      data: {
        invoiceId,
        clientId,
        amount: amountNum,
        dueDate,
        status: statusStr as InvoiceStatus,
        planName: record.planName ? String(record.planName) : undefined,
        packageId: record.packageId ? String(record.packageId) : undefined,
        billingCycle: record.billingCycle ? String(record.billingCycle) : undefined,
      },
    };
  },

  /**
   * Throws Error with validation details if payload fails.
   */
  parse(input: unknown): CreateAdminInvoicePayload {
    const res = this.safeParse(input);
    if (!res.success || !res.data) {
      const msg = Object.values(res.errors || {}).join(" ") || "Validation failed.";
      throw new Error(msg);
    }
    return res.data;
  },
};

/**
 * Validates a payload for updating an existing invoice.
 * Matches backend `UpdateInvoiceDto` validation rules.
 */
export const updateInvoiceSchema = {
  /**
   * Safely parses and validates update input.
   */
  safeParse(input: unknown): ValidationResult<UpdateAdminInvoicePayload> {
    const errors: Record<string, string> = {};
    if (typeof input !== "object" || input === null) {
      return { success: false, errors: { _form: "Invalid update input object." } };
    }

    const record = input as Record<string, unknown>;

    let invoiceId: string | undefined;
    if (record.invoiceId !== undefined) {
      invoiceId = String(record.invoiceId).trim();
      if (!invoiceId) {
        errors.invoiceId = "Invoice ID cannot be empty.";
      }
    }

    let clientId: string | undefined;
    if (record.clientId !== undefined) {
      clientId = String(record.clientId).trim();
      if (!clientId) {
        errors.clientId = "Client ID cannot be empty.";
      }
    }

    let amountNum: number | undefined;
    if (record.amount !== undefined) {
      amountNum = typeof record.amount === "number"
        ? record.amount
        : parseFloat(String(record.amount).replace(/[^\d.-]/g, ""));
      if (isNaN(amountNum) || amountNum <= 0) {
        errors.amount = "Amount must be a positive number greater than 0.";
      }
    }

    let dueDate: string | undefined;
    if (record.dueDate !== undefined) {
      dueDate = String(record.dueDate).trim();
      if (!dueDate || isNaN(Date.parse(dueDate))) {
        errors.dueDate = "Due date must be a valid date.";
      }
    }

    let statusStr: InvoiceStatus | undefined;
    if (record.status !== undefined) {
      const s = String(record.status).trim();
      if (!["Paid", "Pending", "Overdue"].includes(s)) {
        errors.status = "Status must be 'Paid', 'Pending', or 'Overdue'.";
      } else {
        statusStr = s as InvoiceStatus;
      }
    }

    if (Object.keys(errors).length > 0) {
      return { success: false, errors };
    }

    return {
      success: true,
      data: {
        ...(invoiceId !== undefined && { invoiceId }),
        ...(clientId !== undefined && { clientId }),
        ...(amountNum !== undefined && { amount: amountNum }),
        ...(dueDate !== undefined && { dueDate }),
        ...(statusStr !== undefined && { status: statusStr }),
        ...(record.planName !== undefined && { planName: String(record.planName) }),
        ...(record.packageId !== undefined && { packageId: String(record.packageId) }),
        ...(record.billingCycle !== undefined && { billingCycle: String(record.billingCycle) }),
      },
    };
  },

  /**
   * Throws Error with validation details if payload fails.
   */
  parse(input: unknown): UpdateAdminInvoicePayload {
    const res = this.safeParse(input);
    if (!res.success || !res.data) {
      const msg = Object.values(res.errors || {}).join(" ") || "Validation failed.";
      throw new Error(msg);
    }
    return res.data;
  },
};

export type CreateInvoiceInput = CreateAdminInvoicePayload;
export type UpdateInvoiceInput = UpdateAdminInvoicePayload;
