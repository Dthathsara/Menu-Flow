import {
  BILLING_EMAIL,
  COMPANY_ADDRESS,
  RESTAURANT_ADDRESS,
  SUBSCRIPTION_PLANS,
} from "./invoice.data";
import type {
  InvoiceHistoryStatusFilter,
  InvoiceRecord,
  PaymentMethodRecord,
  PlanId,
  SubscriptionPlan,
} from "./invoice.types";

export function buildLatestInvoice(plan: SubscriptionPlan): InvoiceRecord {
  return {
    id: plan.latestInvoiceId,
    packageLabel: plan.billingLabel,
    billingDate: plan.latestBillingDate,
    renewalDate: plan.latestRenewalDate,
    amount: plan.totalDisplay,
    status: "Paid",
    invoiceLineLabel: plan.invoiceLineLabel,
    cycle: plan.invoiceCycle,
    lineAmount: plan.invoiceLineAmount,
    taxDisplay: plan.taxDisplay,
    discountDisplay: plan.discountDisplay,
    totalDisplay: plan.totalDisplay,
  };
}

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
  if (currentPlanId === "starter") {
    return "growth";
  }

  if (currentPlanId === "growth") {
    return "premium";
  }

  return "growth";
}

export function getPlanActionLabel(currentPlanId: PlanId, targetPlanId: PlanId) {
  if (currentPlanId === targetPlanId) {
    return "Current Plan";
  }

  if (targetPlanId === "premium") {
    return "Talk to Sales / Upgrade";
  }

  return SUBSCRIPTION_PLANS[targetPlanId].tier > SUBSCRIPTION_PLANS[currentPlanId].tier
    ? "Upgrade"
    : "Downgrade";
}

export function getPlanChangeVerb(currentPlanId: PlanId, targetPlanId: PlanId) {
  return SUBSCRIPTION_PLANS[targetPlanId].tier > SUBSCRIPTION_PLANS[currentPlanId].tier
    ? "Upgrade"
    : "Downgrade";
}

export function buildPaymentMethodLabel(cardNumber: string) {
  const digits = cardNumber.replace(/\D/g, "");
  const lastFour = digits.slice(-4) || "0000";

  return `Card ending ${lastFour}`;
}

export function getInvoiceDocument(invoice: InvoiceRecord) {
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
          <p class="muted">Smart menus. Faster service.<br />${COMPANY_ADDRESS}</p>
        </div>
        <div class="align-right">
          <h2 class="title">INVOICE</h2>
          <p class="muted">Invoice: #${invoice.id}<br />Billing Date: ${invoice.billingDate}<br />Due Date: ${invoice.renewalDate}</p>
        </div>
      </div>

      <div class="section">
        <p class="section-title">Billed To:</p>
        <p class="muted">Chinese Dragon Cafe<br />${RESTAURANT_ADDRESS}<br />${BILLING_EMAIL}</p>
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
            <td class="strong">${invoice.invoiceLineLabel}</td>
            <td class="strong">${invoice.cycle}</td>
            <td class="strong">${invoice.lineAmount}</td>
          </tr>
          <tr>
            <td class="strong">Tax / Service</td>
            <td class="strong">-</td>
            <td class="strong">${invoice.taxDisplay}</td>
          </tr>
          <tr>
            <td class="strong">Total</td>
            <td></td>
            <td class="strong">${invoice.totalDisplay}</td>
          </tr>
        </tbody>
      </table>

      <p class="footer-copy">Status: <strong>Paid</strong><br />Thank you for using MenuFlow.</p>
    </div>
  </body>
</html>`;
}

export function createPaymentMethodRecord(
  values: Omit<PaymentMethodRecord, "id" | "label">,
) {
  const digits = values.cardNumber.replace(/\D/g, "");
  const lastFour = digits.slice(-4) || "0000";

  return {
    ...values,
    id: `card-${lastFour}`,
    label: buildPaymentMethodLabel(values.cardNumber),
  };
}
