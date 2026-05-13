import {
  primaryButtonClassName,
  secondaryButtonClassName,
} from "@/components/common/buttons";
import { SectionLink } from "@/components/home-page/SectionLink";

export function CTAButtons() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <SectionLink href="#contact" className={primaryButtonClassName}>
        Start Free Trial
      </SectionLink>
      <SectionLink href="#contact" className={secondaryButtonClassName}>
        Book a Demo
      </SectionLink>
    </div>
  );
}
