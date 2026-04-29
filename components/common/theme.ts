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
