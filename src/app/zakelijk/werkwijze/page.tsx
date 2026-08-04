import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { CTASection } from "@/components/CTASection";

export const metadata: Metadata = {
  alternates: { canonical: "/zakelijk/werkwijze" },
  title: "Projectproces — van opname tot levering op locatie",
  description:
    "Hoe een projectlevering bij ons verloopt: aanvraag, opname, calculatie, productie en levering op locatie. Met de doorlooptijd per fase en wie waarvoor verantwoordelijk is.",
  keywords: [
    "projectlevering kozijnen",
    "kozijnen aannemer proces",
    "levertijd kunststof kozijnen project",
    "opname kozijnen",
  ],
};

// LET OP: alleen de levertijd van vier weken is een vastgelegde toezegging
// (staat zo in de FAQ). Voor de fases daarvoor is bewust geen doorlooptijd
// opgenomen — die zijn nergens afgesproken en horen niet als belofte op de
// site te staan. Zodra Nick ze bevestigt kunnen ze hier in het `duur`-veld.
const fases = [
  {
    fase: "01",
    titel: "Aanvraag",
    duur: "Uw opgave is het startpunt",
    body: "U stuurt de gevelopeningen, een bestek of een tekening. Voor een eerste indicatie is een lijst met aantallen en globale maten al genoeg — een volledige uitwerking is in dit stadium niet nodig.",
    levert: ["Prijsindicatie op basis van uw opgave", "Advies over het passende profielsysteem"],
  },
  {
    fase: "02",
    titel: "Opname op locatie",
    duur: "Wij meten zelf in",
    body: "Wij nemen zelf op. Dat is geen formaliteit: de maatvoering die wij vastleggen is de maatvoering waarop geproduceerd wordt, en daarmee ligt de verantwoordelijkheid voor de maat bij ons in plaats van bij uw tekening.",
    levert: ["Opnameverslag met maatvoering per element", "Vaststelling van aansluitdetails"],
  },
  {
    fase: "03",
    titel: "Calculatie en offerte",
    duur: "Vaste projectprijs",
    body: "U krijgt een projectofferte met de prijs per element en het totaal. Dit is de prijs die op de factuur terugkomt — er volgt geen tussentijdse indexering en geen toeslag achteraf.",
    levert: ["Prijs per element en totaalprijs", "Opgave van het toegepaste profielsysteem"],
  },
  {
    fase: "04",
    titel: "Opdracht en productie",
    duur: "4 weken na opname",
    body: "Bij opdrachtbevestiging leggen wij de leverdatum vast. Onze standaard levertijd is vier weken na opname, tegen een marktgemiddelde van acht tot twaalf weken.",
    levert: ["Bevestigde leverdatum", "Productie op de opgenomen maatvoering"],
  },
  {
    fase: "05",
    titel: "Levering op locatie",
    duur: "Op de bevestigde datum",
    body: "Wij leveren door heel Nederland, op de afgesproken datum en op het afgesproken adres. Bij een gefaseerd project leveren wij per bouwdeel, zodat u niet de hele partij hoeft op te slaan.",
    levert: ["Levering op locatie", "Levering op afroep per bouwdeel bij fasering"],
  },
];

const verantwoordelijkheid = [
  { wie: "Wij", wat: "Opname en maatvoering" },
  { wie: "Wij", wat: "Productie conform de opgenomen maten" },
  { wie: "Wij", wat: "Levering op de bevestigde datum" },
  { wie: "Wij", wat: "Garantie op profiel, beslag en plaatsing" },
  { wie: "U", wat: "Bereikbaarheid van de locatie op de leverdatum" },
  { wie: "U", wat: "Lossen en opslag na levering, tenzij anders afgesproken" },
];

export default function WerkwijzePage() {
  return (
    <>
      <PageHero
        eyebrow="Projectproces"
        title="Van eerste aanvraag tot levering op locatie."
        description="Vijf fases, met per fase wat u krijgt en hoe lang het duurt. Zodat u weet waar u aan toe bent voordat u belt — en zodat de kozijnpost geen open eind is in uw planning."
        image="/images/showcase-leveringen-6.webp"
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Zakelijk", href: "/zakelijk" },
          { label: "Werkwijze", href: "/zakelijk/werkwijze" },
        ]}
      />

      {/* ---- Fases ---- */}
      <section className="border-b border-ink/10 bg-paper">
        <div className="container-rebu py-16 md:py-24">
          <span className="eyebrow">Stap voor stap</span>
          <h2 className="mt-5 max-w-2xl font-display text-3xl font-medium leading-tight text-ink md:text-4xl">
            De vijf fases van een projectlevering
          </h2>

          <div className="mt-14 space-y-px bg-ink/10">
            {fases.map((f) => (
              <div key={f.fase} className="grid gap-6 bg-paper py-8 md:grid-cols-12 md:gap-10">
                <div className="md:col-span-2">
                  <span className="font-display text-4xl text-rebu-green/30">{f.fase}</span>
                </div>
                <div className="md:col-span-6">
                  <h3 className="font-display text-xl font-medium text-ink">{f.titel}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">{f.body}</p>
                </div>
                <div className="md:col-span-4">
                  <span className="text-xs uppercase tracking-[0.16em] text-rebu-green">
                    {f.duur}
                  </span>
                  <ul className="mt-4 space-y-2">
                    {f.levert.map((l) => (
                      <li key={l} className="flex items-start gap-2 text-sm text-ink-soft">
                        <Check className="mt-0.5 h-4 w-4 flex-none text-rebu-green" />
                        {l}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Wie doet wat ---- */}
      <section className="bg-rebu-cream">
        <div className="container-rebu py-16 md:py-24">
          <div className="grid gap-14 md:grid-cols-12">
            <div className="md:col-span-5">
              <span className="eyebrow">Verantwoordelijkheid</span>
              <h2 className="mt-5 font-display text-3xl font-medium leading-tight text-ink md:text-4xl">
                Wie doet wat
              </h2>
              <p className="mt-5 text-base leading-relaxed text-ink-soft">
                De meeste discussies op een bouwplaats gaan niet over de kwaliteit maar over de
                verdeling. Daarom leggen wij vooraf vast waar de grens ligt.
              </p>
            </div>
            <div className="md:col-span-7">
              <dl className="divide-y divide-ink/10 border-y border-ink/10">
                {verantwoordelijkheid.map((v) => (
                  <div key={v.wat} className="flex items-baseline gap-6 py-4">
                    <dt
                      className={`w-10 flex-none text-xs font-semibold uppercase tracking-[0.16em] ${
                        v.wie === "Wij" ? "text-rebu-green" : "text-ink-soft"
                      }`}
                    >
                      {v.wie}
                    </dt>
                    <dd className="text-sm text-ink-soft">{v.wat}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Doorverwijzing ---- */}
      <section className="border-y border-ink/10 bg-paper">
        <div className="container-rebu py-16 md:py-24">
          <div className="grid gap-8 md:grid-cols-2">
            <Link
              href="/zakelijk/voorwaarden"
              className="group border border-ink/10 p-8 transition-colors hover:border-rebu-green/40"
            >
              <span className="eyebrow">Condities</span>
              <h3 className="mt-4 font-display text-xl font-medium text-ink">
                Garantie, certificering en voorwaarden
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                Welke garantietermijnen gelden, welke certificering wij standaard leveren en wat u
                verder mag verwachten.
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-rebu-green">
                Bekijk de voorwaarden
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>

            <Link
              href="/projecten"
              className="group border border-ink/10 p-8 transition-colors hover:border-rebu-green/40"
            >
              <span className="eyebrow">Referenties</span>
              <h3 className="mt-4 font-display text-xl font-medium text-ink">
                Projecten die wij hebben geleverd
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                Uitgevoerde projecten met foto&apos;s, toegepaste producten en locatie.
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-rebu-green">
                Bekijk de projecten
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
