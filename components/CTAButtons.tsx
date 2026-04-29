import { SectionLink } from "@/components/SectionLink";

const primaryButtonClassName =
  "inline-flex items-center justify-center rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-pink-500 px-6 py-3.5 text-base font-semibold text-white shadow-[var(--button-primary-shadow)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[var(--button-primary-hover-shadow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/70";

const secondaryButtonClassName =
  "inline-flex items-center justify-center rounded-full border px-6 py-3.5 text-base font-semibold transition duration-300 focus-visible:outline-none focus-visible:ring-2 [border-color:var(--border-soft)] bg-[var(--button-secondary-bg)] text-[var(--button-secondary-text)] shadow-[var(--button-secondary-shadow)] hover:-translate-y-0.5 hover:bg-[var(--button-secondary-hover)] focus-visible:ring-[var(--button-secondary-ring)]";

export { primaryButtonClassName, secondaryButtonClassName };

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
