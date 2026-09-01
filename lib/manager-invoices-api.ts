import { API_BASE_URL } from "@/lib/api-config";
import {
  ApiResponseError,
  authFetch,
  NetworkError,
  SessionExpiredError,
} from "@/lib/auth-session";
import { PLAN_CATALOG, PLAN_ORDER } from "@/components/manager/invoices/invoice.data";
import {
  buildPaymentMethodLabel,
  formatCurrency,
  formatDisplayDate,
  formatShortDate,
} from "@/components/manager/invoices/invoice.helpers";
import type {
  BillingProfile,
  InvoiceRecord,
  InvoiceStatus,
  ManagerInvoicesPageData,
  PaymentMethodRecord,
  PlanChangeResult,
  RenewSubscriptionPayload,
  SubscriptionPlan,
  UpdatePaymentMethodPayload,
} from "@/components/manager/invoices/invoice.types";

type ApiRecord = Record<string, unknown>;

export class ManagerInvoicesApiError extends Error {
  constructor(message = "Unable to load invoice data. Please try again.") {
    super(message);
    this.name = "ManagerInvoicesApiError";
  }
}

export class SubscriptionPaymentRequiredError extends Error {
  constructor(message = "Your subscription payment is overdue. Complete payment to restore access.") {
    super(message);
    this.name = "SubscriptionPaymentRequiredError";
  }
}

export interface ManagerAccessStatus {
  locked: boolean;
  status: string;
  reason?: string;
  pendingInvoiceId?: string;
}

export interface PayInvoicePayload {
  invoiceId?: string;
  paymentMethodId?: string;
  cardNumber?: string;
  holderName?: string;
  expiryDate?: string;
  cvc?: string;
  billingEmail?: string;
}



function isRecord(value: unknown): value is ApiRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = "") {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^\d.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function asLimit(value: unknown) {
  const number = asNumber(value);
  return number && number > 0 ? number : null;
}

function unwrapPayload(payload: unknown) {
  return isRecord(payload) && "data" in payload ? payload.data : payload;
}

function unwrapList(payload: unknown, keys: string[]) {
  const data = unwrapPayload(payload);
  if (Array.isArray(data)) return data;
  if (!isRecord(data)) return [];
  for (const key of keys) {
    if (Array.isArray(data[key])) return data[key] as unknown[];
  }
  return [];
}

function unwrapItem(payload: unknown, keys: string[]) {
  const data = unwrapPayload(payload);
  if (!isRecord(data)) return data;
  for (const key of keys) {
    if (isRecord(data[key])) return data[key];
  }
  return data;
}

async function readJson(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function extractApiMessage(payload: unknown): string {
  if (typeof payload === "string") return payload;
  if (Array.isArray(payload)) return payload.map(extractApiMessage).filter(Boolean).join("\n");
  if (!isRecord(payload)) return "";
  return (
    extractApiMessage(payload.message) ||
    extractApiMessage(payload.error) ||
    extractApiMessage(payload.errors)
  );
}

function mapApiError(error: unknown, fallback?: string) {
  if (error instanceof SessionExpiredError) return error;
  if (error instanceof SubscriptionPaymentRequiredError) return error;
  if (error instanceof NetworkError) {
    return new ManagerInvoicesApiError(
      "Unable to connect to the server. Please make sure the backend is running.",
    );
  }
  if (error instanceof ApiResponseError) {
    if (
      error.status === 402 ||
      (isRecord(error.data) && (error.data.code === "SUBSCRIPTION_PAYMENT_REQUIRED" || error.data.status === 402))
    ) {
      return new SubscriptionPaymentRequiredError(extractApiMessage(error.data) || error.message);
    }
    return new ManagerInvoicesApiError(
      extractApiMessage(error.response.data) || error.message || fallback,
    );
  }
  if (error instanceof ManagerInvoicesApiError) return error;
  if (error instanceof Error) return new ManagerInvoicesApiError(error.message || fallback);
  return new ManagerInvoicesApiError(fallback);
}

const inFlightRequests = new Map<string, Promise<unknown>>();

async function requestInvoices(path: string, init: RequestInit = {}) {
  const method = (init.method || "GET").toUpperCase();
  const cacheKey = `${method}:${path}`;

  if (method === "GET" && inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey)!;
  }

  const promise = (async () => {
    try {
      const response = await authFetch(`${API_BASE_URL}${path}`, {
        cache: "no-store",
        ...init,
        headers: init.headers,
      });
      const data = await readJson(response);
      if (!response.ok) {
        if (
          response.status === 402 ||
          (isRecord(data) && (data.code === "SUBSCRIPTION_PAYMENT_REQUIRED" || data.status === 402))
        ) {
          throw new SubscriptionPaymentRequiredError(extractApiMessage(data) || "Subscription payment required.");
        }
        throw new ApiResponseError(
          extractApiMessage(data) || "Invoice request failed.",
          response,
          data,
          `${API_BASE_URL}${path}`,
        );
      }
      return data;
    } catch (error) {
      throw mapApiError(error);
    } finally {
      if (method === "GET") {
        inFlightRequests.delete(cacheKey);
      }
    }
  })();

  if (method === "GET") {
    inFlightRequests.set(cacheKey, promise);
  }

  return promise;
}

function nested(record: ApiRecord, keys: string[]) {
  for (const key of keys) {
    if (isRecord(record[key])) return record[key] as ApiRecord;
  }
  return {};
}

function normalizePlanId(value: unknown) {
  return asString(value).trim().toLowerCase().replace(/\s+/g, "-");
}

function getBillingProfile(source: unknown, fallback?: BillingProfile): BillingProfile {
  const record = isRecord(source) ? source : {};
  const restaurant = nested(record, ["restaurant", "tenant", "business"]);
  return {
    restaurantName: asString(
      record.restaurantName ??
      record.restaurant_name ??
      record.name ??
      restaurant.name ??
      restaurant.restaurantName ??
      restaurant.restaurant_name,
      fallback?.restaurantName || "MenuFlow Restaurant",
    ),
    restaurantAddress: asString(
      record.restaurantAddress ??
      record.restaurant_address ??
      record.address ??
      record.location ??
      restaurant.address ??
      restaurant.location,
      fallback?.restaurantAddress || "Address unavailable",
    ),
    billingEmail: asString(
      record.billingEmail ??
      record.billing_email ??
      record.email ??
      restaurant.billingEmail ??
      restaurant.billing_email ??
      restaurant.email,
      fallback?.billingEmail || "",
    ),
  };
}

function normalizeStatus(value: unknown): InvoiceStatus {
  const status = asString(value).trim().toLowerCase().replace(/[_-]/g, " ");
  if (status === "paid") return "Paid";
  if (status === "pending" || status === "unpaid") return "Pending";
  if (status === "overdue") return "Overdue";
  if (status === "failed") return "Failed";
  if (status === "cancelled" || status === "canceled") return "Cancelled";
  if (status === "draft") return "Draft";
  return "Pending";
}

function mapPlan(payload: unknown, context: ApiRecord = {}): SubscriptionPlan {
  const plan = isRecord(payload) ? payload : {};
  const subscription = nested(context, ["subscription", "currentSubscription", "current_subscription"]);
  const usage = nested(context, ["usage"]);
  const rawId = asString(
    plan.id ??
    plan.code ??
    plan.planId ??
    plan.plan_id ??
    plan.packageId ??
    plan.package_id ??
    subscription.planId ??
    subscription.plan_id ??
    subscription.packageId ??
    subscription.package_id,
  );
  const planId = rawId || "current";
  const catalogKey = planId.toLowerCase();
  const catalog = PLAN_CATALOG[catalogKey];
  const label = asString(plan.label ?? plan.name ?? plan.packageName ?? plan.package_name ?? plan.planName ?? plan.plan_name, catalog?.label || planId);
  const planName = asString(plan.planName ?? plan.plan_name ?? plan.packageName ?? plan.package_name ?? plan.name, catalog?.planName || label);

  const baseAmount = asNumber(
    plan.price ?? plan.amount ?? plan.baseAmount ?? plan.base_amount ?? plan.monthlyPrice ?? plan.monthly_price ?? subscription.price ?? subscription.amount ?? subscription.baseAmount ?? subscription.base_amount,
  );
  const taxAmount = asNumber(
    plan.taxService ?? plan.tax_service ?? plan.taxServiceAmount ?? plan.tax_service_amount ?? context.taxService ?? context.tax_service ?? context.taxAmount ?? context.tax_amount ?? subscription.taxService ?? subscription.tax_service ?? subscription.taxAmount ?? subscription.tax_amount,
  );
  const discountAmount = asNumber(
    plan.discount ?? plan.discountAmount ?? plan.discount_amount ?? context.discount ?? context.discountAmount ?? context.discount_amount ?? subscription.discount ?? subscription.discount_amount,
  );
  const totalAmount = asNumber(
    plan.total ?? plan.totalAmount ?? plan.total_amount ?? context.total ?? context.totalAmount ?? context.total_amount ?? context.amountDue ?? context.amount_due ?? subscription.total ?? subscription.totalAmount ?? subscription.total_amount ?? subscription.amountDue ?? subscription.amount_due,
  );

  const cycle = asString(plan.billingCycle ?? plan.billing_cycle ?? subscription.billingCycle ?? subscription.billing_cycle, "Monthly");
  const nextRenewalRaw = asString(
    plan.nextRenewal ?? plan.next_renewal ?? context.nextRenewal ?? context.next_renewal ?? context.nextRenewalAt ?? context.next_renewal_at ?? subscription.nextRenewal ?? subscription.next_renewal ?? subscription.nextRenewalAt ?? subscription.next_renewal_at ?? subscription.currentPeriodEnd ?? subscription.current_period_end,
  );
  const startedRaw = asString(
    plan.startedDate ?? plan.started_date ?? context.startedDate ?? context.started_date ?? context.startedAt ?? context.started_at ?? subscription.startedDate ?? subscription.started_at ?? subscription.currentPeriodStart ?? subscription.current_period_start,
  );
  const usageLocations = nested(usage, ["locations"]);
  const usageQrTables = nested(usage, ["qrTables", "qr_tables"]);
  const profile = getBillingProfile(context.billingProfile ?? context.billing_profile ?? context);

  const parsedFeatures = Array.isArray(plan.features)
    ? plan.features.map((feature) => asString(feature)).filter(Boolean)
    : typeof plan.features === "string"
      ? plan.features.split(/[\n,]/).map((f) => f.trim()).filter(Boolean)
      : catalog?.features ?? [];

  return {
    id: planId,
    packageId: planId,
    price: baseAmount ?? 0,
    tier: asNumber(plan.tier ?? plan.sortOrder ?? plan.sort_order) ?? catalog?.tier ?? 0,
    label,
    planName,
    billingLabel: asString(plan.billingLabel ?? plan.billing_label, `${label} ${cycle}`),
    priceDisplay: formatCurrency(baseAmount, asString(plan.priceDisplay ?? plan.price_display, "Custom")),
    priceUnit: asString(plan.priceUnit ?? plan.price_unit, cycle.toLowerCase() === "monthly" ? "/mo" : ""),
    headlineDescription: asString(plan.headlineDescription ?? plan.headline_description ?? plan.description, catalog?.headlineDescription || "MenuFlow subscription package."),
    currentPackageDescription: asString(plan.currentPackageDescription ?? plan.current_package_description ?? plan.description, catalog?.currentPackageDescription || "MenuFlow subscription package."),
    billingCycle: cycle,
    billingCycleDescription: asString(plan.billingCycleDescription ?? plan.billing_cycle_description, cycle ? `Auto-renewed every ${cycle.toLowerCase()} cycle.` : "Billing cycle from your subscription."),
    nextRenewal: formatShortDate(nextRenewalRaw),
    nextRenewalDescription: nextRenewalRaw ? `Subscription renews on ${formatDisplayDate(nextRenewalRaw)}.` : "Renewal date will be shown once scheduled.",
    amountDue: formatCurrency(totalAmount, asString(context.amountDueDisplay ?? context.amount_due_display, "Custom Quote")),
    amountDueDescription: "Including tax, service charges, and discounts.",
    taxDisplay: formatCurrency(taxAmount, asString(context.taxDisplay ?? context.tax_display, "Custom")),
    discountDisplay: formatCurrency(discountAmount ?? 0, asString(context.discountDisplay ?? context.discount_display, "Rs. 0")),
    totalDisplay: formatCurrency(totalAmount, asString(context.totalDisplay ?? context.total_display, "Custom Quote")),
    packageType: cycle,
    startedDate: formatDisplayDate(startedRaw),
    renewalDate: formatDisplayDate(nextRenewalRaw),
    restaurantName: profile.restaurantName,
    usage: {
      locations: {
        used: asNumber(usageLocations.used ?? usage.locationsUsed ?? usage.locations_used ?? context.locationsUsed ?? context.locations_used) ?? 0,
        limit: asLimit(usageLocations.limit ?? usage.locationsLimit ?? usage.locations_limit ?? plan.locationsLimit ?? plan.locations_limit ?? plan.locationLimit ?? plan.location_limit),
      },
      qrTables: {
        used: asNumber(usageQrTables.used ?? usage.qrTablesUsed ?? usage.qr_tables_used ?? context.qrTablesUsed ?? context.qr_tables_used) ?? 0,
        limit: asLimit(usageQrTables.limit ?? usage.qrTablesLimit ?? usage.qr_tables_limit ?? plan.qrTablesLimit ?? plan.qr_tables_limit ?? plan.qrTableLimit ?? plan.qr_table_limit),
      },
    },
    renewalNoticeTitle: nextRenewalRaw ? `Your package renews automatically on ${formatDisplayDate(nextRenewalRaw)}.` : "Your package renewal will appear here once scheduled.",
    renewalNoticeBody: "Keep your payment method active to avoid QR menu or dashboard interruptions.",
    features: parsedFeatures,
    latestInvoiceId: asString(context.latestInvoiceId ?? context.latest_invoice_id),
    latestBillingDate: formatDisplayDate(asString(context.latestBillingDate ?? context.latest_billing_date)),
    latestRenewalDate: formatDisplayDate(nextRenewalRaw),
    changePlanLabel: `${label} - ${formatCurrency(baseAmount, "Custom pricing")}`,
    invoiceLineLabel: asString(plan.invoiceLineLabel ?? plan.invoice_line_label, `MenuFlow ${label} Plan`),
    invoiceCycle: cycle,
    invoiceLineAmount: formatCurrency(baseAmount, "Custom"),
  };
}

function formatFormattedInvoiceNumber(rawNumber: string, rawId: string): string {
  const source = rawNumber || rawId;
  if (!source) return "";
  if (/^inv-/i.test(source)) return source.toUpperCase();
  if (/^[0-9a-f]{8}-[0-9a-f]{4}/i.test(source)) {
    // If backend only sent UUID as invoiceNumber, convert to INV format for display
    const shortCode = source.slice(0, 4).toUpperCase();
    return `INV-${shortCode}`;
  }
  return source.startsWith("INV") ? source : `INV-${source}`;
}

function mapInvoice(payload: unknown, fallbackProfile: BillingProfile): InvoiceRecord | null {
  if (!isRecord(payload)) return null;
  const rawId = asString(payload.id ?? payload.invoiceId ?? payload.invoice_id).trim();
  const rawNumber = asString(payload.invoiceNumber ?? payload.invoice_number ?? payload.number).trim();
  if (!rawId && !rawNumber) return null;

  const invoiceNumber = formatFormattedInvoiceNumber(rawNumber, rawId);
  const id = rawId || rawNumber;

  const plan = nested(payload, ["plan", "subscriptionPlan", "subscription_plan", "package"]);
  const billedTo = getBillingProfile(payload.billingProfile ?? payload.billing_profile ?? payload.billedTo ?? payload.billed_to ?? payload, fallbackProfile);
  const billingDateRaw = asString(payload.billingDate ?? payload.billing_date ?? payload.issuedAt ?? payload.issued_at ?? payload.createdAt ?? payload.created_at);
  const renewalDateRaw = asString(payload.renewalDate ?? payload.renewal_date ?? payload.dueDate ?? payload.due_date ?? payload.periodEnd ?? payload.period_end);
  const baseAmount = asNumber(payload.baseAmount ?? payload.base_amount ?? payload.subtotal ?? payload.amount ?? payload.price);
  const taxAmount = asNumber(payload.taxAmount ?? payload.tax_amount ?? payload.taxServiceAmount ?? payload.tax_service_amount ?? payload.taxService ?? payload.tax_service);
  const discountAmount = asNumber(payload.discountAmount ?? payload.discount_amount ?? payload.discount);
  const totalAmount = asNumber(payload.totalAmount ?? payload.total_amount ?? payload.total ?? payload.amountDue ?? payload.amount_due ?? payload.amount);
  const label = asString(plan.label ?? plan.name ?? payload.packageLabel ?? payload.package_label ?? payload.packageName ?? payload.package_name, "Subscription");
  const cycle = asString(payload.cycle ?? payload.billingCycle ?? payload.billing_cycle ?? plan.billingCycle ?? plan.billing_cycle, "Monthly");

  return {
    id,
    invoiceNumber,
    packageLabel: asString(payload.packageLabel ?? payload.package_label, `${label} ${cycle}`),
    billingDate: formatDisplayDate(billingDateRaw),
    renewalDate: formatDisplayDate(renewalDateRaw),
    amount: formatCurrency(totalAmount, asString(payload.amountDisplay ?? payload.amount_display, "Custom")),
    status: normalizeStatus(payload.status),
    invoiceLineLabel: asString(payload.invoiceLineLabel ?? payload.invoice_line_label ?? payload.description, `MenuFlow ${label} Plan`),
    cycle,
    lineAmount: formatCurrency(baseAmount, asString(payload.lineAmountDisplay ?? payload.line_amount_display, "Custom")),
    taxDisplay: formatCurrency(taxAmount, asString(payload.taxDisplay ?? payload.tax_display, "Custom")),
    discountDisplay: formatCurrency(discountAmount ?? 0, asString(payload.discountDisplay ?? payload.discount_display, "Rs. 0")),
    totalDisplay: formatCurrency(totalAmount, asString(payload.totalDisplay ?? payload.total_display, "Custom")),
    billedTo,
    baseAmount,
    taxAmount,
    discountAmount: discountAmount ?? 0,
    totalAmount,
    issuedAt: billingDateRaw,
    dueAt: renewalDateRaw,
  };
}

function mapPaymentMethod(payload: unknown): PaymentMethodRecord | null {
  if (!isRecord(payload)) return null;
  const last4 = asString(payload.last4 ?? payload.last_4 ?? payload.cardLast4 ?? payload.card_last4).replace(/\D/g, "").slice(-4);
  const id = asString(payload.id ?? payload.paymentMethodId ?? payload.payment_method_id ?? (last4 ? `card-${last4}` : ""));
  if (!id) return null;
  const brand = asString(payload.brand ?? payload.cardBrand ?? payload.card_brand, "Card");
  return {
    id,
    brand,
    last4,
    label: asString(payload.label, buildPaymentMethodLabel(brand, last4)),
    holderName: asString(payload.holderName ?? payload.holder_name ?? payload.nameOnCard ?? payload.name_on_card),
    expiryDate: asString(payload.expiryDate ?? payload.expiry_date ?? payload.expiry ?? payload.expiresAt ?? payload.expires_at),
  };
}

function sortInvoices(invoices: InvoiceRecord[]) {
  return [...invoices].sort((left, right) => {
    const rightTime = Date.parse(right.issuedAt || right.billingDate);
    const leftTime = Date.parse(left.issuedAt || left.billingDate);
    return (Number.isFinite(rightTime) ? rightTime : 0) - (Number.isFinite(leftTime) ? leftTime : 0);
  });
}

function mapInvoicesPage(payload: unknown): ManagerInvoicesPageData {
  const data = unwrapPayload(payload);
  const record = isRecord(data) ? data : {};
  const billingProfile = getBillingProfile(record.billingProfile ?? record.billing_profile ?? record.profile ?? record.restaurant ?? record);
  const latestInvoicePayload = unwrapItem(record.latestInvoice ?? record.latest_invoice, ["invoice"]);
  const invoices = sortInvoices(
    unwrapList(record.invoices ?? record.history ?? record.invoiceHistory ?? record.invoice_history, [
      "invoices",
      "history",
      "invoiceHistory",
      "invoice_history",
      "items",
      "results",
      "rows",
    ])
      .map((invoice) => mapInvoice(invoice, billingProfile))
      .filter((invoice): invoice is InvoiceRecord => Boolean(invoice)),
  );
  const latestInvoice = mapInvoice(latestInvoicePayload, billingProfile) ?? invoices[0] ?? null;
  const context = {
    ...record,
    latestInvoiceId: latestInvoice?.invoiceNumber ?? latestInvoice?.id,
    latestBillingDate: latestInvoice?.issuedAt,
  };
  const currentSource =
    record.currentPlan ??
    record.current_plan ??
    record.subscriptionPlan ??
    record.subscription_plan ??
    record.currentSubscription ??
    record.current_subscription ??
    null;

  const currentPlan =
    isRecord(currentSource) && Object.keys(currentSource).length > 0
      ? mapPlan(currentSource, context)
      : null;

  const rawAvailablePlans = unwrapList(record.availablePlans ?? record.available_plans ?? record.plans ?? record.packages, [
    "availablePlans",
    "available_plans",
    "plans",
    "packages",
    "items",
  ]);

  // Filter out inactive plans from available choices
  const availablePlans = rawAvailablePlans
    .filter((plan) => {
      if (!isRecord(plan)) return true;
      const status = asString(plan.status ?? (plan.isActive === false ? "inactive" : "active")).toLowerCase();
      return status !== "inactive";
    })
    .map((plan) => mapPlan(plan, context));

  const paymentMethods = unwrapList(record.paymentMethods ?? record.payment_methods, [
    "paymentMethods",
    "payment_methods",
    "cards",
    "items",
  ])
    .map(mapPaymentMethod)
    .filter((method): method is PaymentMethodRecord => Boolean(method));

  const subObj = isRecord(record.subscription) ? record.subscription : isRecord(record.currentSubscription) ? record.currentSubscription : null;
  const autoRenew = Boolean(subObj?.autoRenew ?? subObj?.auto_renew ?? record.autoRenew ?? record.auto_renew ?? false);

  return {
    currentPlan,
    availablePlans,
    invoices: latestInvoice && !invoices.some((invoice) => invoice.id === latestInvoice.id)
      ? sortInvoices([latestInvoice, ...invoices])
      : invoices,
    latestInvoice,
    billingProfile,
    paymentMethods,
    autoRenew,
  };
}

function buildQuery(filters?: { search?: string; status?: string }) {
  const query = new URLSearchParams();
  if (filters?.search?.trim()) query.set("search", filters.search.trim());
  if (filters?.status && filters.status !== "All Status") query.set("status", filters.status);
  return query.toString();
}

export async function fetchManagerAccessStatus(): Promise<ManagerAccessStatus> {
  try {
    const payload = await requestInvoices("/manager-invoices/access-status");
    const data = unwrapPayload(payload);
    const record = isRecord(data) ? data : {};
    const statusStr = asString(record.status ?? record.subscriptionStatus ?? record.accessStatus).toLowerCase();
    const isUnlockedStatus = statusStr === "no_packages" || statusStr === "no_subscription" || statusStr === "active";
    const derivedLocked = !isUnlockedStatus && (statusStr === "overdue" || statusStr === "locked" || statusStr === "payment_required");
    const rawLocked = record.locked ?? record.isLocked;
    const locked = typeof rawLocked === "boolean" ? (isUnlockedStatus ? false : rawLocked) : derivedLocked;
    const pendingInvoiceId = asString(record.pendingInvoiceId ?? record.pending_invoice_id ?? record.invoiceId ?? record.invoice_id);

    return {
      locked,
      status: statusStr || (locked ? "overdue" : "active"),
      reason: asString(record.reason ?? record.message),
      pendingInvoiceId: pendingInvoiceId || undefined,
    };
  } catch (error) {
    if (error instanceof SubscriptionPaymentRequiredError) {
      return {
        locked: true,
        status: "overdue",
        reason: error.message,
      };
    }
    // Safe neutral fallback if access status endpoint fails
    return {
      locked: false,
      status: "unknown",
      reason: error instanceof Error ? error.message : undefined,
    };
  }
}

export async function fetchManagerInvoices(filters?: {
  search?: string;
  status?: string;
}): Promise<ManagerInvoicesPageData> {
  const query = buildQuery(filters);
  return mapInvoicesPage(await requestInvoices(`/manager-invoices${query ? `?${query}` : ""}`));
}

export async function fetchManagerInvoice(id: string): Promise<InvoiceRecord> {
  const payload = await requestInvoices(`/manager-invoices/${encodeURIComponent(id)}`);
  const data = unwrapPayload(payload);
  const profile = getBillingProfile(isRecord(data) ? data.billingProfile ?? data.billing_profile ?? data : data);
  const invoice = mapInvoice(unwrapItem(payload, ["invoice"]), profile);
  if (!invoice) {
    throw new ManagerInvoicesApiError("Invoice was loaded, but the response was invalid.");
  }
  return invoice;
}

export async function changeManagerInvoicePlan(planId: string): Promise<PlanChangeResult> {
  const payload = await requestInvoices("/manager-invoices/plan", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ planId }),
  });
  const data = unwrapPayload(payload);
  const record = isRecord(data) ? data : {};
  const amt = asNumber(record.amountDue ?? record.amount_due ?? record.amount ?? record.totalAmount ?? record.total_amount);
  const invId = asString(record.pendingInvoiceId ?? record.pending_invoice_id ?? record.invoiceId ?? record.invoice_id ?? record.id);
  return {
    pendingInvoiceId: invId,
    invoiceId: invId,
    invoiceNumber: asString(record.invoiceNumber ?? record.invoice_number),
    amount: amt,
    amountDue: amt,
    message: asString(record.message),
  };
}

export async function payManagerInvoice(payload: PayInvoicePayload): Promise<void> {
  const cleanInvoiceId = payload.invoiceId?.trim();
  if (!cleanInvoiceId) {
    throw new ManagerInvoicesApiError("A valid invoice ID is required to process payment.");
  }
  await requestInvoices("/manager-invoices/pay", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      invoiceId: cleanInvoiceId,
      ...(payload.paymentMethodId && { paymentMethodId: payload.paymentMethodId }),
      ...(payload.cardNumber && { cardNumber: payload.cardNumber.replace(/\D/g, "") }),
      ...(payload.holderName && { holderName: payload.holderName.trim() }),
      ...(payload.expiryDate && { expiryDate: payload.expiryDate.trim() }),
      ...(payload.cvc && { cvc: payload.cvc.trim() }),
      ...(payload.billingEmail && { billingEmail: payload.billingEmail.trim().toLowerCase() }),
    }),
  });
}

export async function renewManagerSubscription(payload: RenewSubscriptionPayload): Promise<void> {
  await requestInvoices("/manager-invoices/renew", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...(payload.paymentMethodId && { paymentMethodId: payload.paymentMethodId }),
      ...(payload.billingEmail && { billingEmail: payload.billingEmail.trim().toLowerCase() }),
      ...(payload.confirmSavedPaymentMethod !== undefined && { confirmSavedPaymentMethod: payload.confirmSavedPaymentMethod }),
    }),
  });
}

export async function updateManagerPaymentMethod(
  payload: UpdatePaymentMethodPayload,
): Promise<PaymentMethodRecord> {
  const data = await requestInvoices("/manager-invoices/payment-method", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cardNumber: payload.cardNumber.replace(/\D/g, ""),
      holderName: payload.holderName.trim(),
      expiryDate: payload.expiryDate.trim(),
      cvc: payload.cvc.trim(),
    }),
  });
  const method = mapPaymentMethod(unwrapItem(data, ["paymentMethod", "payment_method", "card"]));
  if (!method) {
    throw new ManagerInvoicesApiError("Payment method was saved, but the response was invalid.");
  }
  return method;
}

export async function toggleManagerAutoRenew(enabled: boolean): Promise<boolean> {
  const data = await requestInvoices("/manager-invoices/auto-renew", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enabled }),
  });
  const record = isRecord(unwrapPayload(data)) ? (unwrapPayload(data) as Record<string, unknown>) : {};
  return Boolean(record.autoRenew ?? record.enabled ?? enabled);
}

