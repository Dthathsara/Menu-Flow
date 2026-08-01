"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  type AuthRole,
  getAccessToken,
  getDashboardPathForRole,
  getStoredAuthRole,
} from "@/lib/auth-session";

interface RoleGuardProps {
  allowedRole: AuthRole;
  children: React.ReactNode;
}

function subscribeToAuthChanges(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("menuflow:user-updated", onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("menuflow:user-updated", onStoreChange);
  };
}

function getAuthSnapshot() {
  return `${getAccessToken() ? "authenticated" : "anonymous"}:${getStoredAuthRole()}`;
}

function getServerAuthSnapshot() {
  return "anonymous:";
}

export function RoleGuard({ allowedRole, children }: RoleGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const authSnapshot = useSyncExternalStore(
    subscribeToAuthChanges,
    getAuthSnapshot,
    getServerAuthSnapshot,
  );
  const [status, role] = authSnapshot.split(":");
  const authorized = status === "authenticated" && role === allowedRole;

  useEffect(() => {
    if (status !== "authenticated" || !role) {
      router.replace("/");
      return;
    }

    if (role !== allowedRole) {
      router.replace(getDashboardPathForRole(role) || "/");
    }
  }, [allowedRole, pathname, role, router, status]);

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
