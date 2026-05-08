import { cn } from "@/components/manager/managerUtils";
import { adminCardClasses, adminMutedClasses } from "./adminStyles";
import type { AdminScheme } from "./adminTypes";

interface AdminStatCardProps {
  scheme: AdminScheme;
  title: string;
  value: string;
  note: string;
  icon?: React.ReactNode;
  accent?: string;
}

export function AdminStatCard({
  scheme,
  title,
  value,
  note,
  icon,
  accent = "from-blue-500 to-cyan-400",
}: AdminStatCardProps) {
  return (
    <div className={cn(adminCardClasses(scheme), "group min-h-[162px] p-5")}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="inline-flex rounded-full bg-blue-500/10 px-3 py-1 text-xs font-extrabold text-cyan-400">{title}</p>
          <div className="mt-3 text-[1.9rem] font-bold tracking-tight">{value}</div>
          <p className={cn("mt-2 text-sm leading-6", adminMutedClasses(scheme))}>{note}</p>
        </div>
        {icon ? (
          <span className={cn("flex size-12 shrink-0 items-center justify-center rounded-md bg-gradient-to-br text-white shadow-[0_16px_28px_rgba(15,23,42,0.16)] transition-all duration-200 group-hover:scale-[1.04] group-hover:brightness-110", accent)}>
            {icon}
          </span>
        ) : null}
      </div>
    </div>
  );
}
