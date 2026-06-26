import type { Metadata } from "next";
import { ManagerDashboard } from "@/components/manager/ManagerDashboard";

export const metadata: Metadata = {
  title: "MenuFlow | Manager Settings",
  description:
    "Customize MenuFlow workflows, restaurant profile details, billing behavior, and appearance preferences.",
};

export default function ManagerSettingsPage() {
  return <ManagerDashboard initialActiveNav="settings" />;
}
