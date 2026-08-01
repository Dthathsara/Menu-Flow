import type { Metadata } from "next";
import { ChefOrders } from "@/components/chef/ChefOrders";

export const metadata: Metadata = {
  title: "MenuFlow | Chef Orders",
};

export default function ChefOrdersPage() {
  return <ChefOrders />;
}
