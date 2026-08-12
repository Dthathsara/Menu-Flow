export type PlanId = string;

export type InvoiceStatus =
  | "Paid"
  | "Pending"
  | "Overdue"
  | "Failed"
  | "Cancelled"
  | "Draft";

export type InvoiceHistoryStatusFilter = "All Status" | InvoiceStatus;

export interface UsageLimit {
  used: number;
  limit: number | null;
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

export interface BillingProfile {
  restaurantName: string;
  restaurantAddress: string;
  billingEmail: string;
}

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
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
  billedTo: BillingProfile;
  baseAmount: number | null;
  taxAmount: number | null;
  discountAmount: number | null;
  totalAmount: number | null;
  issuedAt: string;
  dueAt: string;
}

export interface ManagerInvoicesPageData {
  currentPlan: SubscriptionPlan;
  availablePlans: SubscriptionPlan[];
  invoices: InvoiceRecord[];
  latestInvoice: InvoiceRecord | null;
  billingProfile: BillingProfile;
  paymentMethods: PaymentMethodRecord[];
}

export interface PaymentMethodRecord {
  id: string;
  brand: string;
  last4: string;
  label: string;
  holderName: string;
  expiryDate: string;
}

export interface PaymentMethodFormValues {
  cardNumber: string;
  holderName: string;
  expiryDate: string;
  cvc: string;
}

export interface RenewSubscriptionPayload {
  paymentMethodId: string;
  cardHolderName: string;
  billingEmail: string;
}

export type UpdatePaymentMethodPayload = PaymentMethodFormValues;

export interface ToastMessage {
  id: string;
  title: string;
}
