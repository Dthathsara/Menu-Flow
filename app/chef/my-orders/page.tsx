import type { Metadata } from "next";
import { ChefMyOrders } from "@/components/chef/ChefMyOrders";

export const metadata: Metadata = {
  title: "MenuFlow | Chef My Orders",
};

export default function ChefMyOrdersPage() {
  return <ChefMyOrders />;
}
