"use client";

import { useEffect, useRef, useState } from "react";

import {
  primaryButtonClassName,
  secondaryButtonClassName,
} from "@/components/CTAButtons";
import { LoginModal, type AuthTheme, cn } from "@/components/login/LoginModal";
import { scrollToSection, SectionLink } from "@/components/SectionLink";
import { SignUpModal } from "@/components/sign up/SignUpModal";
import { primaryNavLinks } from "@/components/siteNavigation";

function LogoMark() {
  return (
    <span className="relative inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-violet-500 text-lg font-semibold text-white shadow-[0_18px_45px_rgba(249,115,22,0.35)]">
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.28),transparent_50%)]" />
      <span className="relative">M</span>
    </span>
  );
}

export function Navbar() {
  const headerRef = useRef<HTMLElement | null>(null);
  const [theme, setTheme] = useState<AuthTheme>(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.dataset.theme === "light"
        ? "light"
        : "dark";
    }

    return "dark";
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<"login" | "signup" | null>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const header = headerRef.current;

    if (!header) {
      return;
    }

    const updateHeaderHeight = () => {
      document.documentElement.style.setProperty(
        "--header-height",
        `${header.getBoundingClientRect().height}px`,
      );
    };

    updateHeaderHeight();

    const resizeObserver = new ResizeObserver(updateHeaderHeight);
    resizeObserver.observe(header);
    window.addEventListener("resize", updateHeaderHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateHeaderHeight);
    };
  }, []);

  useEffect(() => {
    if (!window.location.hash) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      scrollToSection(window.location.hash);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  const desktopTextButtonClassName = cn(
    secondaryButtonClassName,
    "rounded-full px-4 py-2.5 text-sm shadow-none",
  );
  const gradientButtonClassName = cn(
    primaryButtonClassName,
    "rounded-full px-4 py-2.5 text-sm",
  );
  const themeButtonClassName = cn(
    "inline-flex h-11 w-11 items-center justify-center rounded-full border bg-[var(--button-secondary-bg)] text-[var(--button-secondary-text)] shadow-[var(--button-secondary-shadow)] transition duration-300",
    "hover:-translate-y-0.5 hover:bg-[var(--button-secondary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/60",
    "[border-color:var(--border-soft)]",
  );

  return (
    <>
      <header
        ref={headerRef}
        className="sticky top-0 z-50 border-b bg-[var(--nav-surface)] backdrop-blur-md transition-colors duration-300 [border-color:var(--border-soft)]"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <SectionLink href="#home" className="flex min-w-0 items-center gap-3">
            <LogoMark />
            <span className="min-w-0">
              <span className="block truncate text-xl font-semibold tracking-tight text-[var(--text-primary)]">
                MenuFlow
              </span>
              <span className="block truncate text-sm text-[var(--text-secondary)]">
                Smart menus. Faster service.
              </span>
            </span>
          </SectionLink>

          <nav
            aria-label="Primary"
            className="hidden min-[1200px]:flex min-[1200px]:items-center"
          >
            <div className="flex items-center gap-4 xl:gap-5">
              {primaryNavLinks.map((link) => (
                <SectionLink
                  key={link.label}
                  href={link.href}
                  className="relative text-[13px] font-medium text-[var(--nav-link)] transition-colors duration-300 hover:text-orange-500 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-orange-500 after:transition-all after:duration-300 hover:after:w-full"
                >
                  {link.label}
                </SectionLink>
              ))}
            </div>
          </nav>

          <div className="hidden min-[1200px]:flex min-[1200px]:items-center min-[1200px]:gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className={themeButtonClassName}
            >
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
            </button>

            <button
              type="button"
              onClick={() => setActiveModal("login")}
              className={desktopTextButtonClassName}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => setActiveModal("signup")}
              className={gradientButtonClassName}
            >
              Sign Up
            </button>

          </div>

          <div className="flex items-center gap-2 min-[1200px]:hidden">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className={themeButtonClassName}
            >
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
            </button>

            <button
              type="button"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-nav"
              aria-label="Toggle navigation menu"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border bg-[var(--button-secondary-bg)] text-[var(--button-secondary-text)] shadow-[var(--button-secondary-shadow)] transition hover:bg-[var(--button-secondary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/60 [border-color:var(--border-soft)]"
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
        </div>

        <div
          id="mobile-nav"
          className={`overflow-hidden border-t transition-[max-height,opacity] duration-300 min-[1200px]:hidden [border-color:var(--border-soft)] ${
            isMobileMenuOpen ? "max-h-[42rem] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6">
            <nav aria-label="Mobile" className="grid gap-2">
              {primaryNavLinks.map((link) => (
                <SectionLink
                  key={link.label}
                  href={link.href}
                  navigationDelay={50}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-2xl border bg-[var(--button-secondary-bg)] px-4 py-3 text-sm font-medium text-[var(--button-secondary-text)] shadow-[var(--button-secondary-shadow)] transition duration-300 hover:bg-[var(--button-secondary-hover)] [border-color:var(--border-soft)]"
                >
                  {link.label}
                </SectionLink>
              ))}
            </nav>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setActiveModal("login");
                }}
                className={cn(desktopTextButtonClassName, "w-full justify-center")}
              >
                Login
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setActiveModal("signup");
                }}
                className={cn(gradientButtonClassName, "w-full justify-center")}
              >
                Sign Up
              </button>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center justify-center rounded-full border bg-[var(--button-secondary-bg)] px-5 py-3 text-sm font-semibold text-[var(--button-secondary-text)] shadow-[var(--button-secondary-shadow)] transition duration-300 hover:bg-[var(--button-secondary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/60 [border-color:var(--border-soft)]"
            >
              Toggle Theme
            </button>
          </div>
        </div>
      </header>

      <LoginModal
        open={activeModal === "login"}
        onClose={() => setActiveModal(null)}
        onOpenSignUp={() => setActiveModal("signup")}
        theme={theme}
      />

      <SignUpModal
        open={activeModal === "signup"}
        onClose={() => setActiveModal(null)}
        onOpenLogin={() => setActiveModal("login")}
        theme={theme}
      />
    </>
  );
}
