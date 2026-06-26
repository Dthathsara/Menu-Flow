import type { Metadata } from "next";
import { ManagerDashboard } from "@/components/manager/ManagerDashboard";

export const metadata: Metadata = {
  title: "MenuFlow | Manager Orders",
  description: "Track live restaurant orders, fulfillment progress, and payment collection.",
};

export default function ManagerOrdersPage() {
  return <ManagerDashboard initialActiveNav="orders" />;
}
