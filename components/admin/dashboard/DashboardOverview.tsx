"use client";

import { useState } from "react";
import { cn } from "@/components/manager/managerUtils";
import { ClientModal } from "../clients/ClientModal";
import type { ClientRecord } from "../clients/ClientTable";
import { AdminButton } from "../common/AdminButton";
import { AdminStatCard } from "../common/AdminStatCard";
import { adminCardClasses, adminMutedClasses, adminPageClasses } from "../common/adminStyles";
import type { AdminModalMode, AdminPageProps } from "../common/adminTypes";
import { PackageUsage } from "./PackageUsage";
import { RecentClientActivity } from "./RecentClientActivity";
import { RevenueOverview } from "./RevenueOverview";

const heroStats = [
  ["Total Clients", "128", "+14 this month"],
  ["Active Packages", "4", "Starter to Enterprise"],
  ["Monthly Revenue", "Rs. 1.82M", "+18.6% growth"],
  ["Unpaid Invoices", "17", "Rs. 214,500 pending"],
] as const;

const statCards = [
  { title: "Clients", value: "96", note: "Active restaurants and hotels", icon: "🏨" },
  { title: "Orders", value: "24.8K", note: "Orders processed this month", icon: "🍽" },
  { title: "QR Scans", value: "78.4K", note: "Customer menu scans", icon: "▣" },
  { title: "Staff", value: "12", note: "System admin users", icon: "👥" },
];

export function DashboardOverview({ scheme, searchQuery }: AdminPageProps) {
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<AdminModalMode>("add");

  function handleClientSave(client: ClientRecord) {
    console.log("Dummy client registered", client);
    setClientModalOpen(false);
  }

  return (
    <section className={adminPageClasses()}>
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(380px,0.95fr)]">
        <div className={cn(adminCardClasses(scheme), "relative min-h-[312px] overflow-hidden bg-[linear-gradient(135deg,#122d55,#102342_54%,#22627a)] p-8 text-white")}>
          <div className="pointer-events-none absolute bottom-0 right-0 size-[220px] rounded-full bg-cyan-400/20 blur-3xl" />
          <span className="inline-flex rounded-full bg-white/14 px-4 py-2 text-[12px] font-extrabold uppercase tracking-[0.16em]">
            ADMIN DASHBOARD
          </span>
          <h2 className="relative mt-7 max-w-3xl text-[2.35rem] font-extrabold leading-tight tracking-tight">
            Good afternoon, Dulnith Thathsara
          </h2>
          <p className="relative mt-3 max-w-3xl text-[16px] leading-7 text-blue-100">
            Here is the full MenuFlow system overview. Monitor hotels and restaurants, monthly revenue, QR activity, active packages, unpaid invoices, and staff performance.
          </p>
          <AdminButton
            scheme="dark"
            variant="primary"
            className="relative mt-6"
            onClick={() => {
              setModalMode("add");
              setClientModalOpen(true);
            }}
          >
            + Register New Client
          </AdminButton>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {heroStats.map(([title, value, note]) => (
            <div key={title} className={cn(adminCardClasses(scheme), "p-6")}>
              <div className={cn("text-sm", adminMutedClasses(scheme))}>{title}</div>
              <div className="mt-5 text-[2rem] font-extrabold tracking-tight">{value}</div>
              <div className={cn("mt-2 text-sm", adminMutedClasses(scheme))}>{note}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <AdminStatCard
            key={stat.title}
            scheme={scheme}
            title={stat.title}
            value={stat.value}
            note={stat.note}
            icon={<span>{stat.icon}</span>}
          />
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(420px,1fr)]">
        <RevenueOverview scheme={scheme} />
        <PackageUsage scheme={scheme} />
      </section>

      <RecentClientActivity
        scheme={scheme}
        searchQuery={searchQuery}
        onViewClients={() => window.dispatchEvent(new CustomEvent("menuflow-admin:navigate", { detail: "clients" }))}
      />

      <ClientModal
        key={`dashboard-client-${clientModalOpen}`}
        scheme={scheme}
        mode={modalMode}
        client={null}
        open={clientModalOpen}
        onClose={() => setClientModalOpen(false)}
        onSave={handleClientSave}
        onConfirmDelete={() => undefined}
      />
    </section>
  );
}
