import type { Metadata } from "next";
import { CustomerDashboard } from "@/components/customer/CustomerDashboard";
import { customerMenuData } from "@/data/customerMenuData";

export const metadata: Metadata = {
  title: "MenuFlow | Customer Dashboard",
  description: "Responsive customer-facing restaurant ordering dashboard demo.",
};

export default function CustomerPage() {
  return <CustomerDashboard data={customerMenuData} />;
}
