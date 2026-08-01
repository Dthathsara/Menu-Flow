import type { Metadata } from "next";
import { WaiterDashboard } from "@/components/waiter/WaiterDashboard";

export const metadata: Metadata = {
  title: "MenuFlow | Waiter Orders",
};

export default function WaiterOrdersPage() {
  return <WaiterDashboard initialActiveNav="orders" />;
}
