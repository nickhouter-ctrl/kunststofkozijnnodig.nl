import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, Euro, ShieldCheck, Truck, Clock, BadgePercent, Wrench } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { BrandMarquee } from "@/components/BrandMarquee";
import { CTASection } from "@/components/CTASection";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Prijzen kunststof kozijnen 2026 — altijd de scherpste prijs",
  description:
    "Kunststof kozijnen tegen altijd de scherpste prijs. Rechtstreeks van de fabriek, geen tussenpersonen. Vraag gratis en vrijblijvend een offerte op maat aan.",
  keywords: [
    "kunststof kozijnen prijs",
    "goedkope kunststof kozijnen",
    "kozijnen scherpe prijs",
    "kozijnen rechtstreeks fabriek",
    "kunststof kozijnen offerte",
  ],
};

const reasons = [
  {
    icon: BadgePercent,
    title: "Altijd de scherpste prijs",
    body: "Wij hanteren altijd de beste prijzen in de markt. Geen opslag, geen verborgen kosten — je betaalt een eerlijke prijs voor topkwaliteit.",
  },
  {
    icon: Truck,
    title: "Rechtstreeks van de fabriek",
    body: "Geen tussenpersonen of importeurs. Wij leveren rechtstreeks vanuit de fabriek, waardoor we scherper kunnen leveren dan de meeste concurrenten.",
  },
  {
    icon: Euro,
    title: "Staffelkorting bij grotere aantallen",
    body: "Hoe meer kozijnen je afneemt, hoe scherper de prijs per stuk. Ideaal voor aannemers, bouwbedrijven en VvE's.",
  },
  {
    icon: ShieldCheck,
    title: "Kwaliteit zonder compromis",
    body: "Scherpe prijs betekent bij ons niet minder kwaliteit. Wij werken uitsluitend met Europese topmerken: Schüco, Aluplast en Gealan.",
  },
  {
    icon: Clock,
    title: "Binnen 4 weken geleverd",
    body: "Snelle levering dankzij korte lijnen met de fabriek. Waar anderen maanden wachten, staan jouw kozijnen er binnen 4 weken.",
  },
  {
    icon: Wrench,
    title: "Plaatsing mogelijk via onze aannemers",
    body: "Geen eigen aannemer? Geen probleem. Wij koppelen je aan een van onze aangesloten, ervaren monteurs die de plaatsing voor je verzorgen.",
  },
];

const factors = [
  { title: "Profielkeuze", desc: "Schüco, Aluplast of Gealan — elk merk heeft eigen prijsklassen en eigenschappen." },
  { title: "Kleur", desc: "Wit is standaard. Antraciet, zwart, houtlook of RAL-kleur op maat beschikbaar." },
  { title: "Glastype", desc: "HR++ is standaard. Triple glas of inbraakwerend glas op aanvraag." },
  { title: "Openingstype", desc: "Vastglas is het voordeligst. Draaikiep, valraam en uitzetramen variëren in prijs." },
  { title: "Aantal", desc: "Meer kozijnen = lagere stuksprijs. Vraag naar onze staffelkorting bij 10+ stuks." },
  { title: "Afmetingen", desc: "Elk kozijn wordt op maat gemaakt. De exacte prijs hangt af van breedte × hoogte." },
];

export default function PrijzenPage() {
  return (
    <>
      <PageHero
        eyebrow="Onze prijzen"
        title="Altijd de scherpste prijs. Gegarandeerd."
        description="Wij geloven dat topkwaliteit kozijnen betaalbaar moeten zijn. Daarom leveren wij rechtstreeks van de fabriek — zonder tussenpersonen, zonder opslag. Vraag een offerte aan en ontdek het verschil."
        image="/images/villa-kozijn.jpg"
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Prijzen", href: "/prijzen" },
        ]}
      />

      {/* Why our prices are the best */}
      <section className="section bg-paper">
        <div className="container-rebu">
          <div className="mx-auto max-w-3xl text-center">
            <span className="section-eyebrow justify-center">Waarom wij</span>
            <h2 className="section-title mt-3">
              Hoe wij de <span className="italic text-rebu-green">beste prijs</span> garanderen
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft">
              Elke offerte is maatwerk. De prijs hangt af van het type kozijn, de afmetingen, het profiel en de kleur. Maar één ding is zeker: bij ons krijg je altijd de scherpste deal.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reasons.map((r) => (
              <div key={r.title} className="card">
                <div className="flex h-12 w-12 items-center justify-center bg-rebu-green/10 text-rebu-green">
                  <r.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-xl font-medium text-ink">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{r.body}</p>
              </div>
            ))}

            {/* CTA card */}
            <div className="flex flex-col items-start justify-center bg-rebu-green-dark p-8 text-white">
              <span className="eyebrow is-light">Jouw prijs</span>
              <h3 className="mt-4 font-display text-2xl font-medium">Benieuwd naar jouw prijs?</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                Vul de offerte-configurator in en ontvang binnen 1 werkdag een prijs op maat.
              </p>
              <Link href="/offerte" className="btn-light mt-6">
                Offerte aanvragen <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Price factors */}
      <section className="section border-t border-ink/10 bg-rebu-cream">
        <div className="container-rebu">
          <div className="mx-auto max-w-3xl text-center">
            <span className="section-eyebrow justify-center">Prijsbepalende factoren</span>
            <h2 className="section-title mt-3">
              Waar hangt de prijs <span className="italic text-rebu-green">van af?</span>
            </h2>
            <p className="mt-5 leading-relaxed text-ink-soft">
              Elke situatie is anders. Hieronder de factoren die de prijs van jouw kozijnen bepalen.
            </p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {factors.map((f) => (
              <div key={f.title} className="card">
                <div className="flex h-10 w-10 items-center justify-center bg-rebu-green/10 text-rebu-green">
                  <Euro className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-medium text-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BrandMarquee />

      {/* Subsidie */}
      <section className="section bg-paper">
        <div className="container-rebu grid gap-14 lg:grid-cols-2">
          <div>
            <span className="section-eyebrow">Subsidie 2026</span>
            <h2 className="section-title mt-3">
              ISDE subsidie op <span className="italic text-rebu-green">kozijnen & glas</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-ink-soft">
              In 2026 kun je via de ISDE-regeling subsidie krijgen op energiebesparende maatregelen, waaronder het plaatsen van isolerend glas. De subsidie bedraagt circa €41 per m² glas.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-ink-soft">
              {[
                "Geldig voor HR++ en triple glas in bestaande woningen",
                "Subsidie maximaal voor 45 m² glasoppervlak",
                "Aanvragen via de RVO na plaatsing",
                "Wij helpen je graag met de aanvraag",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center bg-rebu-green/10 text-rebu-green">
                    <Check className="h-3 w-3" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/offerte" className="mt-8 btn-secondary">
              Bereken jouw besparing <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="overflow-hidden border border-ink/10">
            <Image
              src="/images/villa-kozijn.jpg"
              alt="Villa met energiezuinige kozijnen"
              width={800}
              height={600}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
