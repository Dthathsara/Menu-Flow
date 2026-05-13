import { cn } from "@/components/manager/managerUtils";
import type { AdminScheme } from "./adminTypes";

interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  scheme: AdminScheme;
  variant?: "primary" | "secondary" | "danger" | "success" | "table";
  icon?: React.ReactNode;
}

export function AdminButton({
  scheme,
  variant = "secondary",
  icon,
  className,
  children,
  type = "button",
  ...props
}: AdminButtonProps) {
  const classes =
    variant === "primary"
      ? "inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-[11px] bg-[#2f6df6] px-5 text-[15px] font-bold text-white shadow-[0_16px_34px_rgba(47,109,246,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-[0_18px_38px_rgba(59,130,246,0.34)] active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
      : variant === "danger"
        ? cn(
            "inline-flex h-9 cursor-pointer items-center justify-center rounded-[9px] border px-3 text-[14px] font-bold text-rose-400 transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/30",
            scheme === "dark" ? "border-[#263650] bg-[#111b2d]" : "border-slate-200 bg-white hover:text-rose-600",
          )
        : variant === "success"
          ? cn(
              "inline-flex h-9 cursor-pointer items-center justify-center rounded-[9px] border px-3 text-[14px] font-bold text-emerald-400 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-300 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30",
              scheme === "dark" ? "border-[#263650] bg-[#111b2d]" : "border-slate-200 bg-white",
            )
          : variant === "table"
            ? cn(
                "inline-flex h-9 cursor-pointer items-center justify-center rounded-[9px] border px-3 text-[14px] font-bold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30",
                scheme === "dark"
                  ? "border-[#263650] bg-[#111b2d] text-white hover:border-blue-400/40 hover:bg-[#162236]"
                  : "border-slate-200 bg-white text-slate-900 hover:border-blue-300 hover:bg-slate-50",
              )
            : cn(
                "inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-[11px] border px-5 text-[15px] font-bold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30",
                scheme === "dark"
                  ? "border-[#263650] bg-[#101a2b] text-white hover:border-blue-400/40 hover:bg-[#162236]"
                  : "border-slate-200 bg-white text-slate-900 hover:border-blue-300 hover:bg-slate-50",
              );

  return (
    <button type={type} className={cn(classes, className)} {...props}>
      {icon ? <span className="shrink-0">{icon}</span> : null}
      {children}
    </button>
  );
}
