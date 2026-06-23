const socialLinks = [
  { label: "Instagram", href: "https://www.instagram.com/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/" },
  { label: "X", href: "https://x.com/" },
  { label: "Dribbble", href: "https://dribbble.com/" },
] as const;

export function ContactSection() {
  return (
    <section
      id="contact"
      className="relative isolate overflow-hidden scroll-mt-[calc(var(--header-height,5.75rem)+1rem)] pt-4 pb-24 sm:pt-6 sm:pb-28 lg:pt-10"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -left-24 top-14 h-72 w-72 rounded-full blur-3xl [background:var(--contact-glow-left)] sm:h-80 sm:w-80 lg:-left-6 lg:h-[25rem] lg:w-[25rem]" />
        <div className="absolute -right-24 top-8 h-72 w-72 rounded-full blur-3xl [background:var(--contact-glow-right)] sm:h-80 sm:w-80 lg:right-6 lg:h-[27rem] lg:w-[27rem]" />
      </div>

      <div className="relative mx-auto grid w-full max-w-[1560px] grid-cols-1 gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)] lg:items-start lg:gap-18 lg:px-8 xl:gap-24">
        <div className="max-w-2xl pt-2 lg:pt-8">
          <span className="inline-flex items-center rounded-full border bg-[var(--surface-soft)] px-4 py-1.5 text-sm font-semibold tracking-wide text-[var(--text-primary)] shadow-[0_0_28px_rgba(249,115,22,0.12)] [border-color:var(--border-soft)]">
            Contact
          </span>

          <h2 className="mt-6 max-w-[12ch] text-balance text-4xl font-semibold leading-[0.95] tracking-[-0.05em] text-[var(--text-primary)] sm:text-5xl lg:text-[4.15rem]">
            Let&apos;s build your restaurant&apos;s digital menu experience
          </h2>

          <p className="mt-6 max-w-[34rem] text-lg leading-8 text-[var(--text-secondary)] sm:text-xl">
            Talk to our team about onboarding, pricing, brand customization,
            and multi-location setups.
          </p>

          <div className="mt-12 space-y-6 text-lg leading-8 text-[var(--text-secondary)] sm:text-xl">
            <p>
              <span className="font-semibold text-[var(--text-primary)]">
                Email:
              </span>{" "}
              <a
                href="mailto:hello@menuflow.com"
                className="transition-colors duration-300 hover:text-orange-500"
              >
                hello@menuflow.com
              </a>
            </p>

            <p>
              <span className="font-semibold text-[var(--text-primary)]">
                Phone:
              </span>{" "}
              +1 (555) 240-9081
            </p>

            <p>
              <span className="font-semibold text-[var(--text-primary)]">
                Address:
              </span>{" "}
              220 Market Street, San Francisco, CA
            </p>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-x-3 gap-y-2 text-lg text-[var(--text-tertiary)] sm:text-xl">
            {socialLinks.map((link, index) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="transition-colors duration-300 hover:text-orange-500"
              >
                {link.label}
                {index < socialLinks.length - 1 ? (
                  <span className="ml-3 text-[var(--text-tertiary)]">·</span>
                ) : null}
              </a>
            ))}
          </div>
        </div>

        <div className="relative lg:justify-self-end">
          <div className="rounded-[2.6rem] border p-4 shadow-[var(--contact-form-shell-shadow)] backdrop-blur-xl [background:var(--contact-form-shell-bg)] [border-color:var(--contact-form-shell-border)] sm:p-5 lg:p-7">
            <form className="grid gap-4 sm:gap-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                <label className="sr-only" htmlFor="first-name">
                  First name
                </label>
                <input
                  id="first-name"
                  name="firstName"
                  type="text"
                  placeholder="First name"
                  className="min-h-16 rounded-[1.35rem] border px-5 text-lg text-[var(--contact-input-text)] placeholder:text-[var(--contact-input-placeholder)] shadow-[var(--contact-input-shadow)] outline-none transition duration-300 [background:var(--contact-input-bg)] [border-color:var(--contact-input-border)] focus:[border-color:var(--contact-input-border-focus)] focus:ring-2 focus:ring-orange-300/30"
                />

                <label className="sr-only" htmlFor="last-name">
                  Last name
                </label>
                <input
                  id="last-name"
                  name="lastName"
                  type="text"
                  placeholder="Last name"
                  className="min-h-16 rounded-[1.35rem] border px-5 text-lg text-[var(--contact-input-text)] placeholder:text-[var(--contact-input-placeholder)] shadow-[var(--contact-input-shadow)] outline-none transition duration-300 [background:var(--contact-input-bg)] [border-color:var(--contact-input-border)] focus:[border-color:var(--contact-input-border-focus)] focus:ring-2 focus:ring-orange-300/30"
                />
              </div>

              <label className="sr-only" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                className="min-h-16 rounded-[1.35rem] border px-5 text-lg text-[var(--contact-input-text)] placeholder:text-[var(--contact-input-placeholder)] shadow-[var(--contact-input-shadow)] outline-none transition duration-300 [background:var(--contact-input-bg)] [border-color:var(--contact-input-border)] focus:[border-color:var(--contact-input-border-focus)] focus:ring-2 focus:ring-orange-300/30"
              />

              <label className="sr-only" htmlFor="business-name">
                Restaurant or business name
              </label>
              <input
                id="business-name"
                name="businessName"
                type="text"
                placeholder="Restaurant or business name"
                className="min-h-16 rounded-[1.35rem] border px-5 text-lg text-[var(--contact-input-text)] placeholder:text-[var(--contact-input-placeholder)] shadow-[var(--contact-input-shadow)] outline-none transition duration-300 [background:var(--contact-input-bg)] [border-color:var(--contact-input-border)] focus:[border-color:var(--contact-input-border-focus)] focus:ring-2 focus:ring-orange-300/30"
              />

              <label className="sr-only" htmlFor="contact-message">
                Tell us about your needs
              </label>
              <textarea
                id="contact-message"
                name="message"
                placeholder="Tell us about your needs"
                rows={7}
                className="min-h-[11.5rem] rounded-[1.5rem] border px-5 py-5 text-lg text-[var(--contact-input-text)] placeholder:text-[var(--contact-input-placeholder)] shadow-[var(--contact-input-shadow)] outline-none transition duration-300 [background:var(--contact-input-bg)] [border-color:var(--contact-input-border)] focus:[border-color:var(--contact-input-border-focus)] focus:ring-2 focus:ring-orange-300/30"
              />

              <button
                type="button"
                className="mt-2 inline-flex min-h-16 items-center justify-center rounded-[1.35rem] bg-white px-6 py-4 text-lg font-semibold text-slate-900 shadow-[0_18px_38px_rgba(255,255,255,0.12)] transition duration-300 hover:-translate-y-0.5 hover:bg-white/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                Send Inquiry
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
