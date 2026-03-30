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
