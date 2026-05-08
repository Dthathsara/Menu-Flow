interface ErrorMessageProps {
  message?: string | null;
  className?: string;
}

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function ErrorMessage({ message, className }: ErrorMessageProps) {
  if (!message) {
    return null;
  }

  return (
    <div
      role="alert"
      className={cn(
        "whitespace-pre-line rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm leading-6 text-rose-600",
        "dark:border-rose-400/25 dark:bg-rose-500/12 dark:text-rose-200",
        className,
      )}
    >
      {message}
    </div>
  );
}
