"use client";

import type { FormEvent } from "react";
import { useEffect, useId, useState } from "react";
import { primaryButtonClassName } from "@/components/common/buttons";
import { AuthInputField } from "@/components/common/inputs";
import { AuthModalShell } from "@/components/common/modals";
import {
  cn,
  getAuthInlineLinkClasses,
  getAuthMutedTextClasses,
  type AuthTheme,
} from "@/components/common/theme";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onOpenSignUp: () => void;
  theme: AuthTheme;
}

export function LoginModal({
  open,
  onClose,
  onOpenSignUp,
  theme,
}: LoginModalProps) {
  const emailId = useId();
  const passwordId = useId();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (!open) {
      setErrors({});
      setStatusMessage("");
      setForm({
        email: "",
        password: "",
      });
    }
  }, [open]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: typeof errors = {};

    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!isValidEmail(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!form.password.trim()) {
      nextErrors.password = "Password is required.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStatusMessage("");
      return;
    }

    setStatusMessage("Your login details look valid. Connect this form to your backend auth next.");
  }

  return (
    <AuthModalShell
      open={open}
      onClose={onClose}
      theme={theme}
      title="Login"
      subtitle="Enter your email and password to access your MenuFlow dashboard."
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <AuthInputField
          id={emailId}
          theme={theme}
          label="Email"
          type="email"
          value={form.email}
          autoComplete="email"
          placeholder="you@restaurant.com"
          error={errors.email}
          onChange={(email) => setForm((current) => ({ ...current, email }))}
        />

        <div className="space-y-2">
          <AuthInputField
            id={passwordId}
            theme={theme}
            label="Password"
            type="password"
            value={form.password}
            autoComplete="current-password"
            placeholder="Enter your password"
            error={errors.password}
            onChange={(password) => setForm((current) => ({ ...current, password }))}
          />
          <div className="flex justify-end">
            <button
              type="button"
              className={cn("text-sm", getAuthInlineLinkClasses(theme))}
              onClick={() =>
                setStatusMessage("Forgot password flow can be connected here next.")
              }
            >
              Forgot Password?
            </button>
          </div>
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
          Create new account?{" "}
          <button
            type="button"
            className={getAuthInlineLinkClasses(theme)}
            onClick={onOpenSignUp}
          >
            Sign Up
          </button>
        </p>
      </form>
    </AuthModalShell>
  );
}
