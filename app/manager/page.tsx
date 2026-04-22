import type { Metadata } from "next";
import { ManagerDashboard } from "@/components/manager/ManagerDashboard";

export const metadata: Metadata = {
  title: "MenuFlow | Manager Dashboard",
  description: "Production-style manager dashboard shell for MenuFlow.",
};

export default function ManagerPage() {
  return <ManagerDashboard />;
}
