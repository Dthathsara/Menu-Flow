import { BenefitsSection } from "@/components/home-page/BenefitsSection";
import { ContactSection } from "@/components/home-page/ContactSection";
import { FeaturesSection } from "@/components/home-page/FeaturesSection";
import { Footer } from "@/components/home-page/Footer";
import { FAQSection } from "@/components/home-page/FAQSection";
import { HeroSection } from "@/components/home-page/HeroSection";
import { HowItWorksSection } from "@/components/home-page/HowItWorksSection";
import { Navbar } from "@/components/home-page/Navbar";
import { PricingSection } from "@/components/home-page/PricingSection";
import { SolutionsSection } from "@/components/home-page/SolutionsSection";
import { TestimonialsSection } from "@/components/home-page/TestimonialsSection";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />

      <main className="relative flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <BenefitsSection />
        <SolutionsSection />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
        <ContactSection />
      </main>

      <Footer />
    </div>
  );
}
