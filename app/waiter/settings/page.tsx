import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "MenuFlow | Waiter Settings",
};

export default function WaiterSettingsPage() {
  redirect("/waiter/dashboard");
}
