import { CTAButtons } from "@/components/CTAButtons";
import { DashboardPreview } from "@/components/DashboardPreview";
import { HeroBadge } from "@/components/HeroBadge";

const highlights = [
  "QR menus in minutes",
  "Live menu updates",
  "Built for multi-branch teams",
];

export function HeroSection() {
  return (
    <section
      id="home"
      className="relative flex min-h-[90vh] scroll-mt-24 items-center justify-center"
    >
      <div className="mx-auto grid min-h-[90vh] w-full max-w-[1560px] grid-cols-1 items-center gap-12 px-4 pb-20 pt-14 sm:px-6 md:pb-20 lg:grid-cols-2 lg:gap-20 lg:px-8 lg:pb-1 lg:pt-1 xl:gap-24">
        <div className="relative mx-auto flex w-full max-w-2xl flex-col justify-center text-center lg:mx-auto lg:max-w-[44rem] lg:justify-self-center lg:text-left">
          <div className="flex justify-center lg:justify-start">
            <HeroBadge text="Premium digital menu SaaS for food businesses" />
          </div>

          <h1 className="mt-8 max-w-[11ch] text-5xl font-semibold leading-[0.96] tracking-[-0.04em] text-[var(--text-primary)] sm:text-6xl md:text-7xl lg:max-w-none xl:text-[5.6rem]">
            Smarter Digital Menus for{" "}
            <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
              Modern
            </span>{" "}
            <span className="bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 bg-clip-text text-transparent">
              Restaurants
            </span>
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-[var(--text-secondary)] sm:text-xl lg:max-w-[40rem]">
            MenuFlow helps restaurants, cafes, hotels, and food brands launch
            elegant QR menus, streamline ordering, update items in real time,
            and create a faster, more memorable dining experience.
          </p>

          <div className="mt-12 flex justify-center lg:justify-start">
            <CTAButtons />
          </div>

          <div className="mt-12 grid gap-3 text-left text-sm text-[var(--text-secondary)] sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-full border bg-[var(--feature-chip-bg)] px-4 py-3 shadow-[var(--card-shadow)] transition duration-300 hover:-translate-y-0.5 [border-color:var(--border-soft)]"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-orange-400/30 to-pink-500/30 text-orange-500">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    className="h-3.5 w-3.5 fill-current"
                  >
                    <path d="M7.7 13.3 4.4 10l-1.4 1.4 4.7 4.6L17 6.8l-1.4-1.4-7.9 7.9Z" />
                  </svg>
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex w-full items-center justify-center lg:justify-self-center">
          <div className="w-full max-w-2xl lg:max-w-[44rem] lg:scale-105">
            <DashboardPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
