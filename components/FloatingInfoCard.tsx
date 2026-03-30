import { ReactNode } from "react";

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
