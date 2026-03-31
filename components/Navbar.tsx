"use client";

import { useEffect, useState } from "react";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Benefits", href: "#benefits" },
  { label: "Solutions", href: "#solutions" },
  { label: "Pricing", href: "#pricing" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

function LogoMark() {
  return (
    <span className="relative inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-violet-500 text-lg font-semibold text-white shadow-[0_18px_45px_rgba(249,115,22,0.35)]">
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.28),transparent_50%)]" />
      <span className="relative">M</span>
    </span>
  );
}

type Theme = "dark" | "light";

export function Navbar() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.dataset.theme === "light"
        ? "light"
        : "dark";
    }

    return "dark";
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-[var(--nav-surface)] backdrop-blur-md transition-colors duration-300 [border-color:var(--border-soft)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <a href="#home" className="flex min-w-0 items-center gap-3">
          <LogoMark />
          <span className="min-w-0">
            <span className="block truncate text-xl font-semibold tracking-tight text-[var(--text-primary)]">
              MenuFlow
            </span>
            <span className="block truncate text-sm text-[var(--text-secondary)]">
              Smart menus. Faster service.
            </span>
          </span>
        </a>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-7 lg:flex"
        >
          <div className="hidden gap-6 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="relative text-sm font-medium text-[var(--nav-link)] transition-colors duration-300 hover:text-orange-500 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-orange-500 after:transition-all after:duration-300 hover:after:w-full"
              >
                {link.label}
              </a>
            ))}
          </div>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="inline-flex items-center gap-2 rounded-full border bg-[var(--button-secondary-bg)] px-5 py-3 text-sm font-semibold text-[var(--button-secondary-text)] shadow-[var(--button-secondary-shadow)] transition duration-300 hover:-translate-y-0.5 hover:bg-[var(--button-secondary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/60 [border-color:var(--border-soft)]"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--surface-strong)]">
              {theme === "dark" ? (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4 fill-current text-orange-300"
                >
                  <path d="M12 18.5A6.5 6.5 0 1 0 12 5.5a6.5 6.5 0 0 0 0 13Zm0-16a1 1 0 0 1 1 1v1.1a1 1 0 0 1-2 0V3.5a1 1 0 0 1 1-1Zm0 17a1 1 0 0 1 1 1v1.1a1 1 0 1 1-2 0V20.5a1 1 0 0 1 1-1Zm8.5-8.5a1 1 0 0 1 1 1 1 1 0 0 1-1 1h-1.1a1 1 0 1 1 0-2h1.1ZM4.6 12a1 1 0 1 1 0 2H3.5a1 1 0 1 1 0-2h1.1Zm13.16-5.66a1 1 0 0 1 1.41 1.41l-.78.78a1 1 0 1 1-1.4-1.42l.77-.77ZM7 17a1 1 0 0 1 1.41 1.41l-.78.78a1 1 0 1 1-1.4-1.42L7 17Zm11.17 2.2a1 1 0 0 1-1.41 0l-.78-.78a1 1 0 0 1 1.42-1.4l.77.77a1 1 0 0 1 0 1.41ZM8.42 8.42A1 1 0 1 1 7 7L6.22 6.2a1 1 0 1 1 1.42-1.4l.78.77a1 1 0 0 1 0 1.42Z" />
                </svg>
              ) : (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4 fill-current text-slate-700"
                >
                  <path d="M14.77 4.3A8.26 8.26 0 0 0 12 4a8 8 0 1 0 8 8c0-.96-.17-1.87-.48-2.7a1 1 0 0 0-1.62-.36 6 6 0 0 1-8.24-8.24 1 1 0 0 0-.36-1.62A8.05 8.05 0 0 0 12 4c.94 0 1.84.16 2.7.3a1 1 0 0 1 .07 2Z" />
                </svg>
              )}
            </span>
          </button>

          <a
            href="#contact"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-5 py-3 text-sm font-semibold text-white shadow-[var(--button-primary-shadow)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--button-primary-hover-shadow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/60"
          >
            Book a Demo
          </a>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border bg-[var(--button-secondary-bg)] text-[var(--button-secondary-text)] shadow-[var(--button-secondary-shadow)] transition hover:bg-[var(--button-secondary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/60 lg:hidden [border-color:var(--border-soft)]"
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-nav"
          aria-label="Toggle navigation menu"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5 stroke-current"
            fill="none"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            {isMobileMenuOpen ? (
              <path d="m6 6 12 12M18 6 6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      <div
        id="mobile-nav"
        className={`overflow-hidden border-t transition-[max-height,opacity] duration-300 lg:hidden [border-color:var(--border-soft)] ${
          isMobileMenuOpen ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6">
          <nav aria-label="Mobile" className="grid gap-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-2xl border bg-[var(--button-secondary-bg)] px-4 py-3 text-sm font-medium text-[var(--button-secondary-text)] shadow-[var(--button-secondary-shadow)] transition duration-300 hover:bg-[var(--button-secondary-hover)] [border-color:var(--border-soft)]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center justify-center rounded-full border bg-[var(--button-secondary-bg)] px-5 py-3 text-sm font-semibold text-[var(--button-secondary-text)] shadow-[var(--button-secondary-shadow)] transition duration-300 hover:bg-[var(--button-secondary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/60 [border-color:var(--border-soft)]"
          >
            Toggle Theme
          </button>

          <a
            href="#contact"
            onClick={() => setIsMobileMenuOpen(false)}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-3 font-semibold text-white shadow-[var(--button-primary-shadow)] transition-all duration-300 hover:shadow-[var(--button-primary-hover-shadow)]"
          >
            Book a Demo
          </a>
        </div>
      </div>
    </header>
  );
}
