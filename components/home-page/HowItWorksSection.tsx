const steps = [
  {
    number: "01",
    title: "Create your digital menu",
    description:
      "Upload dishes, pricing, images, categories, and brand visuals in a clean admin dashboard.",
  },
  {
    number: "02",
    title: "Generate your QR code",
    description:
      "Print a stylish QR for every table, room, counter, or takeaway touchpoint.",
  },
  {
    number: "03",
    title: "Customers scan and browse",
    description:
      "Guests enjoy a fast, premium mobile menu experience with categories, specials, and smart browsing.",
  },
  {
    number: "04",
    title: "Receive and manage orders",
    description:
      "Handle orders, updates, and insights with less friction and better team visibility.",
  },
] as const;

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative isolate overflow-hidden scroll-mt-[calc(var(--header-height,5.75rem)+1rem)] pt-4 pb-24 sm:pt-6 sm:pb-28 lg:pt-8"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full blur-3xl [background:var(--how-it-works-glow-left)] sm:h-80 sm:w-80 lg:-left-10 lg:top-28 lg:h-[26rem] lg:w-[26rem]" />
        <div className="absolute -right-24 bottom-10 h-72 w-72 rounded-full blur-3xl [background:var(--how-it-works-glow-right)] sm:h-80 sm:w-80 lg:right-0 lg:top-12 lg:h-[28rem] lg:w-[28rem]" />
      </div>

      <div className="relative mx-auto grid w-full max-w-[1560px] grid-cols-1 gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start lg:gap-18 lg:px-8 xl:gap-24">
        <div className="max-w-2xl pt-4 sm:pt-8 lg:pt-28 xl:pt-32">
          <span className="inline-flex items-center rounded-full border bg-[var(--surface-soft)] px-4 py-1.5 text-sm font-semibold tracking-wide text-[var(--text-primary)] shadow-[0_0_28px_rgba(249,115,22,0.12)] [border-color:var(--border-soft)]">
            How it works
          </span>

          <h2 className="mt-6 max-w-[11ch] text-balance text-4xl font-semibold leading-[0.95] tracking-[-0.05em] text-[var(--text-primary)] sm:text-5xl lg:text-[4.15rem]">
            Launch a refined digital dining flow in four simple steps
          </h2>

          <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--text-secondary)] sm:text-xl">
            From your first menu upload to live customer ordering, MenuFlow
            keeps the process elegant and operationally simple.
          </p>
        </div>

        <div className="flex flex-col gap-5 sm:gap-6">
          {steps.map((step) => (
            <article
              key={step.number}
              className="group relative overflow-hidden rounded-[2rem] border p-7 shadow-[var(--how-step-card-shadow)] backdrop-blur-xl transition-all duration-300 [background:var(--how-step-card-bg)] [border-color:var(--how-step-card-border)] hover:-translate-y-0.5 hover:[background:var(--how-step-card-bg-hover)] hover:shadow-[var(--how-step-card-hover-shadow)] sm:p-8 lg:p-9"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-80 [background:var(--how-step-card-sheen)]"
              />

              <div className="relative">
                <p className="text-sm font-semibold tracking-[0.18em] text-orange-400">
                  {step.number}
                </p>

                <h3 className="mt-5 text-3xl font-semibold leading-tight tracking-[-0.04em] text-[var(--text-primary)] sm:text-[2rem]">
                  {step.title}
                </h3>

                <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--text-secondary)]">
                  {step.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
