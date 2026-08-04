import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Check, ArrowRight, Home, PiggyBank, Globe2 } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { ProductGrid } from "@/components/ProductGrid";
import { Workflow } from "@/components/Workflow";
import { CTASection } from "@/components/CTASection";

export const metadata: Metadata = {
  alternates: { canonical: "/particulier" },
  title: "Kunststof kozijnen voor particulieren",
  description:
    "Voor particulieren levert Kunststofkozijnnodig.nl hoogwaardige kunststof kozijnen, deuren en schuifpuien op maat. Inclusief advies, inmeten, plaatsen en financiering.",
};

const benefits = [
  { icon: Home, title: "Comfortabeler wonen", body: "Betere isolatie, minder geluid van buiten, minder tocht." },
  { icon: PiggyBank, title: "Lagere energierekening", body: "HR++ of triple glas — fors minder warmteverlies." },
  { icon: Globe2, title: "Onderhoudsvrij", body: "Geen schilderwerk meer, 30+ jaar zorgeloos wonen." },
];

export default function ParticulierPage() {
  return (
    <>
      <PageHero
        eyebrow="Voor particulieren"
        title="Jouw huis comfortabeler, mooier en energiezuiniger."
        description="Of het nu gaat om het upgraden van je deuren, het vervangen van kozijnen of het toevoegen van schuifpuien — wij bieden innovatieve en duurzame producten die comfort en stijl omarmen."
        image="/images/project-zaandam-2.jpg"
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Particulier", href: "/particulier" },
        ]}
      />

      <section className="section bg-paper">
        <div className="container-rebu grid items-center gap-14 lg:grid-cols-2">
          <div>
            <span className="section-eyebrow">Particuliere oplossingen</span>
            <h2 className="section-title mt-3">
              De perfecte balans tussen <span className="italic text-rebu-green">stijl en functionaliteit.</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-ink-soft">
              Kunststof kozijnen zijn populair vanwege hun duurzaamheid, onderhoudsvriendelijkheid en uitstekende isolatie-eigenschappen. Kunststofkozijnnodig.nl is gespecialiseerd in het plaatsen en vervangen van kunststof kozijnen, deuren en schuifpuien van hoogwaardige kwaliteit.
            </p>

            <div className="mt-10 grid gap-5 sm:grid-cols-3">
              {benefits.map((b) => (
                <div key={b.title} className="border border-ink/10 bg-rebu-cream p-5">
                  <div className="flex h-10 w-10 items-center justify-center bg-rebu-green/10 text-rebu-green">
                    <b.icon className="h-5 w-5" />
                  </div>
                  <p className="mt-3 font-display text-lg font-medium text-ink">{b.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">{b.body}</p>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <Link href="/offerte" className="btn-primary">
                Gratis offerte aanvragen <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden border border-ink/10">
            <Image
              src="/images/project-latten-5.webp"
              alt="Particulier project"
              width={900}
              height={1100}
              className="h-[560px] w-full object-cover"
            />
          </div>
        </div>
      </section>

      <ProductGrid />
      <Workflow />

      <section className="section border-t border-ink/10 bg-rebu-cream">
        <div className="container-rebu grid items-center gap-14 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <span className="section-eyebrow">Financieren</span>
            <h2 className="section-title mt-3">
              Betaal je kunststof kozijnen <span className="italic text-rebu-green">in termijnen.</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-ink-soft">
              Goed nieuws voor particulieren! Bij ons kun je nu ook je kunststof kozijnen in termijnen aflossen. De rente is fiscaal aftrekbaar en je kunt boetevrij aflossen — zo maken we hoogwaardige kwaliteit haalbaar en betaalbaar voor iedereen.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-ink-soft">
              {[
                "Rente fiscaal aftrekbaar",
                "Boetevrij aflossen",
                "Transparante voorwaarden",
                "Geen verrassingen",
              ].map((i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center bg-rebu-green/10 text-rebu-green">
                    <Check className="h-3 w-3" />
                  </span>
                  {i}
                </li>
              ))}
            </ul>
            <Link href="/contact" className="mt-8 btn-secondary">
              Bekijk mogelijkheden
            </Link>
          </div>
          <div className="order-1 overflow-hidden border border-ink/10 lg:order-2">
            <Image
              src="/images/villa-kozijn.jpg"
              alt="Kunststof kozijnen villa"
              width={900}
              height={700}
              className="h-[460px] w-full object-cover"
            />
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
