import type { Metadata } from "next";
import { WaiterDashboard } from "@/components/waiter/WaiterDashboard";

export const metadata: Metadata = {
  title: "MenuFlow | Waiter Notifications",
};

export default function WaiterNotificationsPage() {
  return <WaiterDashboard initialActiveNav="notifications" />;
}
