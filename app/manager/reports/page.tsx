import type { Metadata } from "next";
import { ManagerDashboard } from "@/components/manager/ManagerDashboard";

export const metadata: Metadata = {
  title: "MenuFlow | Manager Reports",
  description: "Track restaurant performance, revenue, QR activity, and staff reporting metrics.",
};

export default function ManagerReportsPage() {
  return <ManagerDashboard initialActiveNav="reports" />;
}
