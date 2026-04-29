"use client";

import { createPortal } from "react-dom";
import type {
  FormEvent,
  HTMLAttributes,
  HTMLInputTypeAttribute,
  ReactNode,
} from "react";
import { useEffect, useId, useState } from "react";
import { primaryButtonClassName } from "@/components/CTAButtons";

export type AuthTheme = "dark" | "light";

export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function getAuthOverlayClasses(theme: AuthTheme) {
  return theme === "dark"
    ? "bg-slate-950/72 backdrop-blur-md"
    : "bg-slate-900/26 backdrop-blur-md";
}

export function getAuthSurfaceClasses(theme: AuthTheme) {
  return cn(
    "relative w-full overflow-hidden rounded-[30px] border bg-[var(--surface-strong)] shadow-[var(--panel-shadow)]",
    theme === "dark" ? "text-[var(--text-primary)]" : "text-[var(--text-primary)]",
    "[border-color:var(--border-soft)]",
  );
}

export function getAuthLabelClasses(theme: AuthTheme) {
  return cn(
    "text-sm font-medium",
    theme === "dark" ? "text-[var(--text-secondary)]" : "text-[var(--text-secondary)]",
  );
}

export function getAuthInputClasses(theme: AuthTheme, hasError = false) {
  return cn(
    "h-12 w-full rounded-2xl border px-4 text-sm shadow-[var(--contact-input-shadow)] transition duration-300",
    "bg-[var(--contact-input-bg)] text-[var(--contact-input-text)] placeholder:text-[var(--contact-input-placeholder)]",
    "[border-color:var(--contact-input-border)] focus:outline-none focus:ring-2 focus:ring-orange-300/40",
    "focus:[border-color:var(--contact-input-border-focus)]",
    hasError &&
      (theme === "dark"
        ? "border-rose-400/70 focus:ring-rose-400/30"
        : "border-rose-400/70 focus:ring-rose-300/35"),
  );
}

export function getAuthMutedTextClasses(theme: AuthTheme) {
  return cn(
    "text-sm leading-6",
    theme === "dark" ? "text-[var(--text-secondary)]" : "text-[var(--text-secondary)]",
  );
}

export function getAuthInlineLinkClasses(theme: AuthTheme) {
  return cn(
    "font-medium transition duration-300 hover:underline hover:decoration-orange-400 hover:underline-offset-4",
    theme === "dark" ? "text-orange-300 hover:text-pink-300" : "text-orange-500 hover:text-pink-500",
  );
}

function getAuthCloseButtonClasses(theme: AuthTheme) {
  return cn(
    "inline-flex h-11 w-11 items-center justify-center rounded-2xl border bg-[var(--button-secondary-bg)] text-[var(--button-secondary-text)] shadow-[var(--button-secondary-shadow)] transition duration-300",
    "hover:-translate-y-0.5 hover:bg-[var(--button-secondary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/60",
    "[border-color:var(--border-soft)]",
    theme === "dark" ? "hover:text-white" : "hover:text-slate-900",
  );
}

export function AuthInputField({
  theme,
  id,
  label,
  type = "text",
  value,
  placeholder,
  autoComplete,
  inputMode,
  error,
  onChange,
}: {
  theme: AuthTheme;
  id: string;
  label: string;
  type?: HTMLInputTypeAttribute;
  value: string;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={getAuthLabelClasses(theme)}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
        className={getAuthInputClasses(theme, Boolean(error))}
        required
      />
      {error ? (
        <p className={cn("text-xs", theme === "dark" ? "text-rose-300" : "text-rose-500")}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function AuthModalShell({
  open,
  onClose,
  theme,
  title,
  subtitle,
  maxWidthClassName = "max-w-[520px]",
  children,
}: {
  open: boolean;
  onClose: () => void;
  theme: AuthTheme;
  title: string;
  subtitle: string;
  maxWidthClassName?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  const modalContent = (
    <div
      className={cn("fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6 sm:px-6", getAuthOverlayClasses(theme))}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={cn(maxWidthClassName, getAuthSurfaceClasses(theme))}>
        <div className="pointer-events-none absolute -left-16 top-0 h-40 w-40 rounded-full bg-orange-500/18 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-44 w-44 rounded-full bg-fuchsia-500/14 blur-3xl" />

        <div className="relative p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[1.9rem] font-semibold tracking-tight text-[var(--text-primary)]">
                {title}
              </h2>
              <p className={cn("mt-3 max-w-[32rem]", getAuthMutedTextClasses(theme))}>
                {subtitle}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label={`Close ${title} modal`}
              className={getAuthCloseButtonClasses(theme)}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4 stroke-current"
                fill="none"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

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
