import { BenefitsSection } from "@/components/BenefitsSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { HeroSection } from "@/components/HeroSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { Navbar } from "@/components/Navbar";
import { PricingSection } from "@/components/PricingSection";
import { SolutionsSection } from "@/components/SolutionsSection";

export default function Home() {
  return (
    <div className="relative min-h-screen">
      <Navbar />

      <main className="relative">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <BenefitsSection />
        <SolutionsSection />
        <PricingSection />
      </main>
    </div>
  );
}
