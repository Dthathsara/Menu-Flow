"use client";

import { useEffect } from "react";
import {
  cn,
  getManagerIconButtonClasses,
  getManagerModalSurfaceClasses,
  getManagerPageSubtitleClasses,
  getManagerPageTitleClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import { SearchIcon, XIcon } from "../icons";
import {
  getAvatarGradientClasses,
  getInitials,
  getRoleBadgeClasses,
  getStatusBadgeClasses,
  getUsersActionButtonClasses,
  getUsersCardClasses,
  getUsersFieldLabelClasses,
  getUsersInputClasses,
  getUsersMutedTextClasses,
  getUsersPanelClasses,
  getUsersSearchShellClasses,
} from "./helpers";
import type { StaffRecord, StaffRole, StaffStatus } from "./types";

export function UsersSurfaceCard({
  settings,
  className,
  children,
  interactive = false,
}: {
  settings: ManagerSettings;
  className?: string;
  children: React.ReactNode;
  interactive?: boolean;
}) {
  return (
    <section className={cn(getUsersCardClasses(settings.scheme, interactive), className)}>
      {children}
    </section>
  );
}

export function UsersPanel({
  settings,
  className,
  children,
}: {
  settings: ManagerSettings;
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn(getUsersPanelClasses(settings.scheme), className)}>{children}</div>;
}

export function UsersSectionBadge({
  settings,
  children,
  className,
}: {
  settings: ManagerSettings;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]",
        settings.scheme === "dark"
          ? "bg-[#14325E] text-[#90B9FF]"
          : "bg-blue-50 text-blue-700",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StaffInitialAvatar({
  staff,
  className,
}: {
  staff: Pick<StaffRecord, "fullName" | "id">;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-[18px] bg-gradient-to-br text-center font-bold text-white shadow-[0_16px_28px_rgba(37,99,235,0.22)]",
        getAvatarGradientClasses(staff.id),
        className,
      )}
      aria-hidden="true"
    >
      {getInitials(staff.fullName)}
    </span>
  );
}

export function StaffRoleBadge({
  role,
  settings,
}: {
  role: StaffRole;
  settings: ManagerSettings;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full border px-3 text-[12px] font-semibold",
        getRoleBadgeClasses(role, settings.scheme),
      )}
    >
      {role}
    </span>
  );
}

export function StaffStatusBadge({
  status,
  settings,
}: {
  status: StaffStatus;
  settings: ManagerSettings;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full border px-3 text-[12px] font-semibold",
        getStatusBadgeClasses(status, settings.scheme),
      )}
    >
      {status}
    </span>
  );
}

export function UsersFieldLabel({
  settings,
  children,
  htmlFor,
}: {
  settings: ManagerSettings;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label htmlFor={htmlFor} className={getUsersFieldLabelClasses(settings.scheme)}>
      {children}
    </label>
  );
}

type UsersTextInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  settings: ManagerSettings;
};

export function UsersTextInput({ settings, className, ...props }: UsersTextInputProps) {
  return <input className={cn(getUsersInputClasses(settings.scheme), className)} {...props} />;
}

type UsersTextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  settings: ManagerSettings;
};

export function UsersTextArea({ settings, className, ...props }: UsersTextAreaProps) {
  return (
    <textarea
      className={cn(getUsersInputClasses(settings.scheme, true), "resize-none", className)}
      {...props}
    />
  );
}

export function UsersSearchField({
  settings,
  value,
  onChange,
  placeholder,
}: {
  settings: ManagerSettings;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className={getUsersSearchShellClasses(settings.scheme)}>
      <SearchIcon
        className={cn(
          "size-4 shrink-0",
          settings.scheme === "dark" ? "text-[#8CA1CA]" : "text-slate-400",
        )}
      />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={cn(
          "h-full min-w-0 flex-1 bg-transparent text-[15px] outline-none",
          settings.scheme === "dark"
            ? "text-white placeholder:text-[#68789D]"
            : "text-slate-900 placeholder:text-slate-400",
        )}
        aria-label={placeholder}
      />
    </div>
  );
}

export function UsersActionButton({
  settings,
  tone,
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  settings: ManagerSettings;
  tone?: "default" | "primary" | "danger";
}) {
  return (
    <button
      className={cn(
        getUsersActionButtonClasses(settings.scheme, tone ?? "default"),
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function UsersEmptyState({
  settings,
  title,
  description,
}: {
  settings: ManagerSettings;
  title: string;
  description: string;
}) {
  return (
    <div className="px-5 py-16 text-center sm:px-6">
      <div className="text-lg font-semibold">{title}</div>
      <p className={cn("mt-2 text-[15px] leading-6", getUsersMutedTextClasses(settings.scheme))}>
        {description}
      </p>
    </div>
  );
}

export function UsersModalFrame({
  open,
  settings,
  title,
  subtitle,
  maxWidthClassName,
  onClose,
  children,
  footer,
  titleId,
}: {
  open: boolean;
  settings: ManagerSettings;
  title: string;
  subtitle: string;
  maxWidthClassName: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  titleId: string;
}) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/58 p-4 backdrop-blur-[3px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={cn(maxWidthClassName, getManagerModalSurfaceClasses(settings.scheme))}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="flex max-h-[calc(100vh-2rem)] flex-col">
          <div
            className={cn(
              "flex items-start justify-between gap-4 border-b px-5 py-4 sm:px-6 sm:py-5",
              settings.scheme === "dark"
                ? "border-[#173056] bg-[#09172D]"
                : "border-slate-200 bg-slate-50",
            )}
          >
            <div>
              <h3
                id={titleId}
                className={cn(getManagerPageTitleClasses(), "text-[1.45rem] sm:text-[1.55rem]")}
              >
                {title}
              </h3>
              <p className={cn("mt-1 text-[15px] leading-6", getManagerPageSubtitleClasses(settings.scheme))}>
                {subtitle}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={getManagerIconButtonClasses(settings.scheme, true)}
              aria-label={`Close ${title}`}
            >
              <XIcon className="size-4" />
            </button>
          </div>

          <div
            className={cn(
              "overflow-y-auto px-5 py-5 sm:px-6 sm:py-6",
              settings.scheme === "dark" ? "bg-[#071426]" : "bg-white",
            )}
          >
            {children}
          </div>

          {footer ? (
            <div
              className={cn(
                "flex flex-col-reverse gap-3 border-t px-5 py-4 sm:flex-row sm:justify-end sm:px-6 sm:py-5",
                settings.scheme === "dark"
                  ? "border-[#173056] bg-[#071426]"
                  : "border-slate-200 bg-white",
              )}
            >
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
