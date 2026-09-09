"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/components/manager/managerUtils";
import { getStoredAuthUser, SessionExpiredError } from "@/lib/auth-session";
import { getApiErrorMessage, getApiStatusCode } from "@/lib/error-handler";
import {
  type CreateAdminClientInput,
  type SystemAdminPackage,
  type UpdateAdminClientInput,
  createAdminClient,
  getAdminPackages,
} from "@/lib/system-admin-api";
import {
  getAdminDashboardData,
  type SystemAdminDashboardData,
} from "@/lib/system-admin-dashboard-api";
import { ClientModal } from "../clients/ClientModal";
import { AdminButton } from "../common/AdminButton";
import { AdminStatCard } from "../common/AdminStatCard";
import { adminCardClasses, adminMutedClasses, adminPageClasses } from "../common/adminStyles";
import type { AdminModalMode, AdminPageProps } from "../common/adminTypes";
import { PackageUsage } from "./PackageUsage";
import { RecentClientActivity } from "./RecentClientActivity";
import { RevenueOverview } from "./RevenueOverview";

function getTimeOfDayGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function DashboardOverview({ scheme, searchQuery }: AdminPageProps) {
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<AdminModalMode>("add");
  const [modalError, setModalError] = useState("");
  const [submittingClient, setSubmittingClient] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [packages, setPackages] = useState<SystemAdminPackage[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isExpiredSession, setIsExpiredSession] = useState(false);
  const [dashboardData, setDashboardData] = useState<SystemAdminDashboardData | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    setIsExpiredSession(false);

    const currentUser = getStoredAuthUser();
    const adminName = currentUser?.fullName || currentUser?.name || "Dulnith Thathsara";

    try {
      const data = await getAdminDashboardData(adminName);
      setDashboardData(data);
    } catch (err) {
      const is401 =
        err instanceof SessionExpiredError ||
        getApiStatusCode(err) === 401 ||
        (err instanceof Error && err.message.toLowerCase().includes("session has expired"));

      if (is401) {
        setIsExpiredSession(true);
        setError("⚠️ Your session has expired. Please log in again.");
      } else {
        setIsExpiredSession(false);
        setError(getApiErrorMessage(err, "Failed to load dashboard data. Please try again."));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    let active = true;
    async function loadPackagesList() {
      try {
        const list = await getAdminPackages();
        if (active) {
          setPackages(list);
        }
      } catch {
        if (active) {
          setPackages([]);
        }
      }
    }
    void loadPackagesList();
    return () => {
      active = false;
    };
  }, []);

  async function handleClientSave(clientId: string | null, values: CreateAdminClientInput | UpdateAdminClientInput) {
    if (clientId || submittingClient) {
      return;
    }

    setSubmittingClient(true);
    setModalError("");

    try {
      await createAdminClient(values as CreateAdminClientInput);
      setSuccessMessage("Client created successfully.");
      setClientModalOpen(false);
      void loadData();
    } catch (err) {
      setModalError(getApiErrorMessage(err, "Unable to create client."));
    } finally {
      setSubmittingClient(false);
    }
  }

  const currentUser = getStoredAuthUser();
  const userName = currentUser?.fullName || currentUser?.name || dashboardData?.hero.greetingName || "Dulnith Thathsara";
  const greetingText = `${getTimeOfDayGreeting()}, ${userName}`;

  if (loading && !dashboardData) {
    return (
      <section className={adminPageClasses()}>
        <div className={cn(adminCardClasses(scheme), "flex min-h-[300px] flex-col items-center justify-center p-12 text-center")}>
          <div className="size-10 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
          <p className={cn("mt-4 text-base font-semibold", adminMutedClasses(scheme))}>Loading Admin Dashboard...</p>
        </div>
      </section>
    );
  }

  if (error && !dashboardData) {
    return (
      <section className={adminPageClasses()}>
        <div className={cn(adminCardClasses(scheme), "flex min-h-[300px] flex-col items-center justify-center p-12 text-center")}>
          <div className="text-4xl">⚠️</div>
          <h3 className="mt-4 text-xl font-bold">{isExpiredSession ? "Session Expired" : "Unable to Load Dashboard"}</h3>
          <p className={cn("mt-2 max-w-md text-sm", adminMutedClasses(scheme))}>{error}</p>
          <div className="mt-6 flex gap-3">
            <AdminButton scheme={scheme} variant="primary" onClick={() => void loadData()}>
              Retry
            </AdminButton>
          </div>
        </div>
      </section>
    );
  }

  const topStats = dashboardData?.topStats ?? [
    { title: "Total Clients", value: "0", note: "No clients registered" },
    { title: "Active Packages", value: "0", note: "No active packages" },
    { title: "Monthly Revenue", value: "Rs. 0", note: "No revenue calculated" },
    { title: "Unpaid Invoices", value: "0", note: "No pending invoices" },
  ];

  const mainStats = dashboardData?.mainStats ?? [
    { title: "Clients", value: "0", note: "Active restaurants and hotels", icon: "🏨" },
    { title: "Orders", value: "0", note: "Orders processed overall", icon: "🍽" },
    { title: "QR Scans", value: "0", note: "Customer menu scans", icon: "▣" },
    { title: "Staff", value: "0", note: "System admin users", icon: "👥" },
  ];

  return (
    <section className={adminPageClasses()}>
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(380px,0.95fr)]">
        <div className={cn(adminCardClasses(scheme), "relative min-h-[312px] overflow-hidden bg-[linear-gradient(135deg,#122d55,#102342_54%,#22627a)] p-8 text-white")}>
          <div className="pointer-events-none absolute bottom-0 right-0 size-[220px] rounded-full bg-cyan-400/20 blur-3xl" />
          <span className="inline-flex rounded-full bg-white/14 px-4 py-2 text-[12px] font-extrabold uppercase tracking-[0.16em]">
            ADMIN DASHBOARD
          </span>
          <h2 className="relative mt-7 max-w-3xl text-[2.35rem] font-extrabold leading-tight tracking-tight">
            {greetingText}
          </h2>
          <p className="relative mt-3 max-w-3xl text-[16px] leading-7 text-blue-100">
            {dashboardData?.hero.description || "Here is the full MenuFlow system overview. Monitor hotels and restaurants, monthly revenue, QR activity, active packages, unpaid invoices, and staff performance."}
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
          {successMessage ? <p className="relative mt-4 text-sm font-semibold text-emerald-200">{successMessage}</p> : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {topStats.map((stat) => (
            <div key={stat.title} className={cn(adminCardClasses(scheme), "p-6")}>
              <div className={cn("text-sm", adminMutedClasses(scheme))}>{stat.title}</div>
              <div className="mt-5 text-[2rem] font-extrabold tracking-tight">{stat.value}</div>
              <div className={cn("mt-2 text-sm", adminMutedClasses(scheme))}>{stat.note}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {mainStats.map((stat) => (
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
        <RevenueOverview scheme={scheme} data={dashboardData?.revenueOverview} />
        <PackageUsage scheme={scheme} data={dashboardData?.packageUsage} />
      </section>

      <RecentClientActivity
        scheme={scheme}
        searchQuery={searchQuery}
        data={dashboardData?.recentActivity}
        onViewClients={() => window.dispatchEvent(new CustomEvent("menuflow-admin:navigate", { detail: "clients" }))}
      />

      <ClientModal
        key={`dashboard-client-${clientModalOpen}`}
        scheme={scheme}
        mode={modalMode}
        client={null}
        packages={packages}
        open={clientModalOpen}
        submitting={submittingClient}
        error={modalError}
        onClose={() => !submittingClient && setClientModalOpen(false)}
        onSave={handleClientSave}
        onConfirmDelete={async () => undefined}
      />
    </section>
  );
}

