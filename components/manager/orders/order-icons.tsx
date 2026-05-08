import type { IconProps } from "../icons";
import { cn } from "../managerUtils";

function BaseIcon({ className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-5 shrink-0", className)}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function EyeIcon({ className }: IconProps) {
  return (
    <BaseIcon className={className}>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
      <circle cx="12" cy="12" r="2.8" />
    </BaseIcon>
  );
}
