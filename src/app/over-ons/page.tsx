import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { AboutIntro } from "@/components/AboutIntro";
import { Workflow } from "@/components/Workflow";
import { CTASection } from "@/components/CTASection";

export const metadata: Metadata = {
  title: "Over ons",
  description: "Leer Kunststofkozijnnodig.nl kennen: een jong en gedreven team specialisten in kunststof kozijnen, deuren en schuifpuien uit Wormerveer.",
};

export default function OverOnsPage() {
  return (
    <>
      <PageHero
        eyebrow="Over ons"
        title="Jong team, ouderwets vakmanschap."
        description="Wij zijn een kleinschalig bedrijf met grote ambities. Vanuit Wormerveer leveren en plaatsen we kozijnen door heel Nederland."
        image="/images/showcase-leveringen-3.webp"
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Over ons", href: "/over-ons" },
        ]}
      />
      <AboutIntro />
      <Workflow />
      <CTASection />
    </>
  );
}
