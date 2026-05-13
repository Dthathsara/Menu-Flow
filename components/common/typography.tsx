type HeroBadgeProps = {
  text: string;
};

export function HeroBadge({ text }: HeroBadgeProps) {
  return (
    <div className="inline-flex items-center rounded-full border bg-[var(--badge-surface)] px-4 py-2 text-sm font-medium text-[var(--badge-text)] shadow-[0_10px_24px_rgba(249,115,22,0.08)] transition-colors duration-300 [border-color:var(--badge-border)]">
      <span className="h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_14px_rgba(251,146,60,0.75)]" />
      <span className="ml-3">{text}</span>
    </div>
  );
}
