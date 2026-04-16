import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { ProductGrid } from "@/components/ProductGrid";
import { BrandMarquee } from "@/components/BrandMarquee";
import { CTASection } from "@/components/CTASection";

export const metadata: Metadata = {
  title: "Producten — kozijnen, deuren en schuifpuien",
  description: "Ontdek het complete productassortiment van Rebu Kozijnen: kunststof kozijnen, deuren en schuifpuien in elke stijl en kleur.",
};

export default function ProductenPage() {
  return (
    <>
      <PageHero
        eyebrow="Productassortiment"
        title="Alles in huis voor een complete gevel."
        description="Van draaikiepramen en vastglas tot voordeuren en hefschuifpuien — wij leveren het hele plaatje, in elk gewenste kleur en profiel."
        image="/images/project-latten-4.webp"
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Producten", href: "/producten" },
        ]}
      />
      <ProductGrid />
      <BrandMarquee />
      <CTASection />
    </>
  );
}
