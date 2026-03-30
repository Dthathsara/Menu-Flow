import { FeaturesSection } from "@/components/FeaturesSection";
import { HeroSection } from "@/components/HeroSection";
import { Navbar } from "@/components/Navbar";

export default function Home() {
  return (
    <div className="relative isolate min-h-screen overflow-x-clip">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[1] overflow-hidden"
      >
        <div
          className="absolute left-[-10rem] top-[3.5rem] h-[30rem] w-[30rem] rounded-full blur-[132px]"
          style={{ background: "var(--glow-left)" }}
        />
        <div
          className="absolute right-[-10rem] top-[4.5rem] h-[31rem] w-[31rem] rounded-full blur-[146px]"
          style={{ background: "var(--glow-right)" }}
        />
      </div>

      <div className="relative z-10">
        <Navbar />

        <main className="relative isolate overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
          >
            <div className="absolute inset-0 [background-image:var(--page-gradient)]" />
            <div className="absolute inset-0 [background-image:var(--grid-pattern)] [background-size:40px_40px]" />
            <div className="absolute inset-x-0 top-0 h-36 [background-image:var(--top-wash)]" />
          </div>

          <div className="relative z-10">
            <HeroSection />
            <FeaturesSection />
          </div>
        </main>
      </div>
    </div>
  );
}
