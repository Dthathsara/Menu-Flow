import type { Metadata } from "next";
import { CustomerDashboard } from "@/components/customer/CustomerDashboard";

export const metadata: Metadata = {
  title: "MenuFlow | Customer Dashboard",
  description: "Responsive customer-facing restaurant ordering dashboard.",
};

export default function CustomerPage() {
  return <CustomerDashboard />;
}
