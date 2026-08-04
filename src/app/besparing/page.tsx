import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { SavingsCalculator } from "@/components/SavingsCalculator";
import { CTASection } from "@/components/CTASection";

export const metadata: Metadata = {
  alternates: { canonical: "/besparing" },
  title: "Energiebesparing berekenen — hoeveel bespaar je?",
  description:
    "Bereken hoeveel je bespaart op energiekosten met nieuwe kunststof kozijnen. Inclusief ISDE-subsidie berekening. Gratis en vrijblijvend.",
  keywords: [
    "energiebesparing kozijnen",
    "besparing kunststof kozijnen",
    "ISDE subsidie kozijnen",
    "kozijnen terugverdientijd",
  ],
};

export default function BesparingPage() {
  return (
    <>
      <PageHero
        eyebrow="Besparing"
        title="Energiebesparing."
        description="Ontdek hoeveel je kunt besparen op energiekosten door te investeren in nieuwe kozijnen met hoogwaardig glas."
        image="/images/villa-kozijn.jpg"
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Besparing", href: "/besparing" },
        ]}
      />
      <SavingsCalculator />
      <CTASection />
    </>
  );
}
