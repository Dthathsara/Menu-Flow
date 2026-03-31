const plans = [
  {
    name: "Starter",
    price: "$29",
    suffix: "/mo",
    description: "For small cafes and single-location businesses.",
    features: [
      "1 location",
      "QR menu",
      "Category setup",
      "Basic analytics",
    ],
    cta: "Choose Starter",
    featured: false,
  },
  {
    name: "Growth",
    price: "$79",
    suffix: "/mo",
    description: "For busy restaurants and expanding multi-branch teams.",
    features: [
      "Up to 5 locations",
      "Live updates",
      "Order management",
      "Advanced analytics",
    ],
    cta: "Choose Growth",
    featured: true,
  },
  {
    name: "Premium",
    price: "Custom",
    suffix: "",
    description:
      "For hotels, food groups, enterprise brands, and custom deployments.",
    features: [
      "Unlimited locations",
      "White-label options",
      "Priority support",
      "Custom onboarding",
    ],
    cta: "Talk to Sales",
    featured: false,
  },
] as const;

export function PricingSection() {
  return (
    <section
      id="pricing"
      className="relative isolate overflow-hidden scroll-mt-24 pt-4 pb-24 sm:pt-6 sm:pb-28 lg:pt-10"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full blur-3xl [background:var(--pricing-glow-left)] sm:h-80 sm:w-80 lg:-left-8 lg:h-[26rem] lg:w-[26rem]" />
        <div className="absolute -right-24 top-10 h-72 w-72 rounded-full blur-3xl [background:var(--pricing-glow-right)] sm:h-80 sm:w-80 lg:right-6 lg:h-[28rem] lg:w-[28rem]" />
      </div>

      <div className="relative mx-auto w-full max-w-[1560px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <span className="inline-flex items-center rounded-full border bg-[var(--surface-soft)] px-4 py-1.5 text-sm font-semibold tracking-wide text-[var(--text-primary)] shadow-[0_0_28px_rgba(249,115,22,0.14)] [border-color:var(--border-soft)]">
            Pricing
          </span>

          <h2 className="mx-auto mt-6 max-w-5xl text-balance text-4xl font-semibold leading-[0.95] tracking-[-0.05em] text-[var(--text-primary)] sm:text-5xl lg:text-[4.15rem]">
            Simple pricing for growing food businesses
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 xl:grid-cols-3 2xl:gap-7">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`group relative flex h-full flex-col rounded-[2rem] border p-7 shadow-[var(--pricing-card-shadow)] backdrop-blur-xl transition-all duration-300 sm:p-8 ${
                plan.featured
                  ? "[background:var(--pricing-card-featured-bg)] [border-color:var(--pricing-card-featured-border)] shadow-[var(--pricing-card-featured-shadow)]"
                  : "[background:var(--pricing-card-bg)] [border-color:var(--pricing-card-border)] hover:-translate-y-0.5 hover:[background:var(--pricing-card-bg-hover)] hover:shadow-[var(--pricing-card-hover-shadow)] hover:[border-color:var(--pricing-card-border-hover)]"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <p
                  className={`text-2xl font-semibold tracking-[-0.04em] ${
                    plan.featured
                      ? "text-orange-300"
                      : "text-[var(--text-secondary)]"
                  }`}
                >
                  {plan.name}
                </p>

                {plan.featured ? (
                  <span className="inline-flex items-center rounded-full bg-orange-500 px-4 py-1.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(249,115,22,0.24)]">
                    Most Popular
                  </span>
                ) : null}
              </div>

              <div className="mt-8 flex items-end gap-1">
                <span className="text-5xl font-semibold leading-none tracking-[-0.05em] text-[var(--text-primary)] sm:text-[3.7rem]">
                  {plan.price}
                </span>
                {plan.suffix ? (
                  <span className="pb-1 text-3xl font-medium tracking-[-0.04em] text-[var(--text-tertiary)]">
                    {plan.suffix}
                  </span>
                ) : null}
              </div>

              <p className="mt-5 max-w-[26rem] text-lg leading-8 text-[var(--text-secondary)]">
                {plan.description}
              </p>

              <ul className="mt-8 space-y-4 text-lg leading-8 text-[var(--text-secondary)]">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--text-primary)]/80"
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-10">
                <a
                  href="#contact"
                  className={`inline-flex w-full items-center justify-center rounded-[1.35rem] border px-6 py-4 text-xl font-semibold transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/60 ${
                    plan.featured
                      ? "border-white/80 bg-white text-slate-900 shadow-[0_18px_38px_rgba(255,255,255,0.12)] hover:-translate-y-0.5 hover:bg-white/95"
                      : "[border-color:var(--pricing-button-border)] bg-transparent text-[var(--text-primary)] hover:-translate-y-0.5 hover:bg-[var(--pricing-button-hover)]"
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
