import type { InvoiceHistoryStatusFilter, PlanId } from "./invoice.types";

export const COMPANY_ADDRESS = "Colombo, Sri Lanka";

export const PLAN_ORDER: PlanId[] = ["starter", "growth", "premium"];

export const PLAN_CATALOG: Record<
  string,
  {
    tier: number;
    label: string;
    planName: string;
    headlineDescription: string;
    currentPackageDescription: string;
    features: string[];
  }
> = {
  starter: {
    tier: 0,
    label: "Starter",
    planName: "Starter Plan",
    headlineDescription:
      "For small cafes and single-location restaurants using MenuFlow for QR menu access and daily updates.",
    currentPackageDescription:
      "For small cafes and single-location restaurants using MenuFlow for QR menu access and daily updates.",
    features: [
      "1 location",
      "QR menu access",
      "Category setup",
      "Basic analytics",
    ],
  },
  growth: {
    tier: 1,
    label: "Growth",
    planName: "Growth Plan",
    headlineDescription:
      "For growing restaurants with QR ordering, live menu updates, table billing, staff controls, and analytics.",
    currentPackageDescription:
      "Built for growing restaurants with QR ordering, live menu updates, table billing, staff controls, and advanced analytics.",
    features: [
      "Multiple locations",
      "Live menu updates",
      "Order management",
      "Advanced analytics",
    ],
  },
  premium: {
    tier: 2,
    label: "Premium",
    planName: "Premium Plan",
    headlineDescription:
      "For hotels, franchises, and enterprise brands that need white-label delivery, priority support, and custom onboarding.",
    currentPackageDescription:
      "For hotels, franchises, and enterprise brands that need white-label delivery, priority support, and custom onboarding.",
    features: [
      "Unlimited locations",
      "White-label options",
      "Priority support",
      "Custom onboarding",
    ],
  },
};

export const INVOICE_STATUS_FILTER_OPTIONS: InvoiceHistoryStatusFilter[] = [
  "All Status",
  "Paid",
  "Pending",
  "Overdue",
  "Failed",
  "Cancelled",
  "Draft",
];
