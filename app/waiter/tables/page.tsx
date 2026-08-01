import type { Metadata } from "next";
import { WaiterDashboard } from "@/components/waiter/WaiterDashboard";

export const metadata: Metadata = {
  title: "MenuFlow | Waiter Tables",
};

export default function WaiterTablesPage() {
  return <WaiterDashboard initialActiveNav="tables" />;
}
