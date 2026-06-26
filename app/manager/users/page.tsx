import type { Metadata } from "next";
import { ManagerDashboard } from "@/components/manager/ManagerDashboard";

export const metadata: Metadata = {
  title: "MenuFlow | Manager Users",
  description: "Manage restaurant staff records, roles, profiles, and directory actions.",
};

export default function ManagerUsersPage() {
  return <ManagerDashboard initialActiveNav="users" />;
}
