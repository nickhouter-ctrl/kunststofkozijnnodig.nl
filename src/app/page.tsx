import { Hero } from "@/components/Hero";
import { BrandMarquee } from "@/components/BrandMarquee";
import { ProductGrid } from "@/components/ProductGrid";
import { AboutIntro } from "@/components/AboutIntro";
import { Workflow } from "@/components/Workflow";
import { EnergySavingsCalc } from "@/components/EnergySavingsCalc";
import { ProjectsShowcase } from "@/components/ProjectsShowcase";
import { ProjectsMarquee } from "@/components/ProjectsMarquee";
import { TrustBadges } from "@/components/TrustBadges";
import { CTASection } from "@/components/CTASection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <BrandMarquee />
      <ProductGrid />
      <AboutIntro />
      <Workflow />
      <EnergySavingsCalc />
      <ProjectsShowcase />
      <ProjectsMarquee />
      <TrustBadges />
      <CTASection />
    </>
  );
}
