import type { Metadata } from "next";
import { WaiterDashboard } from "@/components/waiter/WaiterDashboard";

export const metadata: Metadata = {
  title: "MenuFlow | My Waiter Orders",
};

export default function WaiterMyOrdersPage() {
  return <WaiterDashboard initialActiveNav="my-orders" />;
}
