import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Building2, HardHat, Hammer, Users, ArrowRight, Check } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { BrandMarquee } from "@/components/BrandMarquee";
import { CTASection } from "@/components/CTASection";

export const metadata: Metadata = {
  alternates: { canonical: "/zakelijk" },
  title: "Zakelijk — kozijnen voor aannemers, bouwbedrijven & VvE",
  description:
    "Kunststofkozijnnodig.nl is dé partner voor aannemers, architecten, bouwbedrijven, VvE en vastgoedbeheerders. Maatwerk kozijnen, korte lijnen en gratis leads.",
};

const audiences = [
  { icon: HardHat, title: "Aannemers", body: "Korte lijnen, maatwerk en gratis leads voor partners die bij Kunststofkozijnnodig.nl afnemen." },
  { icon: Building2, title: "Architecten", body: "Technische ondersteuning bij bestekken en detailleringen — wij denken mee." },
  { icon: Hammer, title: "Bouwbedrijven", body: "Voor nieuwbouw én renovatie: levering op afroep, planning afgestemd op jouw project." },
  { icon: Users, title: "VvE & Vastgoedbeheer", body: "Grotere projecten efficiënt en zorgvuldig uitgevoerd, met transparante rapportage." },
];

export default function ZakelijkPage() {
  return (
    <>
      <PageHero
        eyebrow="Voor de vakman"
        title="Kunststofkozijnnodig.nl maken het verschil. Voor en door de vakman."
        description="Wij zijn Kunststofkozijnnodig.nl: kleinschalig maar groots in wat we doen. Voor zakelijke afnemers leveren we maatwerk kozijnen met vakmanschap, korte lijnen en advies dat écht meedenkt met jouw project."
        image="/images/project-zaandam-4.jpg"
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Zakelijk", href: "/zakelijk" },
        ]}
      />

      <BrandMarquee />

      <section className="section bg-paper">
        <div className="container-rebu">
          <div className="mx-auto max-w-3xl text-center">
            <span className="section-eyebrow justify-center">Wie wij helpen</span>
            <h2 className="section-title mt-3">
              Eén partij voor <span className="italic text-rebu-green">elk zakelijk project.</span>
            </h2>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {audiences.map((a) => (
              <div key={a.title} className="card">
                <div className="flex h-12 w-12 items-center justify-center bg-rebu-green/10 text-rebu-green">
                  <a.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-xl font-medium text-ink">{a.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section border-t border-ink/10 bg-rebu-cream">
        <div className="container-rebu grid items-center gap-14 lg:grid-cols-2">
          <div className="overflow-hidden border border-ink/10">
            <Image
              src="/images/showcase-leveringen-3.webp"
              alt="Zakelijk project"
              width={900}
              height={700}
              className="h-[460px] w-full object-cover"
            />
          </div>
          <div>
            <span className="section-eyebrow">Gratis leads</span>
            <h2 className="section-title mt-3">
              Afnemen bij Kunststofkozijnnodig.nl? <span className="italic text-rebu-green">Krijg leads cadeau.</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-ink-soft">
              Partners die hun kozijnen bij Kunststofkozijnnodig.nl afnemen krijgen van ons gratis klantleads in hun werkgebied. Zo groei je samen met ons, zonder extra marketingkosten.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-ink-soft">
              {[
                "Gratis klantleads voor partners",
                "Eigen merken: Schüco, Aluplast, Gealan",
                "Maatwerk binnen 4 weken",
                "Persoonlijke accountmanager",
              ].map((i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center bg-rebu-green/10 text-rebu-green">
                    <Check className="h-3 w-3" />
                  </span>
                  {i}
                </li>
              ))}
            </ul>
            <Link href="/offerte" className="mt-10 btn-primary">
              Start zakelijke offerte <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
