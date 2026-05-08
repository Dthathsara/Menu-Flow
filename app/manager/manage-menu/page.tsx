import type { Metadata } from "next";
import { ManagerDashboard } from "@/components/manager/ManagerDashboard";

export const metadata: Metadata = {
  title: "MenuFlow | Manager Manage Menu",
  description: "Manage menu items, categories, availability, and pricing.",
};

export default function ManagerManageMenuPage() {
  return <ManagerDashboard initialActiveNav="manage-menu" />;
}
