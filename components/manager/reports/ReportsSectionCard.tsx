import { cn, getManagerSectionTitleClasses } from "../managerUtils";
import type { ManagerSettings } from "../managerTypes";
import { getReportsMutedTextClasses, getReportsSurfaceClasses } from "./reports.helpers";
import { SectionTag } from "./SectionTag";

interface ReportsSectionCardProps {
  settings: ManagerSettings;
  title: string;
  description: string;
  tag?: string;
  tagAlign?: "left" | "right";
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}

export function ReportsSectionCard({
  settings,
  title,
  description,
  tag,
  tagAlign = "right",
  className,
  bodyClassName,
  children,
}: ReportsSectionCardProps) {
  return (
    <section className={cn(getReportsSurfaceClasses(settings.scheme, true), "overflow-hidden", className)}>
      <div className="border-b border-black/5 px-5 py-5 sm:px-6">
        <div className={cn("flex gap-3", tagAlign === "right" ? "items-start justify-between" : "flex-col")}>
          <div className="min-w-0">
            <h3 className={cn(getManagerSectionTitleClasses(), "text-[1.1rem] sm:text-[1.18rem]")}>
              {title}
            </h3>
            <p className={cn("mt-2 text-[14px] leading-6", getReportsMutedTextClasses(settings.scheme))}>
              {description}
            </p>
          </div>

          {tag && tagAlign === "right" ? (
            <SectionTag settings={settings} className="self-start">
              {tag}
            </SectionTag>
          ) : null}

          {tag && tagAlign === "left" ? (
            <SectionTag settings={settings} className="self-start">
              {tag}
            </SectionTag>
          ) : null}
        </div>
      </div>

      <div className={cn("px-5 py-5 sm:px-6 sm:py-6", bodyClassName)}>{children}</div>
    </section>
  );
}
