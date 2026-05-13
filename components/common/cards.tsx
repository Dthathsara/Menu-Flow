import type { ReactNode } from "react";

type FloatingInfoCardProps = {
  title: string;
  value: string;
  icon?: ReactNode;
  className?: string;
};

export function FloatingInfoCard({
  title,
  value,
  icon,
  className = "",
}: FloatingInfoCardProps) {
  return (
    <div
      className={`rounded-[1.5rem] border bg-[var(--floating-surface)] p-4 shadow-[var(--floating-shadow)] transition duration-300 hover:-translate-y-1 [border-color:var(--border-soft)] ${className}`}
    >
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
        {icon}
        <span>{title}</span>
      </div>
      <p className="mt-2 text-lg font-semibold text-[var(--text-primary)] sm:text-[1.75rem] sm:leading-none">
        {value}
      </p>
    </div>
  );
}

type StatCardProps = {
  title: string;
  value: string;
  caption: string;
  accentClassName: string;
};

export function StatCard({
  title,
  value,
  caption,
  accentClassName,
}: StatCardProps) {
  return (
    <div className="rounded-[1.5rem] border bg-[var(--surface-soft)] p-5 shadow-[var(--card-shadow)] transition duration-300 hover:-translate-y-1 hover:shadow-[var(--panel-shadow)] [border-color:var(--border-soft)]">
      <p className="text-sm text-[var(--text-secondary)]">{title}</p>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
        {value}
      </p>
      <p className={`mt-2 text-sm font-medium ${accentClassName}`}>{caption}</p>
    </div>
  );
}
