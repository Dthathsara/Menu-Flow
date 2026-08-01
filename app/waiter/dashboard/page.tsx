import type { Metadata } from "next";
import { WaiterDashboard } from "@/components/waiter/WaiterDashboard";

export const metadata: Metadata = {
  title: "MenuFlow | Waiter Dashboard",
};

export default function WaiterDashboardPage() {
  return <WaiterDashboard initialActiveNav="dashboard" />;
}
