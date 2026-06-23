"use client";

import type { FormEvent } from "react";
import { useEffect, useId, useRef, useState } from "react";

import { primaryButtonClassName } from "@/components/common/buttons";
import { apiUrl } from "@/lib/api-config";
import { getApiErrorMessage } from "@/lib/error-handler";
import { authJson, normalizeAuthUser, SessionExpiredError } from "@/lib/auth-session";
import { AuthInputField } from "@/components/common/inputs";
import { AuthModalShell } from "@/components/common/modals";
import { ErrorMessage } from "@/components/common/ui/ErrorMessage";
import {
  cn,
  getAuthMutedTextClasses,
  type AuthTheme,
} from "@/components/common/theme";

const PROFILE_ME_URL = apiUrl("/auth/me");

type UserProfile = {
  id?: string;
  email?: string;
  contactPersonName?: string;
  contactPersonMobileNumber?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
};

type ProfileForm = {
  email: string;
  contactPersonName: string;
  contactPersonMobileNumber: string;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  onUserUpdated: (user: UserProfile) => void;
  theme?: AuthTheme;
}

function readStoredUser(): UserProfile | null {
  const storedUser = window.localStorage.getItem("user");

  if (!storedUser) {
    return null;
  }

  try {
    return normalizeAuthUser(JSON.parse(storedUser) as UserProfile);
  } catch {
    return null;
  }
}

function getUserPayload(data: unknown): UserProfile | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const record = data as Record<string, unknown>;

  if (record.user && typeof record.user === "object") {
    return normalizeAuthUser(record.user as UserProfile);
  }

  return normalizeAuthUser(record as UserProfile);
}

function buildForm(user: UserProfile | null): ProfileForm {
  return {
    email: user?.email ?? "",
    contactPersonName:
      user?.contactPersonName ||
      [user?.firstName, user?.lastName].filter(Boolean).join(" "),
    contactPersonMobileNumber: user?.contactPersonMobileNumber || "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  };
}

function logProfileError(error: unknown) {
  console.log(
    "PROFILE ERROR",
    error instanceof Error ? error.message : "Unknown profile error",
  );
}

export function ProfileModal({
  open,
  onClose,
  onUserUpdated,
  theme = "dark",
}: ProfileModalProps) {
  const emailId = useId();
  const contactNameId = useId();
  const mobileNumberId = useId();
  const oldPasswordId = useId();
  const newPasswordId = useId();
  const confirmPasswordId = useId();
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [form, setForm] = useState<ProfileForm>(buildForm(null));
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileForm, string>>>({});
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error">("success");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }

      setErrors({});
      setStatusMessage("");
      setStatusType("success");
      setIsLoading(false);
      setIsSubmitting(false);
      setForm(buildForm(null));
      return;
    }

    const storedUser = readStoredUser();
    setForm(buildForm(storedUser));

    let isActive = true;

    async function loadProfile() {
      setIsLoading(true);
      setStatusMessage("");

      try {
        const response = await authJson<unknown>(PROFILE_ME_URL);

        if (!isActive) {
          return;
        }

        const apiUser = getUserPayload(response);
        const nextUser = { ...(storedUser || {}), ...(apiUser || {}) };
        setForm(buildForm(nextUser));
      } catch (error) {
        if (!isActive) {
          return;
        }

        logProfileError(error);
        setStatusType("error");
        setStatusMessage(
          error instanceof SessionExpiredError
            ? error.message
            : getApiErrorMessage(error, "Unable to load profile details."),
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isActive = false;
    };
  }, [open]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: Partial<Record<keyof ProfileForm, string>> = {};
    const wantsPasswordChange =
      Boolean(form.oldPassword) ||
      Boolean(form.newPassword) ||
      Boolean(form.confirmPassword);

    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    }

    if (!form.contactPersonName.trim()) {
      nextErrors.contactPersonName = "Contact person name is required.";
    }

    if (!form.contactPersonMobileNumber.trim()) {
      nextErrors.contactPersonMobileNumber = "Contact person mobile number is required.";
    }

    if (wantsPasswordChange) {
      if (!form.oldPassword) {
        nextErrors.oldPassword = "Old password is required.";
      }

      if (!form.newPassword) {
        nextErrors.newPassword = "New password is required.";
      }

      if (!form.confirmPassword) {
        nextErrors.confirmPassword = "Confirm your new password.";
      } else if (form.newPassword !== form.confirmPassword) {
        nextErrors.confirmPassword = "New password and confirmation do not match.";
      }
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStatusMessage("");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage("");

    try {
      const payload: Record<string, string> = {
        email: form.email.trim().toLowerCase(),
        contactPersonName: form.contactPersonName.trim(),
        contactPersonMobileNumber: form.contactPersonMobileNumber.trim(),
      };

      if (wantsPasswordChange) {
        payload.oldPassword = form.oldPassword;
        payload.newPassword = form.newPassword;
        payload.confirmNewPassword = form.confirmPassword;
      }

      const profileResponse = await authJson<unknown>(PROFILE_ME_URL, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const storedUser = readStoredUser();
      const apiUser = getUserPayload(profileResponse);
      const nextUser = {
        ...(storedUser || {}),
        ...(apiUser || {}),
        email: form.email.trim().toLowerCase(),
        contactPersonName: form.contactPersonName.trim(),
        contactPersonMobileNumber: form.contactPersonMobileNumber.trim(),
      };

      window.localStorage.setItem("user", JSON.stringify(nextUser));
      onUserUpdated(nextUser);
      window.dispatchEvent(new CustomEvent("menuflow:user-updated", { detail: nextUser }));

      setStatusType("success");
      setStatusMessage("Profile updated successfully.");
      setForm((current) => ({
        ...current,
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      closeTimeoutRef.current = setTimeout(() => {
        onClose();
      }, 900);
    } catch (error) {
      logProfileError(error);
      setStatusType("error");
      setStatusMessage(
        error instanceof SessionExpiredError
          ? error.message
          : getApiErrorMessage(error),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthModalShell
      open={open}
      onClose={onClose}
      theme={theme}
      title="Profile"
      subtitle="Manage your restaurant account details and update your password securely."
      maxWidthClassName="max-w-[680px]"
    >
      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        {isLoading ? (
          <p className={getAuthMutedTextClasses(theme)}>Loading profile details...</p>
        ) : null}

        <section className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
            Profile
          </h3>
          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-3">
            <AuthInputField
              id={emailId}
              theme={theme}
              label="Email"
              type="email"
              value={form.email}
              autoComplete="email"
              placeholder="team@restaurant.com"
              error={errors.email}
              onChange={(email) =>
                setForm((current) => ({ ...current, email }))
              }
            />

            <AuthInputField
              id={contactNameId}
              theme={theme}
              label="Contact person name"
              value={form.contactPersonName}
              autoComplete="name"
              placeholder="Full name"
              error={errors.contactPersonName}
              onChange={(contactPersonName) =>
                setForm((current) => ({ ...current, contactPersonName }))
              }
            />

            <AuthInputField
              id={mobileNumberId}
              theme={theme}
              label="Contact person mobile no."
              type="tel"
              value={form.contactPersonMobileNumber}
              autoComplete="tel"
              inputMode="tel"
              placeholder="+94 77 123 4567"
              error={errors.contactPersonMobileNumber}
              onChange={(contactPersonMobileNumber) =>
                setForm((current) => ({ ...current, contactPersonMobileNumber }))
              }
            />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
            Password
          </h3>
          <div className="grid gap-5 sm:grid-cols-3">
            <AuthInputField
              id={oldPasswordId}
              theme={theme}
              label="Old password"
              type="password"
              value={form.oldPassword}
              autoComplete="current-password"
              placeholder="Current password"
              error={errors.oldPassword}
              onChange={(oldPassword) =>
                setForm((current) => ({ ...current, oldPassword }))
              }
            />

            <AuthInputField
              id={newPasswordId}
              theme={theme}
              label="New password"
              type="password"
              value={form.newPassword}
              autoComplete="new-password"
              placeholder="New password"
              error={errors.newPassword}
              onChange={(newPassword) =>
                setForm((current) => ({ ...current, newPassword }))
              }
            />

            <AuthInputField
              id={confirmPasswordId}
              theme={theme}
              label="Confirm new password"
              type="password"
              value={form.confirmPassword}
              autoComplete="new-password"
              placeholder="Confirm password"
              error={errors.confirmPassword}
              onChange={(confirmPassword) =>
                setForm((current) => ({ ...current, confirmPassword }))
              }
            />
          </div>
        </section>

        <button
          type="submit"
          className={cn(primaryButtonClassName, "w-full rounded-2xl px-6 py-3.5 text-sm")}
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting ? "Saving..." : "Save"}
        </button>

        {statusType === "error" ? (
          <ErrorMessage message={statusMessage} />
        ) : statusMessage ? (
          <p
            className={cn(
              "text-sm",
              theme === "dark" ? "text-emerald-300" : "text-emerald-600",
            )}
          >
            {statusMessage}
          </p>
        ) : null}
      </form>
    </AuthModalShell>
  );
}
