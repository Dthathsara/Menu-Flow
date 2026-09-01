import { COMPANY_ADDRESS, PLAN_CATALOG } from "./invoice.data";
import type {
  InvoiceHistoryStatusFilter,
  InvoiceRecord,
  PaymentMethodFormValues,
  PlanId,
} from "./invoice.types";

export function filterInvoices(
  invoices: InvoiceRecord[],
  query: string,
  statusFilter: InvoiceHistoryStatusFilter,
) {
  const normalizedQuery = query.trim().toLowerCase();

  return invoices.filter((invoice) => {
    const matchesStatus =
      statusFilter === "All Status" ? true : invoice.status === statusFilter;
    const matchesQuery =
      normalizedQuery.length === 0
        ? true
        : [
            invoice.id,
            invoice.invoiceNumber,
            invoice.packageLabel,
            invoice.billingDate,
            invoice.renewalDate,
            invoice.amount,
            invoice.status,
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);

    return matchesStatus && matchesQuery;
  });
}

export function getDefaultTargetPlanId(currentPlanId: PlanId): PlanId {
  return currentPlanId === "premium" ? "growth" : "premium";
}

export function getPlanPrice(plan: SubscriptionPlan | null | undefined): number {
  if (!plan) return 0;
  if (typeof plan.price === "number" && Number.isFinite(plan.price) && plan.price > 0) {
    return plan.price;
  }
  const str = plan.priceDisplay || plan.totalDisplay || plan.amountDue || "";
  const parsed = Number(str.replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function isUpgradePlan(
  currentPlan: SubscriptionPlan | null | undefined,
  targetPlan: SubscriptionPlan,
): boolean {
  if (!currentPlan) return true;
  const currentPrice = getPlanPrice(currentPlan);
  const targetPrice = getPlanPrice(targetPlan);

  if (targetPrice !== currentPrice) {
    return targetPrice > currentPrice;
  }
  const currentTier = currentPlan.tier ?? PLAN_CATALOG[currentPlan.id.toLowerCase()]?.tier ?? 0;
  const targetTier = targetPlan.tier ?? PLAN_CATALOG[targetPlan.id.toLowerCase()]?.tier ?? 0;
  return targetTier > currentTier;
}

export function getPlanActionLabel(
  currentPlan: SubscriptionPlan | PlanId | null | undefined,
  targetPlan: SubscriptionPlan | PlanId,
): string {
  if (!currentPlan) {
    return "Select Package";
  }

  // Handle object inputs
  if (typeof currentPlan === "object" && typeof targetPlan === "object") {
    const isSamePlan =
      targetPlan.id === currentPlan.id ||
      (Boolean(targetPlan.packageId) && targetPlan.packageId === currentPlan.packageId);

    if (isSamePlan) {
      return "Current Plan";
    }

    return isUpgradePlan(currentPlan, targetPlan) ? "Upgrade Plan" : "Downgrade Plan";
  }

  // Handle string ID fallback
  const currId = typeof currentPlan === "string" ? currentPlan : currentPlan.id;
  const targId = typeof targetPlan === "string" ? targetPlan : targetPlan.id;

  if (currId === targId) {
    return "Current Plan";
  }

  return getPlanTier(targId) > getPlanTier(currId) ? "Upgrade Plan" : "Downgrade Plan";
}

export function getPlanChangeVerb(
  currentPlan: SubscriptionPlan | PlanId | null | undefined,
  targetPlan: SubscriptionPlan | PlanId,
): "Upgrade" | "Downgrade" {
  if (!currentPlan) return "Upgrade";
  if (typeof currentPlan === "object" && typeof targetPlan === "object") {
    return isUpgradePlan(currentPlan, targetPlan) ? "Upgrade" : "Downgrade";
  }
  const currId = typeof currentPlan === "string" ? currentPlan : currentPlan.id;
  const targId = typeof targetPlan === "string" ? targetPlan : targetPlan.id;
  return getPlanTier(targId) > getPlanTier(currId) ? "Upgrade" : "Downgrade";
}

export function getPlanTier(planId: PlanId) {
  return PLAN_CATALOG[planId.toLowerCase()]?.tier ?? 0;
}

export function formatCurrency(amount: number | null | undefined, fallback = "Custom") {
  if (typeof amount !== "number" || !Number.isFinite(amount)) {
    return fallback;
  }

  return `Rs. ${Math.round(amount).toLocaleString("en-LK")}`;
}

export function formatDisplayDate(value: string | null | undefined, fallback = "Not scheduled") {
  if (!value) {
    return fallback;
  }

  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const date = dateOnlyMatch
    ? new Date(Number(dateOnlyMatch[1]), Number(dateOnlyMatch[2]) - 1, Number(dateOnlyMatch[3]))
    : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatShortDate(value: string | null | undefined, fallback = "Not scheduled") {
  const display = formatDisplayDate(value, fallback);

  if (display === fallback || !display.includes(",")) {
    return display;
  }

  return display.replace(/,\s+\d{4}$/, "");
}

export function formatUsageLimit(usage: { used: number; limit: number | null }) {
  return `${usage.used}/${usage.limit ?? "Unlimited"}`;
}

export function calculateUsageProgress(used: number, limit: number | null) {
  if (!limit || limit <= 0) {
    return 100;
  }

  return Math.min(100, (used / limit) * 100);
}

export function buildPaymentMethodLabel(brand: string, last4: string) {
  const normalizedBrand = brand.trim() || "Card";
  const normalizedLast4 = last4.trim() || "----";

  return `${normalizedBrand} ending ${normalizedLast4}`;
}

export function getInvoiceDocument(invoice: InvoiceRecord) {
  const invoiceNumber = escapeHtml(invoice.invoiceNumber || invoice.id);
  const restaurantName = escapeHtml(invoice.billedTo.restaurantName || "MenuFlow Restaurant");
  const restaurantAddress = escapeHtml(invoice.billedTo.restaurantAddress || "Address unavailable");
  const billingEmail = escapeHtml(invoice.billedTo.billingEmail || "Billing email unavailable");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>MenuFlow - Subscription &amp; Invoices</title>
    <style>
      @page {
        size: A4;
        margin: 16mm;
      }
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        font-family: Inter, Arial, sans-serif;
        color: #1f2937;
        background: #ffffff;
      }
      .sheet {
        width: 100%;
        max-width: 820px;
        margin: 0 auto;
      }
      .header {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 32px;
        align-items: start;
      }
      .title {
        margin: 0;
        font-size: 24px;
        line-height: 1.2;
        font-weight: 700;
        color: #111827;
      }
      .muted {
        margin: 6px 0 0;
        font-size: 15px;
        line-height: 1.6;
        color: #52627f;
      }
      .section {
        margin-top: 32px;
      }
      .section-title {
        margin: 0 0 8px;
        font-size: 16px;
        line-height: 1.4;
        font-weight: 700;
        color: #3b4d6b;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 28px;
      }
      thead th {
        padding: 14px 12px;
        font-size: 12px;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        text-align: left;
        color: #42536d;
        background: #eef2f8;
      }
      tbody td {
        padding: 18px 12px;
        font-size: 15px;
        line-height: 1.5;
        color: #1f2937;
        border-bottom: 1px solid #d7dfed;
      }
      .strong {
        font-weight: 700;
        color: #111827;
      }
      .footer-copy {
        margin-top: 22px;
        font-size: 14px;
        line-height: 1.7;
        color: #52627f;
      }
      .align-right {
        text-align: right;
      }
    </style>
  </head>
  <body>
    <div class="sheet">
      <div class="header">
        <div>
          <h1 class="title">MenuFlow</h1>
          <p class="muted">Smart menus. Faster service.<br />${escapeHtml(COMPANY_ADDRESS)}</p>
        </div>
        <div class="align-right">
          <h2 class="title">INVOICE</h2>
          <p class="muted">Invoice: #${invoiceNumber}<br />Billing Date: ${escapeHtml(invoice.billingDate)}<br />Due Date: ${escapeHtml(invoice.renewalDate)}</p>
        </div>
      </div>

      <div class="section">
        <p class="section-title">Billed To:</p>
        <p class="muted">${restaurantName}<br />${restaurantAddress}<br />${billingEmail}</p>
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Cycle</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="strong">${escapeHtml(invoice.invoiceLineLabel)}</td>
            <td class="strong">${escapeHtml(invoice.cycle)}</td>
            <td class="strong">${escapeHtml(invoice.lineAmount)}</td>
          </tr>
          <tr>
            <td class="strong">Tax / Service</td>
            <td class="strong">-</td>
            <td class="strong">${escapeHtml(invoice.taxDisplay)}</td>
          </tr>
          ${
            invoice.discountAmount && invoice.discountAmount > 0
              ? `<tr>
            <td class="strong">Discount</td>
            <td class="strong">-</td>
            <td class="strong">${escapeHtml(invoice.discountDisplay)}</td>
          </tr>`
              : ""
          }
          <tr>
            <td class="strong">Status</td>
            <td class="strong">-</td>
            <td class="strong">${escapeHtml(invoice.status)}</td>
          </tr>
          <tr>
            <td class="strong">Total</td>
            <td></td>
            <td class="strong">${escapeHtml(invoice.totalDisplay)}</td>
          </tr>
        </tbody>
      </table>

      <p class="footer-copy">Status: <strong>${escapeHtml(invoice.status)}</strong><br />Thank you for using MenuFlow.</p>
    </div>
  </body>
</html>`;
}

export async function exportInvoicePdf(invoice: InvoiceRecord) {
  const jsPdfModule = (await import("jspdf")) as {
    default: new () => {
      text: (text: string, x: number, y: number) => void;
      setFontSize: (size: number) => void;
      save: (filename: string) => void;
      lastAutoTable?: { finalY: number };
    };
  };
  const autoTableModule = (await import("jspdf-autotable")) as {
    default?: (doc: unknown, options: unknown) => void;
    autoTable?: (doc: unknown, options: unknown) => void;
  };
  const doc = new jsPdfModule.default();
  const autoTable = autoTableModule.default ?? autoTableModule.autoTable;

  if (!autoTable) {
    throw new Error("PDF table exporter is not available.");
  }

  const invoiceNumber = invoice.invoiceNumber || invoice.id;

  doc.setFontSize(18);
  doc.text("MenuFlow", 14, 18);
  doc.setFontSize(10);
  doc.text("Smart menus. Faster service.", 14, 26);
  doc.text(COMPANY_ADDRESS, 14, 32);

  doc.setFontSize(18);
  doc.text("INVOICE", 150, 18);
  doc.setFontSize(10);
  doc.text(`Invoice: #${invoiceNumber}`, 150, 26);
  doc.text(`Billing date: ${invoice.billingDate}`, 150, 32);
  doc.text(`Due date: ${invoice.renewalDate}`, 150, 38);

  doc.setFontSize(12);
  doc.text("Billed To:", 14, 50);
  doc.setFontSize(10);
  doc.text(invoice.billedTo.restaurantName || "MenuFlow Restaurant", 14, 58);
  doc.text(invoice.billedTo.restaurantAddress || "Address unavailable", 14, 64);
  doc.text(invoice.billedTo.billingEmail || "Billing email unavailable", 14, 70);

  const body = [
    [invoice.invoiceLineLabel, invoice.cycle, invoice.lineAmount],
    ["Tax / Service", "-", invoice.taxDisplay],
    ...(invoice.discountAmount && invoice.discountAmount > 0
      ? [["Discount", "-", invoice.discountDisplay]]
      : []),
    ["Total", "", invoice.totalDisplay],
  ];

  autoTable(doc, {
    startY: 82,
    head: [["Description", "Cycle", "Amount"]],
    body,
  });

  const footerY = (doc.lastAutoTable?.finalY ?? 118) + 12;
  doc.setFontSize(10);
  doc.text(`Status: ${invoice.status}`, 14, footerY);
  doc.text("Thank you for using MenuFlow", 14, footerY + 8);

  doc.save(`menuflow-invoice-${sanitizeFilename(invoiceNumber)}.pdf`);
}

export function validatePaymentMethodForm(values: PaymentMethodFormValues) {
  const cardNumber = values.cardNumber.replace(/\D/g, "");

  if (!/^[\d\s]+$/.test(values.cardNumber.trim()) || cardNumber.length !== 16) {
    return "Card number must contain exactly 16 digits.";
  }

  if (!values.holderName.trim()) {
    return "Name on card is required.";
  }

  if (!isValidDemoExpiry(values.expiryDate)) {
    return "Enter a valid expiry date in MM / YY format.";
  }

  if (!/^\d{3,4}$/.test(values.cvc.trim())) {
    return "CVC must be 3 or 4 digits.";
  }

  return "";
}

export function formatCardNumberInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

export function formatExpiryInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
}

export function validateBillingEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function passesLuhn(value: string) {
  let sum = 0;
  let doubleDigit = false;

  for (let index = value.length - 1; index >= 0; index -= 1) {
    let digit = Number(value[index]);

    if (doubleDigit) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    doubleDigit = !doubleDigit;
  }

  return sum % 10 === 0;
}

function isValidDemoExpiry(value: string) {
  const match = /^(\d{2})\s*\/?\s*(\d{2})$/.exec(value.trim());

  if (!match) {
    return false;
  }

  const month = Number(match[1]);
  return month >= 1 && month <= 12;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function sanitizeFilename(value: string) {
  return value.replace(/[^a-z0-9_-]+/gi, "-").replace(/^-|-$/g, "") || "invoice";
}
