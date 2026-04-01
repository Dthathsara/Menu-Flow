const testimonials = [
  {
    quote:
      "“MenuFlow made our menu feel premium and easy to manage. Customers scan, browse, and order without confusion.”",
    name: "Ariana Costa",
    role: "Owner, Velvet Cafe",
    featured: false,
  },
  {
    quote:
      "“We reduced menu printing costs and improved order flow across three branches. The dashboard is incredibly clean.”",
    name: "Marcus Lee",
    role: "Operations Lead, Urban Fork",
    featured: true,
  },
  {
    quote:
      "“The guest experience feels elevated. It fits beautifully with our hotel brand and room dining service.”",
    name: "Sophie Martin",
    role: "Hospitality Manager, Harbor Hotel",
    featured: false,
  },
] as const;

function StarRow() {
  return (
    <div
      aria-label="5 out of 5 stars"
      className="flex items-center gap-1 text-[var(--testimonial-star)]"
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <svg
          key={index}
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="h-4 w-4 fill-current"
        >
          <path d="M10 1.6 12.47 6.6l5.52.8-4 3.9.95 5.5L10 14.2 5.06 16.8l.94-5.5-4-3.9 5.52-.8L10 1.6Z" />
        </svg>
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="relative isolate overflow-hidden scroll-mt-24 pt-4 pb-24 sm:pt-6 sm:pb-28 lg:pt-10"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full blur-3xl [background:var(--testimonial-glow-left)] sm:h-80 sm:w-80 lg:-left-4 lg:h-[25rem] lg:w-[25rem]" />
        <div className="absolute -right-24 top-12 h-72 w-72 rounded-full blur-3xl [background:var(--testimonial-glow-right)] sm:h-80 sm:w-80 lg:right-8 lg:h-[27rem] lg:w-[27rem]" />
      </div>

      <div className="relative mx-auto w-full max-w-[1560px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center rounded-full border bg-[var(--surface-soft)] px-4 py-1.5 text-sm font-semibold tracking-wide text-[var(--text-primary)] shadow-[0_0_28px_rgba(249,115,22,0.12)] [border-color:var(--border-soft)]">
            Testimonials
          </span>

          <h2 className="mx-auto mt-6 max-w-4xl text-balance text-4xl font-semibold leading-[0.95] tracking-[-0.05em] text-[var(--text-primary)] sm:text-5xl lg:text-[4.15rem]">
            Loved by restaurant operators and hospitality teams
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:gap-7">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.name}
              className={`group relative flex h-full min-h-[18.5rem] flex-col rounded-[2rem] border p-7 shadow-[var(--testimonial-card-shadow)] backdrop-blur-xl transition-all duration-300 sm:p-8 ${
                testimonial.featured
                  ? "xl:-translate-y-2 [background:var(--testimonial-card-featured-bg)] [border-color:var(--testimonial-card-featured-border)] shadow-[var(--testimonial-card-featured-shadow)]"
                  : "[background:var(--testimonial-card-bg)] [border-color:var(--testimonial-card-border)] hover:-translate-y-0.5 hover:[background:var(--testimonial-card-bg-hover)] hover:shadow-[var(--testimonial-card-hover-shadow)] hover:[border-color:var(--testimonial-card-border-hover)]"
              }`}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-[2rem] opacity-80 [background:var(--testimonial-card-sheen)]"
              />

              <div className="relative flex h-full flex-col">
                <StarRow />

                <p className="mt-8 text-xl leading-9 text-[var(--text-secondary)]">
                  {testimonial.quote}
                </p>

                <div className="mt-auto pt-10">
                  <h3 className="text-2xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                    {testimonial.name}
                  </h3>
                  <p className="mt-2 text-lg text-[var(--text-tertiary)]">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
