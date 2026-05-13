"use client";

import { BellIcon, ChevronRightIcon, MenuToggleIcon } from "@/components/manager/icons";
import { cn } from "@/components/manager/managerUtils";
import { AdminProfileDropdown } from "./AdminProfileDropdown";
import { AdminSearchBar } from "./AdminSearchBar";
import { AdminThemeToggle } from "./AdminThemeToggle";
import { adminMutedClasses, adminTopbarClasses } from "./adminStyles";
import type { AdminNavItem, AdminScheme } from "./adminTypes";

interface AdminTopbarProps {
  scheme: AdminScheme;
  activeItem: AdminNavItem;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onToggleNavigation: () => void;
  onToggleTheme: () => void;
}

export function AdminTopbar({
  scheme,
  activeItem,
  searchQuery,
  onSearchChange,
  onToggleNavigation,
  onToggleTheme,
}: AdminTopbarProps) {
  return (
    <header className={cn("sticky top-0 z-30 overflow-visible border-b px-4 py-4 sm:px-6", adminTopbarClasses(scheme))}>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onToggleNavigation}
            className={cn(
              "inline-flex size-11 cursor-pointer items-center justify-center rounded-md border transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35 lg:hidden",
              scheme === "dark" ? "border-[#263650] bg-[#0b1424] text-white hover:bg-white/10" : "border-slate-200 bg-white text-slate-950 hover:bg-slate-100",
            )}
            aria-label="Toggle admin navigation"
          >
            <MenuToggleIcon className="size-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-extrabold tracking-tight">{activeItem.title}</h1>
            <div className={cn("mt-2 flex items-center gap-2 text-sm", adminMutedClasses(scheme))}>
              <span>MenuFlow</span>
              <ChevronRightIcon className="size-3.5" />
              <span className="truncate">{activeItem.label}</span>
            </div>
          </div>
        </div>

        <div className="relative z-20 flex flex-wrap items-center justify-end gap-2">
          <AdminSearchBar
            scheme={scheme}
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search clients, users, packages, invoices"
            className="order-last sm:order-none sm:w-[260px] xl:w-[320px]"
          />
          <button
            type="button"
            className={cn(
              "relative inline-flex size-11 cursor-pointer items-center justify-center rounded-[12px] border transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35",
              scheme === "dark"
                ? "border-[#263650] bg-[#0b1424] hover:border-blue-400/40 hover:bg-white/10"
                : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-100",
            )}
            aria-label="Notifications"
          >
            <BellIcon className="size-4.5 text-amber-300" />
            <span className="absolute right-3 top-3 size-2 rounded-full bg-rose-500" />
          </button>
          <AdminThemeToggle scheme={scheme} onToggle={onToggleTheme} />
          <AdminProfileDropdown scheme={scheme} />
        </div>
      </div>
    </header>
  );
}
