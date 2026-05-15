import {
  primaryButtonClassName,
  secondaryButtonClassName,
} from "@/components/common/buttons";
import { cn } from "@/components/common/theme";
import { SectionLink } from "@/components/home-page/SectionLink";

const impactCards = [
  { label: "Table Turnover", value: "Faster" },
  { label: "Printing Costs", value: "Lower" },
  { label: "Order Accuracy", value: "Higher" },
  { label: "Brand Experience", value: "Premium" },
] as const;

const benefitCards = [
  {
    icon: "⚡",
    number: "01",
    title: "Faster Table Turnover",
    description:
      "Customers can browse and order quickly from QR menus, helping tables move faster during busy hours.",
    iconClassName: "from-blue-500 to-sky-400",
    glowClassName: "bg-blue-500/22",
  },
  {
    icon: "🧾",
    number: "02",
    title: "Lower Printing Costs",
    description:
      "Update menus instantly without reprinting physical menus every time prices or items change.",
    iconClassName: "from-orange-500 to-amber-400",
    glowClassName: "bg-orange-500/24",
  },
  {
    icon: "✅",
    number: "03",
    title: "Higher Order Accuracy",
    description:
      "Clear digital order flows reduce confusion between customers, waiters, and kitchen staff.",
    iconClassName: "from-emerald-500 to-teal-400",
    glowClassName: "bg-emerald-500/22",
  },
  {
    icon: "🧩",
    number: "04",
    title: "Easier Daily Operations",
    description:
      "Manage branches, categories, items, QR codes, and staff activity from a centralized dashboard.",
    iconClassName: "from-violet-500 to-pink-500",
    glowClassName: "bg-violet-500/24",
  },
  {
    icon: "💎",
    number: "05",
    title: "Stronger Brand Perception",
    description:
      "A polished mobile menu experience makes your restaurant feel modern, premium, and professional.",
    iconClassName: "from-cyan-500 to-blue-500",
    glowClassName: "bg-cyan-500/22",
  },
  {
    icon: "😊",
    number: "06",
    title: "Improved Satisfaction",
    description:
      "Faster service touchpoints and simple ordering flows help customers enjoy a better dining experience.",
    iconClassName: "from-rose-400 to-orange-400",
    glowClassName: "bg-pink-500/22",
  },
] as const;

const processCards = [
  {
    number: "1",
    title: "Customer scans QR",
    description:
      "Guests open your digital menu instantly from their phone without installing any app.",
  },
  {
    number: "2",
    title: "Order becomes clearer",
    description:
      "Categories, items, options, and prices are easy to browse, reducing confusion and mistakes.",
  },
  {
    number: "3",
    title: "Team works faster",
    description:
      "Managers and staff can update menus, monitor orders, and serve guests with better coordination.",
  },
] as const;

const featureCardClassName =
  "border [background:var(--feature-card-bg)] shadow-[var(--feature-card-shadow)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:[background:var(--feature-card-bg-hover)] hover:shadow-[var(--feature-card-hover-shadow)] [border-color:var(--feature-card-border)] hover:[border-color:var(--feature-card-border-hover)]";

export function BenefitsSection() {
  return (
    <section
      id="benefits"
      className="relative isolate overflow-hidden scroll-mt-[calc(var(--header-height,5.75rem)+1rem)] pt-4 pb-24 text-white sm:pt-6 sm:pb-28 lg:pt-8 lg:pb-32 [html[data-theme=light]_&]:text-slate-950"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,transparent_0%,transparent_12%,black_34%,black_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,transparent_12%,black_34%,black_100%)]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_18%,rgba(249,115,22,0.12),transparent_30%),radial-gradient(circle_at_86%_18%,rgba(79,70,229,0.18),transparent_35%),linear-gradient(180deg,transparent_0%,rgba(8,13,31,0.26)_48%,transparent_100%)] [html[data-theme=light]_&]:bg-[radial-gradient(circle_at_10%_18%,rgba(249,115,22,0.14),transparent_30%),radial-gradient(circle_at_86%_18%,rgba(168,85,247,0.12),transparent_35%),linear-gradient(180deg,transparent_0%,rgba(255,255,255,0.38)_48%,transparent_100%)]" />
        <div className="absolute -left-44 top-16 h-[34rem] w-[34rem] rounded-full bg-orange-500/18 blur-[150px] [html[data-theme=light]_&]:bg-orange-300/30" />
        <div className="absolute -right-40 top-10 h-[38rem] w-[38rem] rounded-full bg-blue-600/24 blur-[160px] [html[data-theme=light]_&]:bg-violet-300/32" />
        <div className="absolute bottom-4 left-1/2 h-[28rem] w-[46rem] -translate-x-1/2 rounded-full bg-pink-500/10 blur-[160px] [html[data-theme=light]_&]:bg-pink-200/28" />
      </div>

      <div className="relative mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-5 py-2 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md [html[data-theme=light]_&]:border-slate-200 [html[data-theme=light]_&]:bg-white/80 [html[data-theme=light]_&]:text-slate-900">
            Benefits
          </span>

          <h2 className="mt-7 max-w-5xl text-balance text-5xl font-semibold leading-[0.95] tracking-[-0.05em] text-white sm:text-6xl lg:text-[5.35rem] [html[data-theme=light]_&]:text-slate-950">
            A better guest journey
            <br />
            and a more efficient
            <br />
            <span className="bg-gradient-to-r from-sky-200 via-violet-300 to-rose-400 bg-clip-text text-transparent [html[data-theme=light]_&]:from-blue-600 [html[data-theme=light]_&]:via-violet-600 [html[data-theme=light]_&]:to-pink-600">
              restaurant operation
            </span>
          </h2>

          <p className="mt-7 max-w-[820px] text-balance text-lg leading-8 text-blue-100/90 [html[data-theme=light]_&]:text-slate-600">
            MenuFlow helps restaurants, cafés, hotels, and food businesses serve
            guests faster, reduce manual work, improve order accuracy, and create
            a polished digital ordering experience.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {impactCards.map((card) => (
            <article
              key={card.label}
              className={cn(
                featureCardClassName,
                "rounded-[2rem] px-6 py-6",
              )}
            >
              <p className="text-sm text-blue-100/72 [html[data-theme=light]_&]:text-slate-500">
                {card.label}
              </p>
              <h3 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white [html[data-theme=light]_&]:text-slate-950">
                {card.value}
              </h3>
            </article>
          ))}
        </div>

        <div className="mt-9 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {benefitCards.map((card) => (
            <article
              key={card.number}
              className={cn(
                featureCardClassName,
                "group min-h-[290px] rounded-[2rem] p-8",
              )}
            >
              <div
                aria-hidden="true"
                className={cn(
                  "absolute -right-6 -top-4 h-36 w-36 rounded-full blur-3xl transition-opacity duration-300 group-hover:opacity-90",
                  card.glowClassName,
                )}
              />
              <div className="relative flex items-start justify-between gap-5">
                <span
                  className={cn(
                    "inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl shadow-[0_18px_44px_rgba(59,130,246,0.22)]",
                    card.iconClassName,
                  )}
                >
                  {card.icon}
                </span>
                <span className="text-5xl font-semibold tracking-[-0.05em] text-white/24 [html[data-theme=light]_&]:text-slate-300">
                  {card.number}
                </span>
              </div>

              <h3 className="relative mt-10 text-2xl font-semibold tracking-[-0.04em] text-white [html[data-theme=light]_&]:text-slate-950">
                {card.title}
              </h3>
              <p className="relative mt-5 text-base leading-7 text-blue-100/82 [html[data-theme=light]_&]:text-slate-600">
                {card.description}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-16 rounded-[2rem] border border-white/12 bg-white/[0.09] p-6 shadow-[0_30px_90px_rgba(2,6,23,0.26)] backdrop-blur-xl sm:p-8 lg:rounded-[2.2rem] lg:p-10 [html[data-theme=light]_&]:border-slate-300/80 [html[data-theme=light]_&]:bg-white/96 [html[data-theme=light]_&]:shadow-[0_24px_64px_rgba(15,23,42,0.12)]">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <h3 className="max-w-[620px] text-4xl font-semibold leading-[1.04] tracking-[-0.05em] text-white sm:text-5xl [html[data-theme=light]_&]:text-slate-950">
              From scan to service,
              <br />
              everything feels smoother
            </h3>
            <p className="max-w-[440px] text-base leading-7 text-blue-100/86 lg:justify-self-end [html[data-theme=light]_&]:text-slate-700">
              MenuFlow improves both sides of the restaurant experience:
              customers order with less friction, and your team manages daily
              operations with more control.
            </p>
          </div>

          <div className="mt-9 grid grid-cols-1 gap-5 lg:grid-cols-3">
            {processCards.map((card) => (
              <article
                key={card.number}
                className={cn(
                  featureCardClassName,
                  "rounded-[2rem] p-6 [html[data-theme=light]_&]:border-slate-300/80 [html[data-theme=light]_&]:bg-white/95 [html[data-theme=light]_&]:shadow-[0_18px_44px_rgba(15,23,42,0.12)] [html[data-theme=light]_&]:hover:[background:var(--feature-card-bg-hover)] [html[data-theme=light]_&]:hover:[border-color:var(--feature-card-border-hover)]",
                )}
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-sky-400 text-base font-semibold text-white">
                  {card.number}
                </span>
                <h4 className="mt-6 text-xl font-semibold tracking-[-0.04em] text-white [html[data-theme=light]_&]:text-slate-950">
                  {card.title}
                </h4>
                <p className="mt-3 text-sm leading-6 text-blue-100/86 [html[data-theme=light]_&]:text-slate-700">
                  {card.description}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <SectionLink
              href="#contact"
              className={cn(primaryButtonClassName, "px-7 py-4")}
            >
              Start with MenuFlow
            </SectionLink>
            <SectionLink
              href="#pricing"
              className={cn(
                secondaryButtonClassName,
                "border-white/14 bg-white/8 px-7 py-4 text-white hover:bg-white/12 [html[data-theme=light]_&]:border-slate-200 [html[data-theme=light]_&]:bg-white [html[data-theme=light]_&]:text-slate-900",
              )}
            >
              View Pricing
            </SectionLink>
          </div>
        </div>
      </div>
    </section>
  );
}
