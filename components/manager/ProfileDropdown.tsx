"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDownIcon, LogoutIcon, UserIcon } from "./icons";
import { cn, getFocusRingClasses, getMutedTextClasses, getPopoverClasses } from "./managerUtils";
import { ProfileModal } from "./ProfileModal";
import { useOnClickOutside } from "./useOnClickOutside";
import { initializeSessionActivity } from "@/lib/auth-session";
import type { Scheme } from "./managerTypes";

type StoredUser = {
  id?: string;
  tenantId?: string;
  email?: string;
  businessEmail?: string;
  hotelName?: string;
  businessType?: string;
  businessLocation?: string;
  kitchenCloseTime?: string;
  contactPersonName?: string;
  contactPersonMobileNumber?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
};

interface ProfileDropdownProps {
  open: boolean;
  scheme: Scheme;
  triggerClassName: string;
  onToggle: () => void;
  onClose: () => void;
}

export function ProfileDropdown({
  open,
  scheme,
  triggerClassName,
  onToggle,
  onClose,
}: ProfileDropdownProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [menuError, setMenuError] = useState("");

  useOnClickOutside(rootRef, onClose, open);

  useEffect(() => {
    initializeSessionActivity();

    const timeoutId = window.setTimeout(() => {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser(null);
        }
      }
    }, 0);

    function handleUserUpdated(event: Event) {
      const detail = (event as CustomEvent<StoredUser>).detail;

      if (detail) {
        setUser(detail);
      }
    }

    window.addEventListener("menuflow:user-updated", handleUserUpdated);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("menuflow:user-updated", handleUserUpdated);
    };
  }, []);

  const displayName = user?.contactPersonName || "";
  const displayRole = user?.role || "";
  const displayEmail = user?.businessEmail || "";
  const initials =
    (user?.contactPersonName ||
      user?.businessEmail ||
      "?")[0].toUpperCase();

  function handleOpenProfileModal() {
    onClose();
    setProfileModalOpen(true);
  }

  function handleOpenCustomerMenu() {
    const tenantId =
      typeof user?.tenantId === "string" ? user.tenantId.trim() : "";

    if (!tenantId) {
      setMenuError("Your account is not connected to a restaurant.");
      return;
    }

    setMenuError("");
    onClose();
    window.open(
      `/customer?tenantId=${encodeURIComponent(tenantId)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  function handleSignOut() {
    window.localStorage.removeItem("accessToken");
    window.localStorage.removeItem("refreshToken");
    window.localStorage.removeItem("user");
    onClose();
    router.push("/");
  }

  return (
    <>
      <div className="relative z-20 shrink-0" ref={rootRef}>
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "inline-flex h-11 items-center gap-3 rounded-lg border px-2.5 pr-3 text-sm font-semibold",
            triggerClassName,
            getFocusRingClasses(scheme),
          )}
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-[linear-gradient(135deg,#60a5fa,#2563eb)] text-xs font-bold text-white">
            {initials}
          </span>
          <span className="hidden text-left lg:block">
            <span className="block leading-none">{displayName}</span>
            <span className={cn("mt-1 block text-[11px] font-medium", triggerClassName.includes("text-white") ? "text-white/72" : getMutedTextClasses(scheme))}>
              {displayRole}
            </span>
          </span>
          <ChevronDownIcon
            className={cn("size-4 transition", open && "rotate-180")}
          />
        </button>

        {open ? (
          <div
            className={cn(
              "absolute right-0 top-full z-50 mt-2 w-60 max-w-[calc(100vw-1.5rem)] rounded-lg border p-2",
              getPopoverClasses(scheme),
            )}
          >
            <div className="rounded-md px-3 py-2">
              <div className="text-sm font-semibold">Welcome!</div>
              <div className={cn("mt-1 text-xs", getMutedTextClasses(scheme))}>
                {displayEmail}
              </div>
            </div>

            <div className="mt-1 space-y-1">
              <button
                type="button"
                onClick={handleOpenProfileModal}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-all duration-200 ease-out",
                  scheme === "dark"
                    ? "text-slate-200 hover:bg-white/8 hover:text-white"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900",
                  getFocusRingClasses(scheme),
                )}
              >
                <UserIcon className="size-4" />
                <span>My Account</span>
              </button>

              <button
                type="button"
                onClick={handleOpenCustomerMenu}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-all duration-200 ease-out",
                  scheme === "dark"
                    ? "text-slate-200 hover:bg-white/8 hover:text-white"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900",
                  getFocusRingClasses(scheme),
                )}
              >
                <UserIcon className="size-4" />
                <span>Our Menu</span>
              </button>

              {menuError ? (
                <p className="px-3 py-1 text-xs font-medium text-rose-400">
                  {menuError}
                </p>
              ) : null}

              <button
                type="button"
                onClick={handleSignOut}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm text-rose-500 transition-all duration-200 ease-out hover:bg-rose-500/10 hover:text-rose-400",
                  getFocusRingClasses(scheme),
                )}
              >
                <LogoutIcon className="size-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <ProfileModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onUserUpdated={setUser}
        theme="dark"
      />
    </>
  );
}
