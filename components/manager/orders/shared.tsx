import {
  cn,
  getManagerCardShellClasses,
  getManagerControlShellClasses,
  getMutedTextClasses,
  getManagerPanelShellClasses,
  getManagerPillClasses,
  getManagerTableActionButtonClasses,
} from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import { formatStatusLabel } from "./order-data";
import type { OrderStatus, PaymentStatus } from "./types";

export function formatCurrency(amount: number) {
  return `Rs. ${amount.toLocaleString("en-LK")}`;
}

export function formatDisplayDate(value: string) {
  if (!value || Number.isNaN(new Date(value).getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function formatDisplayTime(value: string) {
  if (!value || Number.isNaN(new Date(value).getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function getRelativeDateLabel(value: string, referenceDate = new Date()) {
  const target = new Date(value);
  const normalizedTarget = new Date(target);
  normalizedTarget.setHours(0, 0, 0, 0);

  const normalizedReference = new Date(referenceDate);
  normalizedReference.setHours(0, 0, 0, 0);

  const differenceInDays =
    (normalizedReference.getTime() - normalizedTarget.getTime()) / (24 * 60 * 60 * 1000);

  if (differenceInDays === 0) {
    return "Today";
  }

  if (differenceInDays === 1) {
    return "Yesterday";
  }

  return formatDisplayDate(value);
}

export function SurfaceCard({
  settings,
  className,
  interactive = true,
  children,
}: {
  settings: ManagerSettings;
  className?: string;
  interactive?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        getManagerCardShellClasses(settings.scheme, { interactive }),
        className,
      )}
    >
      {children}
    </section>
  );
}

export function SecondaryPanel({
  settings,
  className,
  children,
}: {
  settings: ManagerSettings;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        getManagerPanelShellClasses(settings.scheme),
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionPill({
  settings,
  children,
}: {
  settings: ManagerSettings;
  children: React.ReactNode;
}) {
  return (
    <span
      className={getManagerPillClasses(settings.scheme)}
    >
      {children}
    </span>
  );
}

export function StatusBadge({
  settings,
  type,
  value,
}: {
  settings: ManagerSettings;
  type: "order" | "payment";
  value: OrderStatus | PaymentStatus;
}) {
  const className =
    type === "order"
      ? getOrderStatusBadgeClasses(value as OrderStatus, settings.scheme)
      : getPaymentStatusBadgeClasses(value as PaymentStatus, settings.scheme);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 ease-out",
        className,
      )}
    >
      {formatStatusLabel(value)}
    </span>
  );
}

export function DetailKeyValue({
  label,
  value,
  settings,
}: {
  label: string;
  value: React.ReactNode;
  settings: ManagerSettings;
}) {
  return (
    <div className="space-y-1.5">
      <div
        className={cn(
          "text-[11px] font-semibold uppercase tracking-[0.22em]",
          getMutedTextClasses(settings.scheme),
        )}
      >
        {label}
      </div>
      <div className="text-[15px] font-medium sm:text-base">{value}</div>
    </div>
  );
}

export function ControlShell({
  settings,
  className,
  children,
}: {
  settings: ManagerSettings;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        getManagerControlShellClasses(settings.scheme),
        className,
      )}
    >
      {children}
    </div>
  );
}

export function secondaryButtonClassName(settings: ManagerSettings) {
  return getManagerTableActionButtonClasses(settings.scheme);
}

function getOrderStatusBadgeClasses(status: OrderStatus, scheme: ManagerSettings["scheme"]) {
  const normalizedStatus = String(status).trim().toLowerCase();

  if (normalizedStatus === "accepted") {
    return scheme === "dark"
      ? "bg-sky-500/16 text-sky-100 ring-1 ring-inset ring-sky-400/28"
      : "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200";
  }

  if (normalizedStatus === "preparing") {
    return scheme === "dark"
      ? "bg-amber-500/16 text-amber-100 ring-1 ring-inset ring-amber-400/28"
      : "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200";
  }

  if (normalizedStatus === "ready") {
    return scheme === "dark"
      ? "bg-violet-500/16 text-violet-100 ring-1 ring-inset ring-violet-400/28"
      : "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200";
  }

  if (normalizedStatus === "cancelled" || normalizedStatus === "canceled") {
    return scheme === "dark"
      ? "bg-rose-500/16 text-rose-100 ring-1 ring-inset ring-rose-400/28"
      : "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200";
  }

  return scheme === "dark"
    ? "bg-emerald-500/16 text-emerald-100 ring-1 ring-inset ring-emerald-400/28"
    : "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";
}

function getPaymentStatusBadgeClasses(
  status: PaymentStatus,
  scheme: ManagerSettings["scheme"],
) {
  if (status === "unpaid" || status === "failed") {
    return scheme === "dark"
      ? "bg-rose-500/14 text-rose-100 ring-1 ring-inset ring-rose-400/24"
      : "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200";
  }

  return scheme === "dark"
    ? "bg-emerald-500/14 text-emerald-100 ring-1 ring-inset ring-emerald-400/24"
    : "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";
}
