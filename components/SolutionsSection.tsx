const solutions = [
  {
    title: "Restaurants",
    description:
      "Run elegant QR menus and simplify table-side ordering with less friction.",
  },
  {
    title: "Cafes",
    description:
      "Keep fast-moving menus, seasonal drinks, and promotions updated in seconds.",
  },
  {
    title: "Hotels",
    description:
      "Offer room service menus, restaurant browsing, and branded guest experiences.",
  },
  {
    title: "Food Courts",
    description:
      "Handle multiple vendors, categories, and fast customer decision-making flows.",
  },
  {
    title: "Cloud Kitchens",
    description:
      "Manage digital-first menus with real-time item availability and promotions.",
  },
  {
    title: "Fine Dining",
    description:
      "Deliver a premium and brand-aligned guest experience with curated visual menus.",
  },
] as const;

export function SolutionsSection() {
  return (
    <section
      id="solutions"
      className="relative isolate overflow-hidden scroll-mt-24 pt-4 pb-24 sm:pt-6 sm:pb-28 lg:pt-10"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -left-20 bottom-10 h-72 w-72 rounded-full blur-3xl [background:var(--solutions-glow-left)] sm:h-80 sm:w-80 lg:-left-6 lg:h-[26rem] lg:w-[26rem]" />
        <div className="absolute -right-24 top-8 h-72 w-72 rounded-full blur-3xl [background:var(--solutions-glow-right)] sm:h-80 sm:w-80 lg:right-4 lg:h-[28rem] lg:w-[28rem]" />
      </div>

      <div className="relative mx-auto w-full max-w-[1560px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <span className="inline-flex items-center rounded-full border bg-[var(--badge-surface)] px-4 py-1.5 text-sm font-semibold tracking-wide text-[var(--badge-text)] shadow-[0_0_28px_rgba(249,115,22,0.16)] [border-color:var(--badge-border)]">
            Solutions
          </span>

          <h2 className="mx-auto mt-6 max-w-5xl text-balance text-4xl font-semibold leading-[0.95] tracking-[-0.05em] text-[var(--text-primary)] sm:text-5xl lg:text-[4.15rem]">
            Tailored for every food business model
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:gap-7">
          {solutions.map((solution) => (
            <article
              key={solution.title}
              className="group flex h-full flex-col rounded-[2rem] border p-7 shadow-[var(--feature-card-shadow)] backdrop-blur-md transition-all duration-300 [background:var(--feature-card-bg)] [border-color:var(--feature-card-border)] hover:-translate-y-0.5 hover:[background:var(--feature-card-bg-hover)] hover:shadow-[var(--feature-card-hover-shadow)] hover:[border-color:var(--feature-card-border-hover)] sm:p-8"
            >
              <h3 className="text-[2rem] font-semibold leading-tight tracking-[-0.04em] text-[var(--text-primary)]">
                {solution.title}
              </h3>

              <p className="mt-5 text-lg leading-8 text-[var(--text-secondary)]">
                {solution.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
