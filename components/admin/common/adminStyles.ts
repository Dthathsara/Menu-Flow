import { cn } from "@/components/manager/managerUtils";
import type { AdminScheme } from "./adminTypes";

export function adminShellClasses(scheme: AdminScheme) {
  return scheme === "dark"
    ? "bg-[#08111f] text-white"
    : "bg-[#eef3f9] text-slate-950";
}

export function adminSidebarClasses(scheme: AdminScheme) {
  return scheme === "dark"
    ? "border-[#203047] bg-[#0b1424] text-white"
    : "border-slate-200 bg-white text-slate-950";
}

export function adminTopbarClasses(scheme: AdminScheme) {
  return scheme === "dark"
    ? "border-[#203047] bg-[#0b1424] text-white"
    : "border-slate-200 bg-white text-slate-950";
}

export function adminCardClasses(scheme: AdminScheme, extra?: string) {
  return cn(
    "rounded-[20px] border shadow-[0_24px_60px_rgba(2,6,23,0.12)] transition-all duration-200 ease-out hover:-translate-y-0.5",
    scheme === "dark"
      ? "border-[#24344d] bg-[#101a2b] hover:border-blue-400/30 hover:shadow-[0_28px_70px_rgba(2,6,23,0.34)]"
      : "border-slate-200 bg-white hover:border-blue-300/70 hover:shadow-[0_24px_54px_rgba(37,99,235,0.12)]",
    extra,
  );
}

export function adminMutedClasses(scheme: AdminScheme) {
  return scheme === "dark" ? "text-[#a9bdd7]" : "text-slate-600";
}

export function adminInputClasses(scheme: AdminScheme) {
  return cn(
    "h-11 w-full rounded-[12px] border px-4 text-[15px] outline-none transition-all duration-200 cursor-text focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 [&:is(select)]:cursor-pointer",
    scheme === "dark"
      ? "border-[#263650] bg-[#0b1424] text-white placeholder:text-slate-500 hover:border-blue-400/40"
      : "border-slate-300 bg-white text-slate-950 placeholder:text-slate-400 hover:border-blue-400/50",
  );
}

export function adminTextareaClasses(scheme: AdminScheme) {
  return cn(adminInputClasses(scheme), "h-auto min-h-[96px] py-3");
}

export function adminLabelClasses(scheme: AdminScheme) {
  return cn("text-[12px] font-bold", scheme === "dark" ? "text-[#9fb1cc]" : "text-slate-600");
}

export function adminTableShellClasses(scheme: AdminScheme) {
  return adminCardClasses(scheme, "p-5 sm:p-6");
}

export function adminPageClasses() {
  return "space-y-6";
}
