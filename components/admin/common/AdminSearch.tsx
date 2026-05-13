import { SearchIcon } from "@/components/manager/icons";
import { cn } from "@/components/manager/managerUtils";
import { adminInputClasses } from "./adminStyles";
import type { AdminScheme } from "./adminTypes";

interface AdminSearchProps {
  scheme: AdminScheme;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function AdminSearch({
  scheme,
  value,
  onChange,
  placeholder = "Search...",
  className,
}: AdminSearchProps) {
  return (
    <label
      className={cn(
        "flex h-11 w-full min-w-0 cursor-text items-center gap-2 rounded-[12px] border px-3 transition-all duration-200",
        adminInputClasses(scheme),
        className,
      )}
    >
      <SearchIcon className="size-4" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm outline-none placeholder:inherit"
      />
    </label>
  );
}
