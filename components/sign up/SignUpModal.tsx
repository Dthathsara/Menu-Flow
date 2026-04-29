"use client";

import type { FormEvent } from "react";
import { useEffect, useId, useState } from "react";
import { primaryButtonClassName } from "@/components/CTAButtons";
import {
  AuthInputField,
  AuthModalShell,
  type AuthTheme,
  cn,
  getAuthInlineLinkClasses,
  getAuthMutedTextClasses,
} from "@/components/login/LoginModal";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value: string) {
  return /^\+?[0-9\s()-]{7,}$/.test(value);
}

interface SignUpModalProps {
  open: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
  theme: AuthTheme;
}

export function SignUpModal({
  open,
  onClose,
  onOpenLogin,
  theme,
}: SignUpModalProps) {
  const hotelNameId = useId();
  const emailId = useId();
  const contactNameId = useId();
  const mobileId = useId();
  const passwordId = useId();
  const confirmPasswordId = useId();
  const [form, setForm] = useState({
    hotelName: "",
    businessEmail: "",
    contactName: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (!open) {
      setErrors({});
      setStatusMessage("");
      setForm({
        hotelName: "",
        businessEmail: "",
        contactName: "",
        mobileNumber: "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [open]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: Partial<Record<keyof typeof form, string>> = {};

    if (!form.hotelName.trim()) {
      nextErrors.hotelName = "Hotel / Restaurant name is required.";
    }

    if (!form.businessEmail.trim()) {
      nextErrors.businessEmail = "Business email is required.";
    } else if (!isValidEmail(form.businessEmail)) {
      nextErrors.businessEmail = "Enter a valid business email.";
    }

    if (!form.contactName.trim()) {
      nextErrors.contactName = "Contact person name is required.";
    }

    if (!form.mobileNumber.trim()) {
      nextErrors.mobileNumber = "Mobile number is required.";
    } else if (!isValidPhone(form.mobileNumber)) {
      nextErrors.mobileNumber = "Enter a valid mobile number.";
    }

    if (!form.password.trim()) {
      nextErrors.password = "Password is required.";
    } else if (form.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    if (!form.confirmPassword.trim()) {
      nextErrors.confirmPassword = "Please confirm your password.";
    } else if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStatusMessage("");
      return;
    }

    setStatusMessage("Your sign up details look ready. Connect this form to backend registration next.");
  }

  return (
    <AuthModalShell
      open={open}
      onClose={onClose}
      theme={theme}
      title="Sign Up"
      subtitle="Create your MenuFlow account and start managing your restaurant digitally."
      maxWidthClassName="max-w-[620px]"
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <AuthInputField
              id={hotelNameId}
              theme={theme}
              label="Hotel / Restaurant name"
              value={form.hotelName}
              autoComplete="organization"
              placeholder="Enter your business name"
              error={errors.hotelName}
              onChange={(hotelName) => setForm((current) => ({ ...current, hotelName }))}
            />
          </div>

          <div className="sm:col-span-2">
            <AuthInputField
              id={emailId}
              theme={theme}
              label="Business email"
              type="email"
              value={form.businessEmail}
              autoComplete="email"
              placeholder="team@menuflow.com"
              error={errors.businessEmail}
              onChange={(businessEmail) =>
                setForm((current) => ({ ...current, businessEmail }))
              }
            />
          </div>

          <AuthInputField
            id={contactNameId}
            theme={theme}
            label="Contact person name"
            value={form.contactName}
            autoComplete="name"
            placeholder="Full name"
            error={errors.contactName}
            onChange={(contactName) => setForm((current) => ({ ...current, contactName }))}
          />

          <AuthInputField
            id={mobileId}
            theme={theme}
            label="Contact person mobile number"
            type="tel"
            value={form.mobileNumber}
            autoComplete="tel"
            inputMode="tel"
            placeholder="+94 77 123 4567"
            error={errors.mobileNumber}
            onChange={(mobileNumber) => setForm((current) => ({ ...current, mobileNumber }))}
          />

          <AuthInputField
            id={passwordId}
            theme={theme}
            label="Password"
            type="password"
            value={form.password}
            autoComplete="new-password"
            placeholder="Create a password"
            error={errors.password}
            onChange={(password) => setForm((current) => ({ ...current, password }))}
          />

          <AuthInputField
            id={confirmPasswordId}
            theme={theme}
            label="Confirm password"
            type="password"
            value={form.confirmPassword}
            autoComplete="new-password"
            placeholder="Re-enter your password"
            error={errors.confirmPassword}
            onChange={(confirmPassword) =>
              setForm((current) => ({ ...current, confirmPassword }))
            }
          />
        </div>

        <button
          type="submit"
          className={cn(primaryButtonClassName, "w-full rounded-2xl px-6 py-3.5 text-sm")}
        >
          Continue
        </button>

        {statusMessage ? (
          <p className={cn("text-sm", theme === "dark" ? "text-emerald-300" : "text-emerald-600")}>
            {statusMessage}
          </p>
        ) : null}

        <p className={cn("text-center text-sm", getAuthMutedTextClasses(theme))}>
          Already have an account?{" "}
          <button
            type="button"
            className={getAuthInlineLinkClasses(theme)}
            onClick={onOpenLogin}
          >
            Login
          </button>
        </p>
      </form>
    </AuthModalShell>
  );
}
