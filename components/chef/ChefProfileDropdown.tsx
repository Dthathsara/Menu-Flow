"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDownIcon,
  LogoutIcon,
  MenuBookIcon,
  UserIcon,
} from "@/components/manager/icons";
import {
  cn,
  getFocusRingClasses,
  getMutedTextClasses,
  getPopoverClasses,
  getToolbarControlClasses,
} from "@/components/manager/managerUtils";
import type { Scheme } from "@/components/manager/managerTypes";
import { useOnClickOutside } from "@/components/manager/useOnClickOutside";
import {
  getStoredAuthUser,
  initializeSessionActivity,
} from "@/lib/auth-session";
import {
  fetchChefProfile,
  getStoredChefTenantId,
  logoutChefSession,
} from "@/lib/chef-api";
import { ChefAccountModal } from "./ChefAccountModal";
import type { ChefProfile } from "./types";

interface ChefProfileDropdownProps {
  open: boolean;
  scheme: Scheme;
  triggerClassName: string;
  onToggle: () => void;
  onClose: () => void;
}

function profileFromStoredUser(): ChefProfile | null {
  const user = getStoredAuthUser();

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.contactPersonName || user.email,
    email: user.email,
    phone: user.contactPersonMobileNumber,
    role: user.role || "chef",
    restaurantId: user.restaurantId,
    tenantId: user.tenantId,
  };
}

export function ChefProfileDropdown({
  open,
  scheme,
  triggerClassName,
  onToggle,
  onClose,
}: ChefProfileDropdownProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const menuProfileRequestRef = useRef<Promise<ChefProfile> | null>(null);
  const [profile, setProfile] = useState<ChefProfile | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [menuError, setMenuError] = useState("");
  const [menuLoading, setMenuLoading] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useOnClickOutside(rootRef, onClose, open);

  useEffect(() => {
    initializeSessionActivity();
    setProfile(profileFromStoredUser());

    function handleUserUpdated() {
      setProfile(profileFromStoredUser());
    }

    window.addEventListener("storage", handleUserUpdated);
    window.addEventListener("menuflow:user-updated", handleUserUpdated);

    return () => {
      window.removeEventListener("storage", handleUserUpdated);
      window.removeEventListener("menuflow:user-updated", handleUserUpdated);
    };
  }, []);

  const controlClasses = triggerClassName || getToolbarControlClasses("light", scheme);
  const displayName = profile?.name || profile?.email || "Chef";
  const displayRole = profile?.role || "chef";
  const displayEmail = profile?.email || "";
  const initials = (displayName || "?")[0].toUpperCase();

  const handleProfileUpdated = useCallback((nextProfile: ChefProfile) => {
    setProfile(nextProfile);
  }, []);

  function cacheResolvedProfile(nextProfile: ChefProfile) {
    const storedUser = window.localStorage.getItem("user");
    let currentUser: Record<string, unknown> = {};

    try {
      currentUser = storedUser ? JSON.parse(storedUser) as Record<string, unknown> : {};
    } catch {
      currentUser = {};
    }

    const nextUser = {
      ...currentUser,
      id: nextProfile.id,
      email: nextProfile.email,
      role: nextProfile.role,
      tenantId: nextProfile.tenantId,
      restaurantId: nextProfile.restaurantId,
      contactPersonName: nextProfile.name,
      contactPersonMobileNumber: nextProfile.phone,
    };

    window.localStorage.setItem("user", JSON.stringify(nextUser));
    window.dispatchEvent(new CustomEvent("menuflow:user-updated", { detail: nextUser }));
  }

  async function handleOpenCustomerMenu() {
    if (menuLoading) {
      return;
    }

    setMenuLoading(true);
    setMenuError("");

    try {
      let tenantId = getStoredChefTenantId();

      if (!tenantId) {
        if (!menuProfileRequestRef.current) {
          menuProfileRequestRef.current = fetchChefProfile();
        }

        const chefProfile = await menuProfileRequestRef.current;
        tenantId = chefProfile.tenantId || chefProfile.restaurantId;
        cacheResolvedProfile(chefProfile);
        handleProfileUpdated(chefProfile);
      }

      if (!tenantId) {
        setMenuError("Your account is not connected to a restaurant menu.");
        return;
      }

      window.open(
        `/customer?tenantId=${encodeURIComponent(tenantId)}`,
        "_blank",
        "noopener,noreferrer",
      );
      onClose();
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error(error);
      }

      setMenuError("Unable to open the restaurant menu. Please try again.");
    } finally {
      setMenuLoading(false);
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await logoutChefSession();
    } finally {
      onClose();
      router.replace("/");
      setSigningOut(false);
    }
  }

  return (
    <>
      <div className="relative z-20 shrink-0" ref={rootRef}>
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "inline-flex h-11 items-center gap-3 rounded-lg border px-2.5 pr-3 text-sm font-semibold",
            controlClasses,
            getFocusRingClasses(scheme),
          )}
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-[linear-gradient(135deg,#60a5fa,#2563eb)] text-xs font-bold text-white">
            {initials}
          </span>
          <span className="hidden text-left lg:block">
            <span className="block max-w-32 truncate leading-none">{displayName}</span>
            <span className={cn("mt-1 block text-[11px] font-medium capitalize", controlClasses.includes("text-white") ? "text-white/72" : getMutedTextClasses(scheme))}>
              {displayRole}
            </span>
          </span>
          <ChevronDownIcon className={cn("size-4 transition", open && "rotate-180")} />
        </button>

        {open ? (
          <div className={cn("absolute right-0 top-full z-50 mt-2 w-60 max-w-[calc(100vw-1.5rem)] rounded-lg border p-2", getPopoverClasses(scheme))}>
            <div className="rounded-md px-3 py-2">
              <div className="text-sm font-semibold">Welcome!</div>
              <div className={cn("mt-1 truncate text-xs", getMutedTextClasses(scheme))}>
                {displayEmail}
              </div>
            </div>

            <div className="mt-1 space-y-1">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setAccountOpen(true);
                }}
                className={cn("flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-all duration-200 ease-out", scheme === "dark" ? "text-slate-200 hover:bg-white/8 hover:text-white" : "text-slate-700 hover:bg-slate-50 hover:text-slate-900", getFocusRingClasses(scheme))}
              >
                <UserIcon className="size-4" />
                <span>My Account</span>
              </button>

              <button
                type="button"
                onClick={() => void handleOpenCustomerMenu()}
                disabled={menuLoading}
                className={cn("flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-all duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-60", scheme === "dark" ? "text-slate-200 hover:bg-white/8 hover:text-white" : "text-slate-700 hover:bg-slate-50 hover:text-slate-900", getFocusRingClasses(scheme))}
              >
                <MenuBookIcon className="size-4" />
                <span>{menuLoading ? "Opening..." : "Our Menu"}</span>
              </button>

              {menuError ? (
                <p className="px-3 py-1 text-xs font-medium text-rose-400">
                  {menuError}
                </p>
              ) : null}

              <button
                type="button"
                onClick={() => void handleSignOut()}
                disabled={signingOut}
                className={cn("flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm text-rose-500 transition-all duration-200 ease-out hover:bg-rose-500/10 hover:text-rose-400 disabled:cursor-not-allowed disabled:opacity-60", getFocusRingClasses(scheme))}
              >
                <LogoutIcon className="size-4" />
                <span>{signingOut ? "Signing out..." : "Sign Out"}</span>
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <ChefAccountModal
        open={accountOpen}
        theme={scheme}
        onClose={() => setAccountOpen(false)}
        onProfileUpdated={handleProfileUpdated}
      />
    </>
  );
}
