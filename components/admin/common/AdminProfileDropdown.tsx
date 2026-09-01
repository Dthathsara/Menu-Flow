"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDownIcon, LogoutIcon, UserIcon } from "@/components/manager/icons";
import { cn } from "@/components/manager/managerUtils";
import { clearAuthSession, getStoredAuthUser, storeAuthResponse } from "@/lib/auth-session";
import { getApiErrorMessage } from "@/lib/error-handler";
import {
  changeSystemAdminPassword,
  formatSystemStaffRole,
  getSystemAdminProfile,
  logoutSystemAdmin,
  normalizeSystemStaffRole,
  type SystemAdminProfile,
  updateSystemAdminProfile,
} from "@/lib/system-admin-api";
import { AdminModal } from "./AdminModal";
import { AdminButton } from "./AdminButton";
import { adminInputClasses, adminLabelClasses, adminMutedClasses } from "./adminStyles";
import type { AdminScheme } from "./adminTypes";

interface AdminProfileDropdownProps {
  scheme: AdminScheme;
}

interface AccountFormState {
  fullName: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

const fallbackProfile: SystemAdminProfile = {
  id: "",
  fullName: "System Admin",
  email: "admin@gmail.com",
  role: "ADMIN",
  initials: "A",
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function profileFromStoredSession(): SystemAdminProfile {
  const user = getStoredAuthUser();
  const fullName = user?.fullName || user?.name || fallbackProfile.fullName;
  const email = user?.email || fallbackProfile.email;
  const role = normalizeSystemStaffRole(user?.role);
  const initials = fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || fallbackProfile.initials;

  return {
    id: user?.id || user?.userId || "",
    fullName,
    email,
    role,
    initials,
  };
}

function createAccountForm(profile: SystemAdminProfile): AccountFormState {
  return {
    fullName: profile.fullName,
    email: profile.email,
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  };
}

export function AdminProfileDropdown({ scheme }: AdminProfileDropdownProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [profile, setProfile] = useState<SystemAdminProfile>(() => profileFromStoredSession());
  const [form, setForm] = useState<AccountFormState>(() => createAccountForm(profileFromStoredSession()));
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoadingProfile(true);
      setError("");

      try {
        const nextProfile = await getSystemAdminProfile();
        if (!active) {
          return;
        }

        setProfile(nextProfile);
        setForm(createAccountForm(nextProfile));
        const currentUser = getStoredAuthUser();
        if (!currentUser || currentUser.email !== nextProfile.email || currentUser.name !== nextProfile.fullName) {
          storeAuthResponse({ user: nextProfile });
        }
      } catch (loadError) {
        if (active) {
          setError(getApiErrorMessage(loadError, "Unable to load system admin profile."));
        }
      } finally {
        if (active) {
          setLoadingProfile(false);
        }
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, []);

  function validateAccountForm() {
    if (!form.fullName.trim()) return "Full name is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!isValidEmail(form.email)) return "Enter a valid email address.";

    const changingPassword = Boolean(form.currentPassword || form.newPassword || form.confirmNewPassword);

    if (changingPassword) {
      if (!form.currentPassword) return "Current password is required to change password.";
      if (!form.newPassword) return "New password is required.";
      if (form.newPassword.length < 8) return "New password must be at least 8 characters.";
      if (form.newPassword !== form.confirmNewPassword) return "New password and confirmation must match.";
    }

    return "";
  }

  async function handleSaveAccount() {
    if (submitting) {
      return;
    }

    const validationError = validateAccountForm();
    setError(validationError);
    setSuccess("");

    if (validationError) {
      return;
    }

    setSubmitting(true);

    try {
      const updatedProfile = await updateSystemAdminProfile({
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
      });

      const changingPassword = Boolean(form.currentPassword || form.newPassword || form.confirmNewPassword);

      if (changingPassword) {
        await changeSystemAdminPassword({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
          confirmNewPassword: form.confirmNewPassword,
        });
      }

      const nextProfile = {
        ...updatedProfile,
        initials: updatedProfile.initials || profile.initials,
      };

      setProfile(nextProfile);
      setForm({ ...createAccountForm(nextProfile), currentPassword: "", newPassword: "", confirmNewPassword: "" });
      storeAuthResponse({ user: nextProfile });
      setSuccess(changingPassword ? "Account and password updated successfully." : "Account updated successfully.");
    } catch (saveError) {
      setError(getApiErrorMessage(saveError, "Unable to update account."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignOut() {
    if (signingOut) {
      return;
    }

    setSigningOut(true);

    try {
      await logoutSystemAdmin();
    } catch {
      // Local session cleanup must still happen if the backend token is already expired.
    } finally {
      clearAuthSession();
      setOpen(false);
      setAccountOpen(false);
      router.replace("/");
      router.refresh();
    }
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
            {profile.initials}
          </span>
          <span className="hidden text-left lg:block">
            <span className="block leading-none">{profile.fullName}</span>
            <span className={cn("mt-1 block text-[11px] font-medium", adminMutedClasses(scheme))}>
              {formatSystemStaffRole(profile.role)}
            </span>
          </span>
          <ChevronDownIcon className={cn("size-4 transition", open && "rotate-180")} />
        </button>

        {open ? (
          <div className={cn("absolute right-0 top-full z-50 mt-2 w-[270px] max-w-[calc(100vw-1.5rem)] rounded-[18px] border p-3 shadow-[0_22px_60px_rgba(0,0,0,0.28)]", scheme === "dark" ? "border-[#263650] bg-[#101a2b]" : "border-slate-200 bg-white")}>
            <div className="rounded-md px-3 py-3">
              <div className="text-base font-extrabold">Welcome!</div>
              <div className={cn("mt-1 text-sm", adminMutedClasses(scheme))}>
                {loadingProfile ? "Loading profile..." : profile.email}
              </div>
            </div>
            <div className={cn("mt-1 space-y-2 border-t pt-3", scheme === "dark" ? "border-[#263650]" : "border-slate-200")}>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setError("");
                  setSuccess("");
                  setForm(createAccountForm(profile));
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
                disabled={signingOut}
                className="flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm text-rose-400 transition-all duration-200 hover:-translate-y-0.5 hover:bg-rose-500/10 hover:text-rose-300 active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogoutIcon className="size-4" />
                <span>{signingOut ? "Signing Out..." : "Sign Out"}</span>
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <AdminModal
        open={accountOpen}
        scheme={scheme}
        title="My Account"
        size="lg"
        onClose={() => !submitting && setAccountOpen(false)}
        footer={
          <>
            <AdminButton scheme={scheme} onClick={() => setAccountOpen(false)} disabled={submitting}>Cancel</AdminButton>
            <AdminButton scheme={scheme} variant="primary" onClick={handleSaveAccount} disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </AdminButton>
          </>
        }
      >
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className={adminLabelClasses(scheme)}>Full Name</span>
              <input value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} className={adminInputClasses(scheme)} />
            </label>
            <label className="space-y-2">
              <span className={adminLabelClasses(scheme)}>Email</span>
              <input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} className={adminInputClasses(scheme)} />
            </label>
            <label className="space-y-2 sm:col-span-2">
              <span className={adminLabelClasses(scheme)}>Role</span>
              <input value={formatSystemStaffRole(profile.role)} className={adminInputClasses(scheme)} disabled />
            </label>
          </div>

          <div className={cn("border-t pt-5", scheme === "dark" ? "border-[#263650]" : "border-slate-200")}>
            <div className="mb-4">
              <h3 className="text-base font-extrabold">Password</h3>
              <p className={cn("mt-1 text-sm", adminMutedClasses(scheme))}>Leave password fields blank to keep your current password.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="space-y-2">
                <span className={adminLabelClasses(scheme)}>Current Password</span>
                <input type="password" value={form.currentPassword} onChange={(event) => setForm((current) => ({ ...current, currentPassword: event.target.value }))} className={adminInputClasses(scheme)} autoComplete="current-password" />
              </label>
              <label className="space-y-2">
                <span className={adminLabelClasses(scheme)}>New Password</span>
                <input type="password" value={form.newPassword} onChange={(event) => setForm((current) => ({ ...current, newPassword: event.target.value }))} className={adminInputClasses(scheme)} autoComplete="new-password" />
              </label>
              <label className="space-y-2">
                <span className={adminLabelClasses(scheme)}>Confirm New Password</span>
                <input type="password" value={form.confirmNewPassword} onChange={(event) => setForm((current) => ({ ...current, confirmNewPassword: event.target.value }))} className={adminInputClasses(scheme)} autoComplete="new-password" />
              </label>
            </div>
          </div>

          {error ? <p className="text-sm font-semibold text-rose-400">{error}</p> : null}
          {success ? <p className="text-sm font-semibold text-emerald-400">{success}</p> : null}
        </div>
      </AdminModal>
    </>
  );
}
