import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { BrandMarquee } from "@/components/BrandMarquee";
import { CTASection } from "@/components/CTASection";
import { segments } from "@/lib/segments";

export const metadata: Metadata = {
  alternates: { canonical: "/zakelijk" },
  title: "Zakelijk — projectlevering voor aannemers, VvE's en corporaties",
  description:
    "Projectlevering van kunststof kozijnen, deuren en schuifpuien. Vaste projectprijzen, levertijd van vier weken na opname en levering door heel Nederland.",
  keywords: [
    "kozijnen aannemer",
    "kozijnen projectlevering",
    "kunststof kozijnen VvE",
    "kozijnen woningcorporatie",
    "kozijnen projectontwikkelaar",
  ],
};

const pijlers = [
  {
    titel: "Vaste projectprijs",
    body: "De prijs in de offerte is de prijs op de factuur. Geen indexering tussentijds, ook niet bij een project dat over meerdere maanden loopt.",
  },
  {
    titel: "Vier weken na opname",
    body: "Onze standaard levertijd, tegen een marktgemiddelde van acht tot twaalf weken. De datum ligt vast bij de opdrachtbevestiging.",
  },
  {
    titel: "Wij nemen zelf op",
    body: "De maatvoering komt van ons en niet uit uw tekening. Daarmee ligt de verantwoordelijkheid voor de maat bij de leverancier.",
  },
  {
    titel: "Vier profielsystemen",
    body: "Wij zijn niet aan één fabrikant gebonden en kiezen het systeem dat bij de eis van uw project past.",
  },
];

export default function ZakelijkPage() {
  return (
    <>
      <PageHero
        eyebrow="Zakelijke markt"
        title="Projectlevering voor wie op planning moet kunnen rekenen."
        description="Wij leveren kunststof kozijnen, deuren en schuifpuien op projectbasis aan aannemers, VvE's, woningcorporaties en ontwikkelaars. Met een vaste prijs, een vaste leverdatum en opname door onszelf."
        image="/images/project-zaandam-4.jpg"
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Zakelijk", href: "/zakelijk" },
        ]}
      />

      {/* ---- Pijlers ---- */}
      <section className="border-b border-ink/10 bg-paper">
        <div className="container-rebu py-16 md:py-24">
          <div className="grid gap-px border border-ink/10 bg-ink/10 md:grid-cols-2 lg:grid-cols-4">
            {pijlers.map((p) => (
              <div key={p.titel} className="bg-paper p-8">
                <h3 className="font-display text-lg font-medium leading-snug text-ink">{p.titel}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Doelgroepen ---- */}
      <section className="bg-rebu-cream">
        <div className="container-rebu py-16 md:py-24">
          <span className="eyebrow">Wie wij leveren</span>
          <h2 className="mt-5 max-w-2xl font-display text-3xl font-medium leading-tight text-ink md:text-4xl">
            Elke opdrachtgever heeft een ander knelpunt
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-soft">
            Een aannemer wordt afgerekend op planning, een VvE-bestuur op het besluit en een
            corporatie op de labelstap. Daarom is er per doelgroep een aparte pagina met wat er in
            die situatie werkelijk speelt.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {segments.map((s) => (
              <Link
                key={s.slug}
                href={`/zakelijk/${s.slug}`}
                className="group flex flex-col border border-ink/10 bg-paper p-8 transition-colors hover:border-rebu-green/40"
              >
                <h3 className="font-display text-xl font-medium text-ink">{s.naam}</h3>
                <p className="mt-2 text-sm font-medium text-rebu-green">{s.kicker}</p>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-soft">
                  {s.intro.split(". ").slice(0, 2).join(". ").replace(/\.?$/, ".")}
                </p>
                <ul className="mt-6 space-y-2">
                  {s.feiten.slice(0, 3).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-ink-soft">
                      <Check className="mt-0.5 h-4 w-4 flex-none text-rebu-green" />
                      {f}
                    </li>
                  ))}
                </ul>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-rebu-green">
                  Lees verder
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <BrandMarquee />

      {/* ---- Werkwijze + voorwaarden ---- */}
      <section className="bg-paper">
        <div className="container-rebu py-16 md:py-24">
          <div className="grid gap-8 md:grid-cols-2">
            <Link
              href="/zakelijk/werkwijze"
              className="group border border-ink/10 p-8 transition-colors hover:border-rebu-green/40"
            >
              <span className="eyebrow">Projectproces</span>
              <h3 className="mt-4 font-display text-xl font-medium text-ink">
                Zo verloopt een projectlevering
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                Vijf fases van aanvraag tot levering op locatie, met per fase wat u krijgt en wie
                waarvoor verantwoordelijk is.
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-rebu-green">
                Bekijk de werkwijze
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>

            <Link
              href="/zakelijk/voorwaarden"
              className="group border border-ink/10 p-8 transition-colors hover:border-rebu-green/40"
            >
              <span className="eyebrow">Condities</span>
              <h3 className="mt-4 font-display text-xl font-medium text-ink">
                Garantie, certificering en voorwaarden
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                Tien jaar op het profiel, vijf op de plaatsing en twee op het beslag — plus wat er
                standaard aan certificering in zit.
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-rebu-green">
                Bekijk de voorwaarden
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ---- Partnerprogramma ---- */}
      <section className="border-t border-ink/10 bg-rebu-cream">
        <div className="container-rebu grid items-center gap-14 py-16 md:py-24 lg:grid-cols-2">
          <div className="overflow-hidden border border-ink/10">
            <Image
              src="/images/showcase-leveringen-3.webp"
              alt="Projectlevering op locatie"
              width={900}
              height={700}
              className="h-[460px] w-full object-cover"
            />
          </div>
          <div>
            <span className="eyebrow">Voor vaste partners</span>
            <h2 className="mt-5 font-display text-3xl font-medium leading-tight text-ink md:text-4xl">
              Neemt u structureel af? Dan krijgt u leads van ons.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-ink-soft">
              Partners die hun kozijnen bij ons afnemen krijgen particuliere aanvragen uit hun eigen
              werkgebied doorgestuurd. Wij leveren, u plaatst — zonder dat daar marketingkosten
              tegenover staan.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-ink-soft">
              {[
                "Particuliere aanvragen uit uw werkgebied",
                "Eén vast aanspreekpunt voor uw projecten",
                "Keuze uit Aluplast, Gealan, Schüco en K-Vision",
                "Levertijd van vier weken na opname",
              ].map((i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="mt-0.5 h-4 w-4 flex-none text-rebu-green" />
                  {i}
                </li>
              ))}
            </ul>
            <Link href="/offerte" className="btn btn-primary mt-10">
              Projectofferte aanvragen <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
