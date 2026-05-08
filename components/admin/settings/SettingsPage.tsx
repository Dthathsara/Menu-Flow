"use client";

import { useState } from "react";
import { cn } from "@/components/manager/managerUtils";
import { AdminButton } from "../common/AdminButton";
import { adminCardClasses, adminInputClasses, adminLabelClasses, adminMutedClasses, adminPageClasses } from "../common/adminStyles";
import type { AdminPageProps } from "../common/adminTypes";

function Toggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn("relative h-7 w-12 shrink-0 cursor-pointer rounded-full transition-all duration-200 hover:brightness-110 active:scale-[0.98]", enabled ? "bg-[#2f6df6]" : "bg-slate-500/40")}
      aria-pressed={enabled}
    >
      <span className={cn("absolute top-1 size-5 rounded-full bg-white shadow transition-all duration-200", enabled ? "left-6" : "left-1")} />
    </button>
  );
}

function SettingsTile({
  scheme,
  title,
  description,
  label,
  enabled,
  onToggle,
}: {
  scheme: AdminPageProps["scheme"];
  title: string;
  description: string;
  label: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={cn(adminCardClasses(scheme), "p-5")}>
      <h3 className="text-lg font-extrabold">{title}</h3>
      <p className={cn("mt-5 text-sm leading-6", adminMutedClasses(scheme))}>{description}</p>
      <div className="mt-5 flex items-center justify-between">
        <span className="font-extrabold">{label}</span>
        <Toggle enabled={enabled} onToggle={onToggle} />
      </div>
    </div>
  );
}

export function SettingsPage({ scheme }: AdminPageProps) {
  const [settings, setSettings] = useState({
    darkMode: scheme === "dark",
    invoiceReminder: true,
    qrAnalytics: true,
  });
  const [companyName, setCompanyName] = useState("MenuFlow");
  const [supportEmail, setSupportEmail] = useState("support@menuflow.lk");
  const [currency, setCurrency] = useState("Rs. LKR");

  function toggle(key: keyof typeof settings) {
    setSettings((current) => ({ ...current, [key]: !current[key] }));
  }

  return (
    <section className={adminPageClasses()}>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-extrabold">Settings</h2>
        <AdminButton scheme={scheme} variant="primary" onClick={() => window.alert("Settings saved")}>Save Changes</AdminButton>
      </div>

      <section className="grid gap-5 xl:grid-cols-3">
        <SettingsTile scheme={scheme} title="System Theme" description="Change light or dark mode for the admin dashboard." label="Dark Mode" enabled={settings.darkMode} onToggle={() => toggle("darkMode")} />
        <SettingsTile scheme={scheme} title="Invoice Reminder" description="Send automatic reminders to clients before payment due dates." label="Enabled" enabled={settings.invoiceReminder} onToggle={() => toggle("invoiceReminder")} />
        <SettingsTile scheme={scheme} title="QR Analytics" description="Collect QR scan analytics for admin reports and charts." label="Enabled" enabled={settings.qrAnalytics} onToggle={() => toggle("qrAnalytics")} />
      </section>

      <section className={cn(adminCardClasses(scheme), "p-5")}>
        <h3 className="text-lg font-extrabold">Company Details</h3>
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          <label className="space-y-2">
            <span className={adminLabelClasses(scheme)}>Company Name</span>
            <input value={companyName} onChange={(event) => setCompanyName(event.target.value)} className={adminInputClasses(scheme)} />
          </label>
          <label className="space-y-2">
            <span className={adminLabelClasses(scheme)}>Support Email</span>
            <input value={supportEmail} onChange={(event) => setSupportEmail(event.target.value)} className={adminInputClasses(scheme)} />
          </label>
          <label className="space-y-2">
            <span className={adminLabelClasses(scheme)}>Default Currency</span>
            <select value={currency} onChange={(event) => setCurrency(event.target.value)} className={adminInputClasses(scheme)}>
              <option>Rs. LKR</option>
              <option>USD</option>
              <option>EUR</option>
            </select>
          </label>
        </div>
      </section>
    </section>
  );
}
