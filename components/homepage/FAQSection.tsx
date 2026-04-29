"use client";

import { useState } from "react";

import { SectionLink } from "@/components/homepage/SectionLink";

const faqItems = [
  {
    question: "How quickly can I launch my menu?",
    answer:
      "Most businesses can set up a polished digital menu and QR code in under a day.",
  },
  {
    question: "Can I update items and prices anytime?",
    answer:
      "Yes. MenuFlow lets you update pricing, availability, categories, and specials in real time.",
  },
  {
    question: "Does it support multiple branches?",
    answer:
      "Absolutely. Growth and Premium plans are designed for multi-branch operations and centralized control.",
  },
  {
    question: "Is it mobile friendly for customers?",
    answer:
      "Yes. The customer experience is designed mobile-first for speed, readability, and premium visual presentation.",
  },
] as const;

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <section
      id="faq"
      className="relative isolate overflow-hidden scroll-mt-[calc(var(--header-height,5.75rem)+1rem)] pt-4 pb-24 sm:pt-6 sm:pb-28 lg:pt-10"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -left-24 top-12 h-72 w-72 rounded-full blur-3xl [background:var(--faq-glow-left)] sm:h-80 sm:w-80 lg:-left-6 lg:h-[25rem] lg:w-[25rem]" />
        <div className="absolute -right-24 top-16 h-72 w-72 rounded-full blur-3xl [background:var(--faq-glow-right)] sm:h-80 sm:w-80 lg:right-6 lg:h-[27rem] lg:w-[27rem]" />
      </div>

      <div className="relative mx-auto w-full max-w-[1560px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <span className="inline-flex items-center rounded-full border bg-[var(--surface-soft)] px-4 py-1.5 text-sm font-semibold tracking-wide text-[var(--text-primary)] shadow-[0_0_28px_rgba(249,115,22,0.12)] [border-color:var(--border-soft)]">
            FAQ
          </span>

          <h2 className="mx-auto mt-6 max-w-5xl text-balance text-4xl font-semibold leading-[0.95] tracking-[-0.05em] text-[var(--text-primary)] sm:text-5xl lg:text-[4.15rem]">
            Questions restaurant owners ask most
          </h2>
        </div>

        <div className="mx-auto mt-14 max-w-[73rem] space-y-4 sm:space-y-5">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <article
                key={item.question}
                className={`overflow-hidden rounded-[2rem] border shadow-[var(--faq-card-shadow)] backdrop-blur-xl transition-all duration-300 [background:var(--faq-card-bg)] ${
                  isOpen
                    ? "[border-color:var(--faq-card-border-hover)]"
                    : "[border-color:var(--faq-card-border)] hover:[border-color:var(--faq-card-border-hover)]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(index)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${index}`}
                  className={`flex min-h-[6.6rem] w-full items-start justify-between gap-4 px-6 py-5 text-left transition-colors duration-300 sm:min-h-[6.9rem] sm:px-7 sm:py-5.5 lg:min-h-[7.2rem] lg:px-8 lg:py-6 ${
                    isOpen ? "" : "hover:bg-white/[0.015]"
                  }`}
                >
                  <span className="pr-4 text-[1.95rem] font-semibold leading-[1.08] tracking-[-0.04em] text-[var(--text-primary)] sm:text-[2.05rem] lg:text-[2.15rem]">
                    {item.question}
                  </span>

                  <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--text-primary)] transition-transform duration-300">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-5 w-5 stroke-current"
                      fill="none"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M5 12h14" />
                      {!isOpen ? <path d="M12 5v14" /> : null}
                    </svg>
                  </span>
                </button>

                <div
                  id={`faq-panel-${index}`}
                  className={`grid overflow-hidden px-6 transition-[grid-template-rows,opacity,padding] duration-300 ease-out sm:px-7 lg:px-8 ${
                    isOpen
                      ? "grid-rows-[1fr] pb-6 opacity-100 sm:pb-7 lg:pb-8"
                      : "grid-rows-[0fr] pb-0 opacity-0"
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <p className="max-w-[62rem] text-lg leading-8 text-[var(--text-secondary)] sm:text-xl">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mx-auto mt-16 max-w-[73rem] lg:mt-20">
          <div className="overflow-hidden rounded-[2.6rem] border shadow-[var(--faq-cta-shadow)] [background:var(--faq-cta-bg)] [border-color:var(--faq-cta-border)]">
            <div className="grid gap-10 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.75fr)] lg:items-center lg:gap-16 lg:px-12 lg:py-12 xl:px-14 xl:py-14">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold tracking-[0.24em] text-white/90 sm:text-[0.95rem]">
                  READY TO MODERNIZE YOUR MENU EXPERIENCE?
                </p>

                <h3 className="mt-6 max-w-[12ch] text-5xl font-semibold leading-[0.94] tracking-[-0.05em] text-white sm:text-6xl lg:text-[4.35rem]">
                  Launch a premium digital dining journey with MenuFlow
                </h3>

                <p className="mt-6 max-w-[42rem] text-lg leading-8 text-white/88 sm:text-xl">
                  Transform how customers browse, order, and interact with your
                  restaurant brand — while making operations simpler for your
                  team.
                </p>
              </div>

              <div className="flex flex-col gap-4 lg:justify-self-end lg:min-w-[27rem]">
                <SectionLink
                  href="#contact"
                  className="inline-flex min-h-16 items-center justify-center rounded-[1.35rem] bg-white px-6 py-4 text-lg font-semibold text-slate-900 shadow-[0_18px_45px_rgba(255,255,255,0.18)] transition duration-300 hover:-translate-y-0.5 hover:bg-white/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                >
                  Start Free Trial
                </SectionLink>

                <SectionLink
                  href="#contact"
                  className="inline-flex min-h-16 items-center justify-center rounded-[1.35rem] border border-white/25 bg-white/10 px-6 py-4 text-lg font-semibold text-white backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:bg-white/14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  Schedule Demo
                </SectionLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
