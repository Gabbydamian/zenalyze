import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { KeyInputsSection } from "@/components/landing/key-inputs-section";
import { AIInsightSection } from "@/components/landing/ai-insight-section";
import { DashboardSection } from "@/components/landing/dashboard-section";
import { WhySection } from "@/components/landing/why-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { FAQSection } from "@/components/landing/faq-section";
import { FinalCTASection } from "@/components/landing/final-cta-section";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <>
      <Navbar />
        <HeroSection />
        <KeyInputsSection />
        <AIInsightSection />
        <DashboardSection />
        <WhySection />
        <TestimonialsSection />
        <PricingSection />
        <FAQSection />
        <FinalCTASection />
      <Footer />
    </>
  );
}
