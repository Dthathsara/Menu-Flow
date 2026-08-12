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
  if (error instanceof NetworkError) {
    return new ManagerInvoicesApiError(
      "Unable to connect to the server. Please make sure the backend is running.",
    );
  }
  if (error instanceof ApiResponseError) {
    return new ManagerInvoicesApiError(
      extractApiMessage(error.response.data) || error.message || fallback,
    );
  }
  if (error instanceof ManagerInvoicesApiError) return error;
  if (error instanceof Error) return new ManagerInvoicesApiError(error.message || fallback);
  return new ManagerInvoicesApiError(fallback);
}

async function requestInvoices(path: string, init: RequestInit = {}) {
  try {
    const response = await authFetch(`${API_BASE_URL}${path}`, {
      cache: "no-store",
      ...init,
      headers: init.headers,
    });
    const data = await readJson(response);
    if (!response.ok) {
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
  }
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
  if (status === "pending" || status === "unpaid") return "Pending";
  if (status === "overdue") return "Overdue";
  if (status === "failed") return "Failed";
  if (status === "cancelled" || status === "canceled") return "Cancelled";
  if (status === "draft") return "Draft";
  return "Paid";
}

function mapPlan(payload: unknown, context: ApiRecord = {}): SubscriptionPlan {
  const plan = isRecord(payload) ? payload : {};
  const subscription = nested(context, ["subscription", "currentSubscription", "current_subscription"]);
  const usage = nested(context, ["usage"]);
  const planId =
    normalizePlanId(
      plan.id ??
        plan.planId ??
        plan.plan_id ??
        subscription.planId ??
        subscription.plan_id ??
        subscription.packageId ??
        subscription.package_id,
    ) || "current";
  const catalog = PLAN_CATALOG[planId] ?? PLAN_CATALOG[planId.toLowerCase()];
  const label = asString(plan.label ?? plan.name ?? plan.planName ?? plan.plan_name, catalog?.label || "Current");
  const planName = asString(plan.planName ?? plan.plan_name ?? plan.name, catalog?.planName || `${label} Plan`);
  const baseAmount = asNumber(
    plan.price ?? plan.amount ?? plan.baseAmount ?? plan.base_amount ?? plan.monthlyPrice ?? plan.monthly_price ?? subscription.baseAmount ?? subscription.base_amount,
  );
  const taxAmount = asNumber(context.taxAmount ?? context.tax_amount ?? subscription.taxAmount ?? subscription.tax_amount);
  const discountAmount = asNumber(context.discountAmount ?? context.discount_amount ?? subscription.discountAmount ?? subscription.discount_amount);
  const totalAmount = asNumber(
    context.amountDue ?? context.amount_due ?? context.totalAmount ?? context.total_amount ?? subscription.amountDue ?? subscription.amount_due ?? subscription.totalAmount ?? subscription.total_amount,
  );
  const cycle = asString(plan.billingCycle ?? plan.billing_cycle ?? subscription.billingCycle ?? subscription.billing_cycle, "Monthly");
  const nextRenewalRaw = asString(
    context.nextRenewalAt ?? context.next_renewal_at ?? subscription.nextRenewalAt ?? subscription.next_renewal_at ?? subscription.currentPeriodEnd ?? subscription.current_period_end,
  );
  const startedRaw = asString(
    context.startedAt ?? context.started_at ?? subscription.startedAt ?? subscription.started_at ?? subscription.currentPeriodStart ?? subscription.current_period_start,
  );
  const usageLocations = nested(usage, ["locations"]);
  const usageQrTables = nested(usage, ["qrTables", "qr_tables"]);
  const profile = getBillingProfile(context.billingProfile ?? context.billing_profile ?? context);

  return {
    id: planId,
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
        limit: asLimit(usageLocations.limit ?? usage.locationsLimit ?? usage.locations_limit ?? plan.locationsLimit ?? plan.locations_limit),
      },
      qrTables: {
        used: asNumber(usageQrTables.used ?? usage.qrTablesUsed ?? usage.qr_tables_used ?? context.qrTablesUsed ?? context.qr_tables_used) ?? 0,
        limit: asLimit(usageQrTables.limit ?? usage.qrTablesLimit ?? usage.qr_tables_limit ?? plan.qrTablesLimit ?? plan.qr_tables_limit),
      },
    },
    renewalNoticeTitle: nextRenewalRaw ? `Your package renews automatically on ${formatDisplayDate(nextRenewalRaw)}.` : "Your package renewal will appear here once scheduled.",
    renewalNoticeBody: "Keep your payment method active to avoid QR menu or dashboard interruptions.",
    features: Array.isArray(plan.features) ? plan.features.map((feature) => asString(feature)).filter(Boolean) : catalog?.features ?? [],
    latestInvoiceId: asString(context.latestInvoiceId ?? context.latest_invoice_id),
    latestBillingDate: formatDisplayDate(asString(context.latestBillingDate ?? context.latest_billing_date)),
    latestRenewalDate: formatDisplayDate(nextRenewalRaw),
    changePlanLabel: `${label} - ${formatCurrency(baseAmount, "Custom pricing")}`,
    invoiceLineLabel: asString(plan.invoiceLineLabel ?? plan.invoice_line_label, `MenuFlow ${label} Plan`),
    invoiceCycle: cycle,
    invoiceLineAmount: formatCurrency(baseAmount, "Custom"),
  };
}

function mapInvoice(payload: unknown, fallbackProfile: BillingProfile): InvoiceRecord | null {
  if (!isRecord(payload)) return null;
  const invoiceNumber = asString(payload.invoiceNumber ?? payload.invoice_number ?? payload.number ?? payload.id).trim();
  const id = asString(payload.id ?? invoiceNumber).trim();
  if (!id && !invoiceNumber) return null;

  const plan = nested(payload, ["plan", "subscriptionPlan", "subscription_plan", "package"]);
  const billedTo = getBillingProfile(payload.billingProfile ?? payload.billing_profile ?? payload.billedTo ?? payload.billed_to ?? payload, fallbackProfile);
  const billingDateRaw = asString(payload.billingDate ?? payload.billing_date ?? payload.issuedAt ?? payload.issued_at ?? payload.createdAt ?? payload.created_at);
  const renewalDateRaw = asString(payload.renewalDate ?? payload.renewal_date ?? payload.dueDate ?? payload.due_date ?? payload.periodEnd ?? payload.period_end);
  const baseAmount = asNumber(payload.baseAmount ?? payload.base_amount ?? payload.subtotal ?? payload.amount);
  const taxAmount = asNumber(payload.taxAmount ?? payload.tax_amount ?? payload.taxServiceAmount ?? payload.tax_service_amount);
  const discountAmount = asNumber(payload.discountAmount ?? payload.discount_amount);
  const totalAmount = asNumber(payload.totalAmount ?? payload.total_amount ?? payload.total ?? payload.amountDue ?? payload.amount_due ?? payload.amount);
  const label = asString(plan.label ?? plan.name ?? payload.packageLabel ?? payload.package_label, "Subscription");
  const cycle = asString(payload.cycle ?? payload.billingCycle ?? payload.billing_cycle ?? plan.billingCycle ?? plan.billing_cycle, "Monthly");

  return {
    id: id || invoiceNumber,
    invoiceNumber: invoiceNumber || id,
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

function getCatalogPlans(context: ApiRecord) {
  return PLAN_ORDER.map((planId) => mapPlan({ id: planId, ...(PLAN_CATALOG[planId] ?? {}) }, context));
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
    {};
  const availablePlans = unwrapList(record.availablePlans ?? record.available_plans ?? record.plans, [
    "availablePlans",
    "available_plans",
    "plans",
    "items",
  ]).map((plan) => mapPlan(plan, context));
  const paymentMethods = unwrapList(record.paymentMethods ?? record.payment_methods, [
    "paymentMethods",
    "payment_methods",
    "cards",
    "items",
  ])
    .map(mapPaymentMethod)
    .filter((method): method is PaymentMethodRecord => Boolean(method));

  return {
    currentPlan: mapPlan(currentSource, context),
    availablePlans: availablePlans.length ? availablePlans : getCatalogPlans(context),
    invoices: latestInvoice && !invoices.some((invoice) => invoice.id === latestInvoice.id)
      ? sortInvoices([latestInvoice, ...invoices])
      : invoices,
    latestInvoice,
    billingProfile,
    paymentMethods,
  };
}

function buildQuery(filters?: { search?: string; status?: string }) {
  const query = new URLSearchParams();
  if (filters?.search?.trim()) query.set("search", filters.search.trim());
  if (filters?.status && filters.status !== "All Status") query.set("status", filters.status);
  return query.toString();
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

export async function changeManagerInvoicePlan(planId: string): Promise<void> {
  await requestInvoices("/manager-invoices/plan", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ planId }),
  });
}

export async function renewManagerSubscription(payload: RenewSubscriptionPayload): Promise<void> {
  await requestInvoices("/manager-invoices/renew", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      paymentMethodId: payload.paymentMethodId,
      cardHolderName: payload.cardHolderName.trim(),
      billingEmail: payload.billingEmail.trim().toLowerCase(),
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
