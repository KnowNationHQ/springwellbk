import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/sections/hero";
import { FeaturesSection } from "@/components/sections/features";
import { PromosSection } from "@/components/sections/promos";
import { ServicesSection } from "@/components/sections/services";
import { RatesSection } from "@/components/sections/rates";
import { AboutSection } from "@/components/sections/about";
import { ContactSection } from "@/components/sections/contact";
import { CTASection } from "@/components/sections/cta";
import { WhyBankSection } from "@/components/sections/why";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <PromosSection />
        <RatesSection />
        <ServicesSection />
        <AboutSection />
        <WhyBankSection />
        <CTASection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
