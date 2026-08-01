import type { Metadata } from "next";
import { ChefDashboard } from "@/components/chef/ChefDashboard";

export const metadata: Metadata = {
  title: "MenuFlow | Chef Dashboard",
};

export default function ChefDashboardPage() {
  return <ChefDashboard />;
}
