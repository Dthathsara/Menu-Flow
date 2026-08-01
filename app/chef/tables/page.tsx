import type { Metadata } from "next";
import { ChefTables } from "@/components/chef/ChefTables";

export const metadata: Metadata = {
  title: "MenuFlow | Chef Tables",
};

export default function ChefTablesPage() {
  return <ChefTables />;
}
