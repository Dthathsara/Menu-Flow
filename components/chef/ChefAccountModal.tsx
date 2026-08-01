"use client";

import type { FormEvent } from "react";
import { useEffect, useId, useRef, useState } from "react";
import { primaryButtonClassName } from "@/components/common/buttons";
import { AuthInputField } from "@/components/common/inputs";
import { AuthModalShell } from "@/components/common/modals";
import { ErrorMessage } from "@/components/common/ui/ErrorMessage";
import { cn, getAuthMutedTextClasses, type AuthTheme } from "@/components/common/theme";
import { getApiErrorMessage } from "@/lib/error-handler";
import {
  changeChefPassword,
  fetchChefProfile,
  updateChefProfile,
} from "@/lib/chef-api";
import type { ChefProfile } from "./types";

interface ChefAccountModalProps {
  open: boolean;
  theme: AuthTheme;
  onClose: () => void;
  onProfileUpdated: (profile: ChefProfile) => void;
}

type AccountForm = {
  name: string;
  email: string;
  phone: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const PHONE_PATTERN = /^\+?[0-9\s().-]{7,24}$/;
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;

function buildForm(profile: ChefProfile | null): AccountForm {
  return {
    name: profile?.name ?? "",
    email: profile?.email ?? "",
    phone: profile?.phone ?? "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };
}

function isValidPhone(value: string) {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");

  return digits.length >= 7 && digits.length <= 15 && PHONE_PATTERN.test(trimmed);
}

function getChefAccountErrorMessage(error: unknown) {
  const message = getApiErrorMessage(error, "").toLowerCase();

  if (
    message.includes("old password is incorrect") ||
    message.includes("current password is incorrect") ||
    message.includes("wrong password") ||
    message.includes("incorrect password")
  ) {
    return "Current password is incorrect.";
  }

  if (message.includes("phone")) {
    return "The phone number is invalid.";
  }

  if (message.includes("new password must be different")) {
    return "New password must be different from current password.";
  }

  if (message.includes("upper") || message.includes("special character")) {
    return "New password must include upper, lower, number, and special character.";
  }

  return "Unable to update account. Please try again.";
}

function profilesMatch(form: AccountForm, profile: ChefProfile | null) {
  if (!profile) {
    return false;
  }

  return form.name.trim() === profile.name.trim() && form.phone.trim() === profile.phone.trim();
}

function updateStoredChefProfile(profile: ChefProfile) {
  const storedUser = window.localStorage.getItem("user");
  let currentUser: Record<string, unknown> = {};

  try {
    currentUser = storedUser ? JSON.parse(storedUser) as Record<string, unknown> : {};
  } catch {
    currentUser = {};
  }

  const nextUser = {
    ...currentUser,
    id: profile.id,
    email: profile.email,
    role: profile.role,
    tenantId: profile.tenantId,
    restaurantId: profile.restaurantId,
    contactPersonName: profile.name,
    contactPersonMobileNumber: profile.phone,
  };

  window.localStorage.setItem("user", JSON.stringify(nextUser));
  window.dispatchEvent(new CustomEvent("menuflow:user-updated", { detail: nextUser }));
}

export function ChefAccountModal({
  open,
  theme,
  onClose,
  onProfileUpdated,
}: ChefAccountModalProps) {
  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const currentPasswordId = useId();
  const newPasswordId = useId();
  const confirmPasswordId = useId();
  const [form, setForm] = useState<AccountForm>(buildForm(null));
  const [errors, setErrors] = useState<Partial<Record<keyof AccountForm, string>>>({});
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error">("success");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadedProfile, setLoadedProfile] = useState<ChefProfile | null>(null);
  const onProfileUpdatedRef = useRef(onProfileUpdated);
  const loadedForOpenRef = useRef(false);
  const profileRequestRef = useRef<Promise<ChefProfile> | null>(null);
  const submitInFlightRef = useRef(false);

  useEffect(() => {
    onProfileUpdatedRef.current = onProfileUpdated;
  }, [onProfileUpdated]);

  useEffect(() => {
    if (!open) {
      loadedForOpenRef.current = false;
      profileRequestRef.current = null;
      setForm(buildForm(null));
      setErrors({});
      setStatusMessage("");
      setStatusType("success");
      setIsLoading(false);
      setIsSubmitting(false);
      setLoadedProfile(null);
      submitInFlightRef.current = false;
      return;
    }

    if (loadedForOpenRef.current) {
      return;
    }

    loadedForOpenRef.current = true;

    let active = true;

    async function loadProfile() {
      setIsLoading(true);
      setStatusMessage("");

      try {
        if (!profileRequestRef.current) {
          profileRequestRef.current = fetchChefProfile();
        }

        const profile = await profileRequestRef.current;
        if (!active) {
          return;
        }

        setForm(buildForm(profile));
        setLoadedProfile(profile);
        onProfileUpdatedRef.current(profile);
      } catch (error) {
        if (!active) {
          return;
        }

        setStatusType("error");
        setStatusMessage(getApiErrorMessage(error, "Unable to load chef profile."));
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, [open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting || submitInFlightRef.current) {
      return;
    }

    const nextErrors: Partial<Record<keyof AccountForm, string>> = {};
    const wantsPasswordChange =
      Boolean(form.currentPassword) ||
      Boolean(form.newPassword) ||
      Boolean(form.confirmPassword);

    if (!form.name.trim()) {
      nextErrors.name = "Name is required.";
    }

    if (!form.phone.trim()) {
      nextErrors.phone = "Phone number is required.";
    } else if (!isValidPhone(form.phone)) {
      nextErrors.phone = "Enter a valid phone number.";
    }

    if (wantsPasswordChange) {
      if (!form.currentPassword) {
        nextErrors.currentPassword = "Current password is required.";
      }

      if (!form.newPassword) {
        nextErrors.newPassword = "New password is required.";
      } else if (form.newPassword.length < 8) {
        nextErrors.newPassword = "Use at least 8 characters.";
      } else if (!PASSWORD_PATTERN.test(form.newPassword)) {
        nextErrors.newPassword = "Use upper, lower, number, and special character.";
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

    const hasProfileChanges = !profilesMatch(form, loadedProfile);

    if (!hasProfileChanges && !wantsPasswordChange) {
      setStatusType("success");
      setStatusMessage("");
      return;
    }

    submitInFlightRef.current = true;
    setIsSubmitting(true);
    setStatusMessage("");

    let profile = loadedProfile;
    const successMessages: string[] = [];
    const failureMessages: string[] = [];

    if (hasProfileChanges) {
      const profilePayload: {
        name?: string;
        phone?: string;
      } = {};

      if (!loadedProfile || form.name.trim() !== loadedProfile.name.trim()) {
        profilePayload.name = form.name.trim();
      }

      if (!loadedProfile || form.phone.trim() !== loadedProfile.phone.trim()) {
        profilePayload.phone = form.phone.trim();
      }

      try {
        profile = await updateChefProfile(profilePayload);
        setLoadedProfile(profile);
        updateStoredChefProfile(profile);
        onProfileUpdatedRef.current(profile);
        successMessages.push("Profile updated successfully.");
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error(error);
        }

        failureMessages.push(getChefAccountErrorMessage(error));
      }
    }

    if (wantsPasswordChange) {
      try {
        await changeChefPassword({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        });
        successMessages.push("Password changed successfully.");
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error(error);
        }

        failureMessages.push(getChefAccountErrorMessage(error));
      }
    }

    if (successMessages.length > 0) {
      setForm((current) => ({
        ...current,
        name: profile?.name ?? current.name,
        email: profile?.email ?? current.email,
        phone: profile?.phone ?? current.phone,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    }

    if (failureMessages.length > 0) {
      setStatusType(successMessages.length > 0 ? "success" : "error");
      setStatusMessage([...successMessages, ...failureMessages].join(" "));
    } else {
      setStatusType("success");
      setStatusMessage(successMessages.join(" "));
    }

    setIsSubmitting(false);
    submitInFlightRef.current = false;
  }

  return (
    <AuthModalShell
      open={open}
      onClose={onClose}
      theme={theme}
      title="My Account"
      subtitle="Update your chef profile and password for this restaurant account."
      maxWidthClassName="max-w-[720px]"
    >
      <div className="max-h-[72vh] overflow-y-auto pr-1">
        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          {isLoading ? (
            <p className={getAuthMutedTextClasses(theme)}>Loading chef profile...</p>
          ) : null}

          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              Profile
            </h3>
            <div className="grid gap-5 sm:grid-cols-3">
              <AuthInputField
                id={nameId}
                theme={theme}
                label="Name"
                value={form.name}
                autoComplete="name"
                placeholder="Full name"
                error={errors.name}
                onChange={(name) => setForm((current) => ({ ...current, name }))}
              />
              <AuthInputField
                id={emailId}
                theme={theme}
                label="Email"
                type="email"
                value={form.email}
                autoComplete="email"
                placeholder="chef@restaurant.com"
                error={errors.email}
                readOnly
                onChange={(email) => setForm((current) => ({ ...current, email }))}
              />
              <AuthInputField
                id={phoneId}
                theme={theme}
                label="Phone"
                type="tel"
                value={form.phone}
                autoComplete="tel"
                inputMode="tel"
                placeholder="+94 77 123 4567"
                error={errors.phone}
                onChange={(phone) => setForm((current) => ({ ...current, phone }))}
              />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              Password
            </h3>
            <div className="grid gap-5 sm:grid-cols-3">
              <AuthInputField
                id={currentPasswordId}
                theme={theme}
                label="Current password"
                type="password"
                value={form.currentPassword}
                autoComplete="current-password"
                placeholder="Current password"
                error={errors.currentPassword}
                onChange={(currentPassword) => setForm((current) => ({ ...current, currentPassword }))}
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
                onChange={(newPassword) => setForm((current) => ({ ...current, newPassword }))}
              />
              <AuthInputField
                id={confirmPasswordId}
                theme={theme}
                label="Confirm password"
                type="password"
                value={form.confirmPassword}
                autoComplete="new-password"
                placeholder="Confirm password"
                error={errors.confirmPassword}
                onChange={(confirmPassword) => setForm((current) => ({ ...current, confirmPassword }))}
              />
            </div>
          </section>

          <button
            type="submit"
            className={cn(primaryButtonClassName, "w-full rounded-2xl px-6 py-3.5 text-sm")}
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>

          {statusType === "error" ? (
            <ErrorMessage message={statusMessage} />
          ) : statusMessage ? (
            <p className={cn("text-sm", theme === "dark" ? "text-emerald-300" : "text-emerald-600")}>
              {statusMessage}
            </p>
          ) : null}
        </form>
      </div>
    </AuthModalShell>
  );
}
