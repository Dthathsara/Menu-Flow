import { cn } from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import { getReportsTagClasses } from "./reports.helpers";

interface SectionTagProps {
  settings: ManagerSettings;
  children: React.ReactNode;
  className?: string;
}

export function SectionTag({ settings, children, className }: SectionTagProps) {
  return <span className={cn(getReportsTagClasses(settings.scheme), className)}>{children}</span>;
}
