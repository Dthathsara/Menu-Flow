import { BenefitsSection } from "@/components/homepage/BenefitsSection";
import { ContactSection } from "@/components/homepage/ContactSection";
import { FeaturesSection } from "@/components/homepage/FeaturesSection";
import { Footer } from "@/components/homepage/Footer";
import { FAQSection } from "@/components/homepage/FAQSection";
import { HeroSection } from "@/components/homepage/HeroSection";
import { HowItWorksSection } from "@/components/homepage/HowItWorksSection";
import { Navbar } from "@/components/homepage/Navbar";
import { PricingSection } from "@/components/homepage/PricingSection";
import { SolutionsSection } from "@/components/homepage/SolutionsSection";
import { TestimonialsSection } from "@/components/homepage/TestimonialsSection";

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
