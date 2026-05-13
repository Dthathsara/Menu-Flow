const features = [
  {
    title: "QR Menu Access",
    description:
      "Instant scan-to-menu journeys that feel elegant, fast, and frictionless across every table.",
    accent:
      "bg-gradient-to-br from-orange-100/90 via-orange-200/60 to-pink-200/70 text-orange-500",
  },
  {
    title: "Real-Time Menu Updates",
    description:
      "Change pricing, availability, and specials instantly without reprints or service delays.",
    accent:
      "bg-gradient-to-br from-cyan-100/90 via-sky-200/55 to-blue-200/70 text-cyan-500",
  },
  {
    title: "Multi-Branch Management",
    description:
      "Control multiple locations, pricing layers, and menus from one streamlined dashboard.",
    accent:
      "bg-gradient-to-br from-violet-100/90 via-purple-200/55 to-fuchsia-200/70 text-violet-500",
  },
  {
    title: "Smart Order Flow",
    description:
      "Keep front-of-house and kitchen teams aligned with clean, real-time order handling.",
    accent:
      "bg-gradient-to-br from-teal-100/90 via-emerald-200/55 to-cyan-200/70 text-teal-500",
  },
  {
    title: "Category Browsing",
    description:
      "Organize menus beautifully with intuitive categories, filters, and featured highlights.",
    accent:
      "bg-gradient-to-br from-pink-100/90 via-fuchsia-200/55 to-rose-200/70 text-pink-500",
  },
  {
    title: "Featured Dishes Promotion",
    description:
      "Drive upsells with chef specials, seasonal offers, and limited-time dish placements.",
    accent:
      "bg-gradient-to-br from-amber-100/90 via-orange-200/55 to-yellow-200/70 text-amber-500",
  },
  {
    title: "Restaurant Analytics",
    description:
      "Measure scans, ordering patterns, top categories, and customer engagement in one place.",
    accent:
      "bg-gradient-to-br from-blue-100/90 via-sky-200/55 to-indigo-200/70 text-blue-500",
  },
  {
    title: "Mobile-First Experience",
    description:
      "A premium browsing experience for customers on any phone, tablet, or mobile browser.",
    accent:
      "bg-gradient-to-br from-purple-100/90 via-violet-200/55 to-fuchsia-200/70 text-purple-500",
  },
] as const;

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative isolate overflow-hidden scroll-mt-[calc(var(--header-height,5.75rem)+1rem)] pt-10 pb-24 sm:pt-1 sm:pb-28"
    >
      <div className="relative mx-auto w-full max-w-[1560px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center rounded-full border bg-[var(--badge-surface)] px-4 py-1.5 text-sm font-medium tracking-wide text-[var(--badge-text)] shadow-[0_0_28px_rgba(249,115,22,0.18)] [border-color:var(--badge-border)]">
            Features
          </span>

          <h2 className="mx-auto mt-6 max-w-5xl text-balance text-4xl font-semibold leading-tight tracking-[-0.04em] text-[var(--text-primary)] sm:text-5xl lg:max-w-4xl lg:text-6xl">
            Everything your restaurant needs to serve smarter
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-[var(--text-secondary)] sm:text-xl">
            A beautifully designed digital menu platform with operational
            tools, live control, and premium customer experiences built in.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4 2xl:gap-7">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="group flex h-full flex-col rounded-[2rem] border bg-[var(--feature-card-bg)] p-7 shadow-[var(--feature-card-shadow)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--feature-card-bg-hover)] hover:shadow-[var(--feature-card-hover-shadow)] [border-color:var(--feature-card-border)] hover:[border-color:var(--feature-card-border-hover)]"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 [--tw-ring-color:var(--feature-icon-ring)] ${feature.accent}`}
                style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)" }}
              >
                <span className="h-5 w-5 rounded-lg bg-current/70" />
              </div>

              <h3 className="mt-8 text-[1.75rem] font-semibold leading-tight tracking-[-0.03em] text-[var(--text-primary)]">
                {feature.title}
              </h3>

              <p className="mt-4 text-base leading-8 text-[var(--text-secondary)]">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
