"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon, LogoutIcon, UserIcon } from "@/components/manager/icons";
import { cn } from "@/components/manager/managerUtils";
import { ADMIN_PROFILE } from "./adminData";
import { AdminModal } from "./AdminModal";
import { AdminButton } from "./AdminButton";
import { adminInputClasses, adminLabelClasses, adminMutedClasses } from "./adminStyles";
import type { AdminScheme, AdminUserProfile } from "./adminTypes";

interface AdminProfileDropdownProps {
  scheme: AdminScheme;
}

export function AdminProfileDropdown({ scheme }: AdminProfileDropdownProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [profile, setProfile] = useState<AdminUserProfile>(() => {
    if (typeof window === "undefined") {
      return ADMIN_PROFILE;
    }
    const storedUser = window.localStorage.getItem("user");
    if (!storedUser) {
      return ADMIN_PROFILE;
    }
    try {
      const parsed = JSON.parse(storedUser) as Partial<AdminUserProfile> & {
        contactPersonName?: string;
      };
      return {
        name: parsed.name || parsed.contactPersonName || ADMIN_PROFILE.name,
        email: parsed.email || ADMIN_PROFILE.email,
        role: parsed.role || ADMIN_PROFILE.role,
      };
    } catch {
      return ADMIN_PROFILE;
    }
  });
  const [password, setPassword] = useState("");

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSignOut() {
    console.log("MenuFlow admin sign out clicked");
    window.alert("Sign out clicked");
    setOpen(false);
  }

  return (
    <>
      <div className="relative z-30 shrink-0" ref={rootRef}>
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className={cn(
            "inline-flex h-[54px] cursor-pointer items-center gap-3 rounded-[14px] border px-3 pr-4 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35",
            scheme === "dark"
              ? "border-blue-500/70 bg-[#0b1424] text-white shadow-[0_0_0_3px_rgba(47,109,246,0.12)] hover:bg-white/10"
              : "border-blue-300 bg-white text-slate-950 shadow-[0_0_0_3px_rgba(47,109,246,0.12)] hover:bg-slate-100",
          )}
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-[linear-gradient(135deg,#60a5fa,#2563eb)] text-xs font-bold text-white">
            D
          </span>
          <span className="hidden text-left lg:block">
            <span className="block leading-none">{profile.name}</span>
            <span className={cn("mt-1 block text-[11px] font-medium", adminMutedClasses(scheme))}>
              {profile.role}
            </span>
          </span>
          <ChevronDownIcon className={cn("size-4 transition", open && "rotate-180")} />
        </button>

        {open ? (
          <div className={cn("absolute right-0 top-full z-50 mt-2 w-[270px] max-w-[calc(100vw-1.5rem)] rounded-[18px] border p-3 shadow-[0_22px_60px_rgba(0,0,0,0.28)]", scheme === "dark" ? "border-[#263650] bg-[#101a2b]" : "border-slate-200 bg-white")}>
            <div className="rounded-md px-3 py-3">
              <div className="text-base font-extrabold">Welcome!</div>
              <div className={cn("mt-1 text-sm", adminMutedClasses(scheme))}>{profile.email}</div>
            </div>
            <div className={cn("mt-1 space-y-2 border-t pt-3", scheme === "dark" ? "border-[#263650]" : "border-slate-200")}>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setAccountOpen(true);
                }}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]",
                  scheme === "dark" ? "hover:bg-white/10 hover:text-white" : "hover:bg-slate-100 hover:text-slate-950",
                )}
              >
                <UserIcon className="size-4 text-violet-400" />
                <span className="font-extrabold">My Account</span>
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm text-rose-400 transition-all duration-200 hover:-translate-y-0.5 hover:bg-rose-500/10 hover:text-rose-300 active:translate-y-0 active:scale-[0.99]"
              >
                <LogoutIcon className="size-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <AdminModal
        open={accountOpen}
        scheme={scheme}
        title="Add My Account"
        size="lg"
        onClose={() => setAccountOpen(false)}
        footer={
          <>
            <AdminButton scheme={scheme} onClick={() => setAccountOpen(false)}>Cancel</AdminButton>
            <AdminButton
              scheme={scheme}
              variant="primary"
              onClick={() => {
                setPassword("");
                setAccountOpen(false);
              }}
            >
              Save
            </AdminButton>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className={adminLabelClasses(scheme)}>Name</span>
            <input value={profile.name} onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))} className={adminInputClasses(scheme)} />
          </label>
          <label className="space-y-2">
            <span className={adminLabelClasses(scheme)}>Email</span>
            <input value={profile.email} onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))} className={adminInputClasses(scheme)} />
          </label>
          <label className="space-y-2">
            <span className={adminLabelClasses(scheme)}>Role</span>
            <input value={profile.role} onChange={(event) => setProfile((current) => ({ ...current, role: event.target.value }))} className={adminInputClasses(scheme)} />
          </label>
          <label className="space-y-2">
            <span className={adminLabelClasses(scheme)}>Password</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter new password" className={adminInputClasses(scheme)} />
          </label>
        </div>
      </AdminModal>
    </>
  );
}
