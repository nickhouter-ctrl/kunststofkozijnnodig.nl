import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, Euro, Info, ChevronRight } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { CTASection } from "@/components/CTASection";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Prijzen kunststof kozijnen 2026 — wat kost het?",
  description:
    "Wat kosten kunststof kozijnen in 2026? Prijsoverzicht per m² inclusief montage. Kozijnen vanaf €750/m², deuren vanaf €3.500, schuifpuien vanaf €6.000. Gratis offerte.",
  keywords: [
    "kunststof kozijnen prijs 2026",
    "wat kosten kunststof kozijnen",
    "kozijnen prijs per m2",
    "schuifpui prijs",
    "kunststof voordeur prijs",
    "kozijnen inclusief montage kosten",
  ],
};

const pricing = [
  {
    product: "Kunststof kozijn",
    unit: "per m²",
    from: "€ 750",
    to: "€ 1.050",
    includes: "HR++ glas, montage, afwerking, afvoer oud kozijn",
    note: "Prijs afhankelijk van profiel, kleur en glastype",
  },
  {
    product: "Kunststof voordeur",
    unit: "compleet",
    from: "€ 3.500",
    to: "€ 7.500",
    includes: "Deurpaneel, kozijn, 3-puntssluiting, cilinder, montage",
    note: "Afhankelijk van model, glas en hardware",
  },
  {
    product: "Kunststof achterdeur",
    unit: "compleet",
    from: "€ 2.800",
    to: "€ 5.000",
    includes: "Deurpaneel, kozijn, beslag, montage",
    note: "Afhankelijk van afmeting en glastype",
  },
  {
    product: "Schuifpui 2-delig (3m)",
    unit: "compleet",
    from: "€ 6.000",
    to: "€ 8.500",
    includes: "Kunststof profiel, HR++ glas, rail, montage",
    note: "Prijs bij standaard afmeting ~300×220cm",
  },
  {
    product: "Schuifpui 3-delig (4,5m)",
    unit: "compleet",
    from: "€ 9.000",
    to: "€ 12.500",
    includes: "Kunststof profiel, HR++ glas, rail, montage",
    note: "Prijs bij standaard afmeting ~450×220cm",
  },
  {
    product: "Hefschuifpui",
    unit: "compleet",
    from: "€ 10.000",
    to: "€ 16.000",
    includes: "Premium profiel, hefmechanisme, HR++ of triple, montage",
    note: "Topsegment — soepelste bediening",
  },
];

const factors = [
  { title: "Profielkeuze", desc: "Schüco, Aluplast of Gealan — elk merk heeft eigen prijsklassen en eigenschappen." },
  { title: "Kleur", desc: "Wit is standaard. Antraciet, zwart, houtlook of RAL-kleur kost circa 10-20% extra." },
  { title: "Glastype", desc: "HR++ is standaard. Triple glas (+€50-80/m²) of inbraakwerend glas (+€30-60/m²) op aanvraag." },
  { title: "Openingstype", desc: "Vastglas is goedkoopst. Draaikiep, valraam en uitzetramen kosten meer door beslag." },
  { title: "Aantal", desc: "Meer kozijnen = lager stuksprijs. Bij 10+ kozijnen krijg je bij ons scherpe staffelkorting." },
  { title: "Montage", desc: "Alleen leveren scheelt gemiddeld €150-250 per kozijn. Wij adviseren montage door ons team." },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Prijzen kunststof kozijnen 2026",
  description: "Actueel prijsoverzicht voor kunststof kozijnen, deuren en schuifpuien inclusief montage.",
  provider: {
    "@type": "LocalBusiness",
    name: site.name,
    telephone: site.phone,
  },
};

export default function PrijzenPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHero
        eyebrow="Prijzen 2026"
        title="Wat kosten kunststof kozijnen?"
        description="Transparante prijzen, geen verrassingen. Hieronder vind je actuele richtprijzen inclusief montage. Vraag een gratis offerte op maat aan voor jouw exacte situatie."
        image="/images/kleur-rebu.jpg"
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Prijzen", href: "/prijzen" },
        ]}
      />

      {/* Price table */}
      <section className="section bg-white">
        <div className="container-rebu">
          <div className="mx-auto max-w-4xl">
            <span className="section-eyebrow">Prijsoverzicht</span>
            <h2 className="section-title mt-3">
              Richtprijzen <span className="italic text-rebu-green">inclusief montage</span>
            </h2>
            <p className="mt-4 text-neutral-600">
              Onderstaande prijzen zijn inclusief BTW, montage, afwerking en afvoer van oude kozijnen. De exacte prijs hangt af van jouw specifieke situatie — vraag altijd een offerte op maat.
            </p>

            <div className="mt-10 space-y-4">
              {pricing.map((p) => (
                <div
                  key={p.product}
                  className="rounded-2xl border border-rebu-stone bg-rebu-cream p-6 transition-all hover:border-rebu-green hover:shadow-soft"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <h3 className="font-display text-xl font-semibold text-rebu-charcoal">{p.product}</h3>
                      <p className="mt-1 text-sm text-neutral-500">{p.includes}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-2xl font-semibold text-rebu-green md:text-3xl">
                        {p.from} — {p.to}
                      </p>
                      <p className="text-xs text-neutral-500">{p.unit} · {p.note}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-start gap-3 rounded-2xl bg-rebu-green/5 p-5 text-sm text-rebu-green-dark ring-1 ring-rebu-green/20">
              <Info className="mt-0.5 h-4 w-4 flex-none" />
              <div>
                <p className="font-semibold">Richtprijzen — geen vaste prijzen</p>
                <p className="mt-1 text-neutral-600">
                  Bovenstaande bedragen zijn indicatief (2026). De exacte prijs hangt af van jouw specifieke situatie, afmetingen, kleurkeuze en glastype. Wij komen gratis langs om in te meten en een offerte op maat te maken.
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link href="/offerte" className="btn-primary">
                Gratis offerte op maat <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Price factors */}
      <section className="section bg-rebu-cream">
        <div className="container-rebu">
          <div className="mx-auto max-w-3xl text-center">
            <span className="section-eyebrow">Prijsbepalende factoren</span>
            <h2 className="section-title mt-3">
              Waar hangt de prijs <span className="italic text-rebu-green">van af?</span>
            </h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {factors.map((f) => (
              <div key={f.title} className="card">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rebu-green/10 text-rebu-green">
                  <Euro className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-rebu-charcoal">{f.title}</h3>
                <p className="mt-2 text-sm text-neutral-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subsidie */}
      <section className="section bg-white">
        <div className="container-rebu grid gap-14 lg:grid-cols-2">
          <div>
            <span className="section-eyebrow">Subsidie 2026</span>
            <h2 className="section-title mt-3">
              ISDE subsidie op <span className="italic text-rebu-green">kozijnen & glas</span>
            </h2>
            <p className="mt-6 text-lg text-neutral-600">
              In 2026 kun je via de ISDE-regeling (Investeringssubsidie Duurzame Energie) subsidie krijgen op energiebesparende maatregelen, waaronder het plaatsen van isolerend glas. De subsidie bedraagt circa €41 per m² glas.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-neutral-700">
              {[
                "Geldig voor HR++ en triple glas in bestaande woningen",
                "Subsidie maximaal voor 45 m² glasoppervlak",
                "Aanvragen via de RVO na plaatsing",
                "Wij helpen je graag met de aanvraag",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-rebu-green/10 text-rebu-green">
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
          <div className="overflow-hidden rounded-3xl shadow-soft">
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
