const benefitStats = [
  { label: "Table Turnover", value: "Faster" },
  { label: "Printing Costs", value: "Lower" },
  { label: "Order Accuracy", value: "Higher" },
  { label: "Brand Experience", value: "Premium" },
] as const;

const benefitPoints = [
  "Faster table turnover with quicker browsing and ordering",
  "Reduced printing costs with instant digital menu updates",
  "Better order accuracy through clearer customer flows",
  "Easier daily operations across branches and categories",
  "Stronger brand perception through a polished mobile experience",
  "Improved customer satisfaction with faster service touchpoints",
] as const;

export function BenefitsSection() {
  return (
    <section
      id="benefits"
      className="relative isolate overflow-hidden scroll-mt-[calc(var(--header-height,5.75rem)+1rem)] pt-4 pb-24 sm:pt-6 sm:pb-28 lg:pt-10"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -left-20 top-16 h-72 w-72 rounded-full blur-3xl [background:var(--benefits-glow-left)] sm:h-80 sm:w-80 lg:-left-6 lg:top-20 lg:h-[26rem] lg:w-[26rem]" />
        <div className="absolute -right-24 top-6 h-72 w-72 rounded-full blur-3xl [background:var(--benefits-glow-right)] sm:h-80 sm:w-80 lg:right-6 lg:top-10 lg:h-[28rem] lg:w-[28rem]" />
      </div>

      <div className="relative mx-auto grid w-full max-w-[1560px] grid-cols-1 gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:items-center lg:gap-18 lg:px-8 xl:gap-24">
        <div className="order-2 lg:order-1">
          <div className="rounded-[2.3rem] border p-6 shadow-[var(--benefits-showcase-shadow)] backdrop-blur-xl [background:var(--benefits-showcase-frame)] [border-color:var(--benefits-showcase-border)] sm:p-8 lg:p-7 xl:p-10">
            <div className="rounded-[2rem] p-5 [background:var(--benefits-showcase-panel)] sm:p-6 lg:p-7">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {benefitStats.map((stat) => (
                  <article
                    key={stat.label}
                    className="rounded-[1.45rem] border p-5 shadow-[var(--benefits-stat-shadow)] transition-transform duration-300 [background:var(--benefits-stat-bg)] [border-color:var(--benefits-stat-border)] hover:-translate-y-0.5 sm:min-h-[8.75rem] sm:p-6"
                  >
                    <p className="text-base text-[var(--text-secondary)]">
                      {stat.label}
                    </p>
                    <h3 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-[var(--text-primary)] sm:text-[3rem]">
                      {stat.value}
                    </h3>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="order-1 max-w-2xl lg:order-2 lg:pt-2">
          <span className="inline-flex items-center rounded-full border bg-[var(--surface-soft)] px-4 py-1.5 text-sm font-semibold tracking-wide text-[var(--text-primary)] shadow-[0_0_28px_rgba(249,115,22,0.12)] [border-color:var(--border-soft)]">
            Benefits
          </span>

          <h2 className="mt-6 max-w-[13ch] text-balance text-4xl font-semibold leading-[0.95] tracking-[-0.05em] text-[var(--text-primary)] sm:text-5xl lg:max-w-[12ch] lg:text-[4.05rem]">
            A better guest journey and a more efficient restaurant operation
          </h2>

          <ul className="mt-8 space-y-5 text-lg leading-8 text-[var(--text-secondary)] sm:text-xl">
            {benefitPoints.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="mt-3 h-2 w-2 shrink-0 rounded-full bg-[var(--text-primary)]/80"
                />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
