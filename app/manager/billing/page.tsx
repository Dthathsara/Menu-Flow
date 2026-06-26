import type { Metadata } from "next";
import { ManagerDashboard } from "@/components/manager/ManagerDashboard";

export const metadata: Metadata = {
  title: "MenuFlow | Manager Billing",
  description:
    "Manage QR restaurant bills, cashier collection, receipts, pending settlements, and refunds.",
};

export default function ManagerBillingPage() {
  return <ManagerDashboard initialActiveNav="billing" />;
}
