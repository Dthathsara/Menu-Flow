import type { Metadata } from "next";
import { AdminLayout } from "@/components/admin/common/AdminLayout";

export const metadata: Metadata = {
  title: "MenuFlow | Admin Dashboard",
  description: "MenuFlow platform admin dashboard for clients, users, packages, invoices, and settings.",
};

export default function AdminPage() {
  return <AdminLayout />;
}

