"use client";

import { cn } from "@/components/manager/managerUtils";
import { adminMutedClasses, adminSidebarClasses } from "./adminStyles";
import type { AdminNavItem, AdminScheme, AdminTab } from "./adminTypes";

interface AdminSidebarProps {
  scheme: AdminScheme;
  activeTab: AdminTab;
  navItems: AdminNavItem[];
  open: boolean;
  onSelect: (tab: AdminTab) => void;
  onClose: () => void;
  onAddPackage?: () => void;
}

function getIcon(icon: AdminNavItem["icon"]) {
  switch (icon) {
    case "clients":
      return "🏨";
    case "users":
      return "👥";
    case "packages":
      return "📦";
    case "invoices":
      return "🧾";
    case "settings":
      return "⚙";
    case "dashboard":
    default:
      return "▦";
  }
}

export function AdminSidebar({
  scheme,
  activeTab,
  navItems,
  open,
  onSelect,
  onClose,
  onAddPackage,
}: AdminSidebarProps) {
  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,#2f6df6,#45c7ff)] text-sm font-extrabold text-white">
          MF
        </div>
        <div>
          <div className="text-xl font-extrabold leading-none">MenuFlow</div>
          <div className={cn("mt-1 text-xs", adminMutedClasses(scheme))}>System Admin Panel</div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className={cn(
            "ml-auto inline-flex size-10 cursor-pointer items-center justify-center rounded-md border transition-all duration-200 active:scale-[0.98] lg:hidden",
            scheme === "dark" ? "border-white/12 bg-white/10 hover:bg-white/15 hover:text-white" : "border-slate-200 bg-white hover:bg-slate-100",
          )}
          aria-label="Close admin sidebar"
        >
          <span className="text-lg">×</span>
        </button>
      </div>

      <div className="mt-8 min-h-0 flex-1 overflow-y-auto">
        <div className={cn("px-3 text-[12px] font-extrabold uppercase tracking-[0.22em]", adminMutedClasses(scheme))}>
          MAIN MENU
        </div>
        <nav className="mt-3 space-y-3 pb-4">
          {navItems.map((item) => {
            const Icon = getIcon(item.icon);
            const active = item.key === activeTab;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  onSelect(item.key);
                  onClose();
                }}
                className={cn(
                  "group/nav flex w-full cursor-pointer items-center gap-3 rounded-[14px] px-5 py-3.5 text-left text-[15px] font-extrabold transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35",
                  active
                    ? "bg-[#2f61e8] text-white shadow-[0_18px_30px_rgba(47,97,232,0.28)] ring-1 ring-white/70"
                    : scheme === "dark"
                      ? "text-[#b7c9e5] hover:bg-blue-500/10 hover:text-white"
                      : "text-slate-600 hover:bg-blue-50 hover:text-slate-950",
                )}
              >
                <span className="flex w-5 shrink-0 justify-center text-[15px]">
                  {Icon}
                </span>
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
      <div className={cn("rounded-[18px] border p-4", scheme === "dark" ? "border-[#254063] bg-[#10233b]" : "border-blue-100 bg-blue-50")}>
        <div className="text-base font-extrabold">Admin Tip</div>
        <p className={cn("mt-2 text-sm leading-6", adminMutedClasses(scheme))}>
          Track clients, packages, staff users, and monthly invoices from one place.
        </p>
        <button
          type="button"
          onClick={onAddPackage}
          className="mt-4 inline-flex h-10 cursor-pointer items-center rounded-[11px] bg-[#2f6df6] px-4 text-sm font-extrabold text-white shadow-[0_14px_28px_rgba(47,109,246,0.24)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-[0_16px_34px_rgba(59,130,246,0.32)] active:translate-y-0 active:scale-[0.98]"
        >
          + Add Package
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className={cn("hidden lg:sticky lg:top-0 lg:block lg:h-screen lg:w-[280px] border-r p-[18px]", adminSidebarClasses(scheme))}>
        {sidebarContent}
      </aside>
      {open ? (
        <>
          <button type="button" className="fixed inset-0 z-40 cursor-pointer bg-slate-950/40 backdrop-blur-[2px] lg:hidden" aria-label="Close sidebar" onClick={onClose} />
          <aside className={cn("fixed inset-y-4 left-4 z-50 w-[276px] max-w-[calc(100vw-2rem)] rounded-[20px] border p-4 lg:hidden", adminSidebarClasses(scheme))}>
            {sidebarContent}
          </aside>
        </>
      ) : null}
    </>
  );
}
