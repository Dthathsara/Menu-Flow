import { cn } from "./managerUtils";

export interface IconProps {
  className?: string;
}

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

export function MenuToggleIcon({ className }: IconProps) {
  return (
    <BaseIcon className={className}>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h10" />
    </BaseIcon>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <BaseIcon className={className}>
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-3.5-3.5" />
    </BaseIcon>
  );
}

export function GlobeIcon({ className }: IconProps) {
  return (
    <BaseIcon className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a15.2 15.2 0 0 1 0 18" />
      <path d="M12 3a15.2 15.2 0 0 0 0 18" />
    </BaseIcon>
  );
}

export function BellIcon({ className }: IconProps) {
  return (
    <BaseIcon className={className}>
      <path d="M15 17H5.5a1.5 1.5 0 0 1-1.2-2.4A6.9 6.9 0 0 0 6 10.2V9a6 6 0 0 1 12 0v1.2a6.9 6.9 0 0 0 1.7 4.4 1.5 1.5 0 0 1-1.2 2.4H15" />
      <path d="M9.5 17a2.5 2.5 0 0 0 5 0" />
    </BaseIcon>
  );
}

export function SettingsIcon({ className }: IconProps) {
  return (
    <BaseIcon className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 1 1-4 0v-.2a1 1 0 0 0-.7-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 1 1 0-4h.2a1 1 0 0 0 .9-.7 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a2 2 0 1 1 4 0v.2a1 1 0 0 0 .7.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6H20a2 2 0 1 1 0 4h-.2a1 1 0 0 0-.9.7Z" />
    </BaseIcon>
  );
}

export function MoonIcon({ className }: IconProps) {
  return (
    <BaseIcon className={className}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 1 0 9.8 9.8Z" />
    </BaseIcon>
  );
}

export function SunIcon({ className }: IconProps) {
  return (
    <BaseIcon className={className}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2.5" />
      <path d="M12 19.5V22" />
      <path d="M4.9 4.9 6.7 6.7" />
      <path d="m17.3 17.3 1.8 1.8" />
      <path d="M2 12h2.5" />
      <path d="M19.5 12H22" />
      <path d="m4.9 19.1 1.8-1.8" />
      <path d="m17.3 6.7 1.8-1.8" />
    </BaseIcon>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <BaseIcon className={className}>
      <path d="m6 9 6 6 6-6" />
    </BaseIcon>
  );
}

export function ChevronRightIcon({ className }: IconProps) {
  return (
    <BaseIcon className={className}>
      <path d="m9 6 6 6-6 6" />
    </BaseIcon>
  );
}

export function DashboardIcon({ className }: IconProps) {
  return (
    <BaseIcon className={className}>
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="5" rx="2" />
      <rect x="13" y="10" width="8" height="11" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
    </BaseIcon>
  );
}

export function MenuBookIcon({ className }: IconProps) {
  return (
    <BaseIcon className={className}>
      <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H20v16H7.5A2.5 2.5 0 0 0 5 21Z" />
      <path d="M5 5.5V21" />
      <path d="M9 7h7" />
      <path d="M9 11h7" />
    </BaseIcon>
  );
}

export function QrCodeIcon({ className }: IconProps) {
  return (
    <BaseIcon className={className}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <path d="M14 14h3v3" />
      <path d="M21 14v7h-4" />
      <path d="M14 21v-4h4" />
    </BaseIcon>
  );
}

export function UsersIcon({ className }: IconProps) {
  return (
    <BaseIcon className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9.5" cy="8" r="3.5" />
      <path d="M21 21v-2a4 4 0 0 0-3-3.9" />
      <path d="M16.5 4.7a3.5 3.5 0 0 1 0 6.6" />
    </BaseIcon>
  );
}

export function ReportsIcon({ className }: IconProps) {
  return (
    <BaseIcon className={className}>
      <path d="M4 19h16" />
      <path d="M7 16V9" />
      <path d="M12 16V5" />
      <path d="M17 16v-4" />
    </BaseIcon>
  );
}

export function OrdersIcon({ className }: IconProps) {
  return (
    <BaseIcon className={className}>
      <path d="M6 7h13l-1 9H7Z" />
      <path d="M6 7 5 4H3" />
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="17" cy="20" r="1.5" />
    </BaseIcon>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <BaseIcon className={className}>
      <path d="m5 12 4 4L19 6" />
    </BaseIcon>
  );
}

export function XIcon({ className }: IconProps) {
  return (
    <BaseIcon className={className}>
      <path d="m6 6 12 12" />
      <path d="M18 6 6 18" />
    </BaseIcon>
  );
}

export function UserIcon({ className }: IconProps) {
  return (
    <BaseIcon className={className}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </BaseIcon>
  );
}

export function LogoutIcon({ className }: IconProps) {
  return (
    <BaseIcon className={className}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </BaseIcon>
  );
}

export function PencilIcon({ className }: IconProps) {
  return (
    <BaseIcon className={className}>
      <path d="m4 20 4.2-1 9.5-9.5a2.1 2.1 0 0 0-3-3L5.2 16 4 20Z" />
      <path d="m13.5 7.5 3 3" />
    </BaseIcon>
  );
}

export function TrashIcon({ className }: IconProps) {
  return (
    <BaseIcon className={className}>
      <path d="M4 7h16" />
      <path d="M9 7V4h6v3" />
      <path d="M7 7l1 13h8l1-13" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </BaseIcon>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <BaseIcon className={className}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </BaseIcon>
  );
}

export function UploadIcon({ className }: IconProps) {
  return (
    <BaseIcon className={className}>
      <path d="M12 16V6" />
      <path d="m7.5 10.5 4.5-4.5 4.5 4.5" />
      <path d="M5 18.5h14" />
    </BaseIcon>
  );
}

export function ImageIcon({ className }: IconProps) {
  return (
    <BaseIcon className={className}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="m21 16-4.5-4.5L8 20" />
    </BaseIcon>
  );
}

export function TagIcon({ className }: IconProps) {
  return (
    <BaseIcon className={className}>
      <path d="M20 10 10 20l-7-7L13 3h5a2 2 0 0 1 2 2v5Z" />
      <circle cx="16.5" cy="7.5" r="1" />
    </BaseIcon>
  );
}

export function ClockIcon({ className }: IconProps) {
  return (
    <BaseIcon className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 2" />
    </BaseIcon>
  );
}
