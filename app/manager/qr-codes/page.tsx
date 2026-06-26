import type { Metadata } from "next";
import { ManagerDashboard } from "@/components/manager/ManagerDashboard";

export const metadata: Metadata = {
  title: "MenuFlow | Manager QR Codes",
  description:
    "Generate, search, download, and manage branded table QR codes for your restaurant floor.",
};

export default function ManagerQrCodesPage() {
  return <ManagerDashboard initialActiveNav="generate-qr" />;
}
