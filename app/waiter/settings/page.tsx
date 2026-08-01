import type { Metadata } from "next";
import { WaiterDashboard } from "@/components/waiter/WaiterDashboard";

export const metadata: Metadata = {
  title: "MenuFlow | Waiter Settings",
};

export default function WaiterSettingsPage() {
  return <WaiterDashboard initialActiveNav="settings" />;
}
