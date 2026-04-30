export type PlanId = "starter" | "growth" | "premium";
export type InvoiceStatus = "Paid";
export type InvoiceHistoryStatusFilter = "All Status" | InvoiceStatus;

export interface UsageLimit {
  used: number;
  limit: number;
}

export interface SubscriptionPlan {
  id: PlanId;
  tier: number;
  label: string;
  planName: string;
  billingLabel: string;
  priceDisplay: string;
  priceUnit: string;
  headlineDescription: string;
  currentPackageDescription: string;
  billingCycle: string;
  billingCycleDescription: string;
  nextRenewal: string;
  nextRenewalDescription: string;
  amountDue: string;
  amountDueDescription: string;
  taxDisplay: string;
  discountDisplay: string;
  totalDisplay: string;
  packageType: string;
  startedDate: string;
  renewalDate: string;
  restaurantName: string;
  usage: {
    locations: UsageLimit;
    qrTables: UsageLimit;
  };
  renewalNoticeTitle: string;
  renewalNoticeBody: string;
  features: string[];
  latestInvoiceId: string;
  latestBillingDate: string;
  latestRenewalDate: string;
  changePlanLabel: string;
  invoiceLineLabel: string;
  invoiceCycle: string;
  invoiceLineAmount: string;
}

export interface InvoiceRecord {
  id: string;
  packageLabel: string;
  billingDate: string;
  renewalDate: string;
  amount: string;
  status: InvoiceStatus;
  invoiceLineLabel: string;
  cycle: string;
  lineAmount: string;
  taxDisplay: string;
  discountDisplay: string;
  totalDisplay: string;
}

export interface PaymentMethodRecord {
  id: string;
  label: string;
  holderName: string;
  cardNumber: string;
  expiryDate: string;
  cvc: string;
}

export interface ToastMessage {
  id: string;
  title: string;
}
