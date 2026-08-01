import type { Metadata } from "next";
import { WaiterDashboard } from "@/components/waiter/WaiterDashboard";

export const metadata: Metadata = {
  title: "MenuFlow | Waiter Profile",
};

export default function WaiterProfilePage() {
  return <WaiterDashboard initialActiveNav="profile" />;
}
