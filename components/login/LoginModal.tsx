"use client";

import type { FormEvent } from "react";
import { useEffect, useId, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { primaryButtonClassName } from "@/components/common/buttons";
import { AuthInputField } from "@/components/common/inputs";
import { AuthModalShell } from "@/components/common/modals";
import { ErrorMessage } from "@/components/common/ui/ErrorMessage";
import { API_ROUTES, apiUrl } from "@/lib/api-config";
import {
  clearAuthSession,
  getDashboardPathForRole,
  getStoredAuthUser,
  storeAuthResponse,
} from "@/lib/auth-session";
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
  const router = useRouter();
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
  const [statusType, setStatusType] = useState<"success" | "error">("success");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setErrors({});
      setStatusMessage("");
      setStatusType("success");
      setIsSubmitting(false);
      setForm({
        email: "",
        password: "",
      });
    }
  }, [open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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

    setIsSubmitting(true);
    setStatusMessage("");

    try {
      const email = form.email.trim().toLowerCase();
      const password = form.password;

      clearAuthSession();

      const response = await axios.post(
        apiUrl(API_ROUTES.auth.login),
        {
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );

      const accessToken = storeAuthResponse(response.data);
      const user = getStoredAuthUser();
      const dashboardPath = getDashboardPathForRole(user?.role);

      if (!accessToken || !user || !dashboardPath) {
        clearAuthSession();
        setStatusType("error");
        setStatusMessage("Login succeeded, but the account role is not supported.");
        return;
      }

      setStatusType("success");
      setStatusMessage("Login successful.");
      router.replace(dashboardPath);
    } catch (error) {
      setStatusType("error");
      if (axios.isAxiosError(error)) {
        if (error.response) {
          if (error.response.status === 401) {
            setStatusMessage("Invalid email or password.");
            return;
          }

          if (error.response.status === 404) {
            setStatusMessage("Login API route not found. Check backend auth route.");
            return;
          }

          setStatusMessage(getLoginApiErrorMessage(error.response.data));
        } else if (error.request) {
          setStatusMessage(
            "Cannot connect to backend. Start NestJS on port 3001 and check NEXT_PUBLIC_API_BASE_URL.",
          );
        } else {
          setStatusMessage(error.message);
        }
      } else {
        setStatusMessage("Login failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
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
              onClick={() => {
                setStatusType("success");
                setStatusMessage("Forgot password flow can be connected here next.");
              }}
            >
              Forgot Password?
            </button>
          </div>
        </div>

        <button
          type="submit"
          className={cn(primaryButtonClassName, "w-full rounded-2xl px-6 py-3.5 text-sm")}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Logging in..." : "Continue"}
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

function getLoginApiErrorMessage(data: unknown) {
  if (!data || typeof data !== "object") {
    return "Login failed. Please try again.";
  }

  const record = data as Record<string, unknown>;
  const message = record.message ?? record.error;

  if (Array.isArray(message)) {
    return message.join(", ");
  }

  if (typeof message === "string" && message.trim()) {
    return message;
  }

  return "Login failed. Please try again.";
}
