import { SectionLink } from "@/components/homepage/SectionLink";
import { footerNavLinks } from "@/components/homepage/siteNavigation";

function LogoMark() {
  return (
    <span className="relative inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-violet-500 text-lg font-semibold text-white shadow-[0_18px_45px_rgba(249,115,22,0.35)]">
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.28),transparent_50%)]" />
      <span className="relative">M</span>
    </span>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative isolate z-10 border-t border-white/10 bg-[#000000]"
      style={{ backgroundColor: "#000000" }}
    >
      <div className="mx-auto grid w-full max-w-[1560px] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:px-8">
        <SectionLink href="#home" className="flex items-center gap-3">
          <LogoMark />
          <span className="min-w-0">
            <span className="block truncate text-2xl font-semibold tracking-tight text-white">
              MenuFlow
            </span>
            <span className="block truncate text-sm uppercase tracking-[0.26em] text-orange-300">
              Smart Menus Faster Service
            </span>
          </span>
        </SectionLink>

        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center justify-start gap-x-6 gap-y-3 text-sm font-medium lg:justify-center"
        >
          {footerNavLinks.map((link) => (
            <SectionLink
              key={link.label}
              href={link.href}
              className="text-zinc-300 transition-colors duration-300 hover:text-orange-400"
            >
              {link.label}
            </SectionLink>
          ))}
        </nav>

        <p className="text-sm text-zinc-400 lg:text-right">
          &copy; {year} MenuFlow
        </p>
      </div>
    </footer>
  );
}
