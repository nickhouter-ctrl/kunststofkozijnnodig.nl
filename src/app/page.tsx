import { Hero } from "@/components/Hero";
import { BrandMarquee } from "@/components/BrandMarquee";
import { ProductGrid } from "@/components/ProductGrid";
import { AboutIntro } from "@/components/AboutIntro";
import { Workflow } from "@/components/Workflow";
import { ProjectsShowcase } from "@/components/ProjectsShowcase";
import { ProjectsMarquee } from "@/components/ProjectsMarquee";
import { InstagramReels } from "@/components/InstagramReels";
import { Reviews } from "@/components/Reviews";
import { CTASection } from "@/components/CTASection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <BrandMarquee />
      <ProductGrid />
      <AboutIntro />
      <Workflow />
      <ProjectsShowcase />
      <ProjectsMarquee />
      <InstagramReels />
      <Reviews />
      <CTASection />
    </>
  );
}
