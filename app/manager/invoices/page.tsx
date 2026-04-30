import type { Metadata } from "next";
import { ManagerDashboard } from "@/components/manager/ManagerDashboard";

export const metadata: Metadata = {
  title: "MenuFlow | Manager Invoices",
  description:
    "Manage MenuFlow subscription plans, invoices, renewals, payment methods, and billing history.",
};

export default function ManagerInvoicesPage() {
  return <ManagerDashboard initialActiveNav="invoices" />;
}
