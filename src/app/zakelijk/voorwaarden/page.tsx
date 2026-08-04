import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck, BadgeCheck, Wrench } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { CTASection } from "@/components/CTASection";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/zakelijk/voorwaarden" },
  title: "Zakelijke voorwaarden — garantie, certificering en levering",
  description:
    "Garantietermijnen op profiel, plaatsing en beslag, de certificering die wij standaard leveren (SKG 2-ster, KOMO) en wat er geldt bij projectlevering.",
};

/**
 * Alle onderstaande waarden staan al elders op de site (FAQ, productpagina's)
 * en zijn dus eerder vastgelegd. Voeg hier geen commerciële condities toe —
 * betaaltermijnen, staffels, kredietlimieten — zolang die niet bevestigd zijn.
 */
const garantie = [
  { termijn: "10 jaar", waarop: "Fabrieksgarantie op het profiel" },
  { termijn: "5 jaar", waarop: "Garantie op onze plaatsing" },
  { termijn: "2 jaar", waarop: "Garantie op het beslag" },
];

const certificering = [
  {
    icon: ShieldCheck,
    titel: "SKG 2-ster standaard",
    body: "Wij leveren standaard SKG 2-ster gecertificeerde kozijnen. Dat voldoet aan de eisen van het Politiekeurmerk Veilig Wonen. Vraagt uw bestek om meer, dan is een upgrade naar SKG 3 mogelijk.",
  },
  {
    icon: BadgeCheck,
    titel: "KOMO-gecertificeerde profielen",
    body: "De profielsystemen die wij voeren zijn KOMO-gecertificeerd. Op de merkpagina's staat per systeem welke prestatiewaarden de fabrikant opgeeft.",
  },
  {
    icon: Wrench,
    titel: "Service binnen 48 uur",
    body: "Bij een storing of klacht staan wij binnen 48 uur ter plaatse. Dat geldt ook na oplevering, binnen de lopende garantietermijn.",
  },
];

const levering = [
  {
    titel: "Vaste projectprijs",
    body: "De prijs in de projectofferte is de prijs op de factuur. Geen tussentijdse indexering en geen toeslagen achteraf, ook niet bij een gefaseerd project dat over meerdere maanden loopt.",
  },
  {
    titel: "Levering door heel Nederland",
    body: "Wij leveren landelijk, op het adres en de datum die bij de opdrachtbevestiging zijn vastgelegd.",
  },
  {
    titel: "Levering op afroep",
    body: "Bij een project in fases leveren wij per bouwdeel in plaats van in één keer, zodat er geen opslagprobleem op de bouwplaats ontstaat.",
  },
  {
    titel: "Maatvoering door ons",
    body: "Wij nemen zelf op en produceren op de door ons vastgelegde maten. Daarmee ligt de verantwoordelijkheid voor de maatvoering bij ons.",
  },
];

export default function VoorwaardenPage() {
  return (
    <>
      <PageHero
        eyebrow="Zakelijke condities"
        title="Wat u van ons mag verwachten."
        description="De garantietermijnen, de certificering die wij standaard leveren en de afspraken die gelden bij een projectlevering — op één pagina, zodat u niet hoeft te zoeken."
        image="/images/villa-kozijn.jpg"
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Zakelijk", href: "/zakelijk" },
          { label: "Voorwaarden", href: "/zakelijk/voorwaarden" },
        ]}
      />

      {/* ---- Garantie ---- */}
      <section className="border-b border-ink/10 bg-paper">
        <div className="container-rebu grid gap-14 py-16 md:grid-cols-12 md:py-24">
          <div className="md:col-span-5">
            <span className="eyebrow">Garantie</span>
            <h2 className="mt-5 font-display text-3xl font-medium leading-tight text-ink md:text-4xl">
              Drie termijnen, apart vastgelegd
            </h2>
            <p className="mt-5 text-base leading-relaxed text-ink-soft">
              Garantie op een kozijn is geen enkel getal. Het profiel, de plaatsing en het beslag
              hebben elk hun eigen termijn — en het is nuttig om te weten welke termijn waarop slaat
              als er iets is.
            </p>
          </div>
          <div className="md:col-span-7">
            <dl className="divide-y divide-ink/10 border-y border-ink/10">
              {garantie.map((g) => (
                <div key={g.waarop} className="flex items-baseline gap-8 py-6">
                  <dt className="w-24 flex-none font-display text-2xl font-medium text-rebu-green">
                    {g.termijn}
                  </dt>
                  <dd className="text-base text-ink-soft">{g.waarop}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 text-sm leading-relaxed text-ink-soft">
              Kwalitatieve kunststof kozijnen gaan 30 tot 50 jaar mee. De garantietermijn is dus geen
              indicatie van de levensduur, maar van de periode waarin wij een gebrek kosteloos
              verhelpen.
            </p>
          </div>
        </div>
      </section>

      {/* ---- Certificering ---- */}
      <section className="bg-rebu-cream">
        <div className="container-rebu py-16 md:py-24">
          <span className="eyebrow">Certificering</span>
          <h2 className="mt-5 max-w-2xl font-display text-3xl font-medium leading-tight text-ink md:text-4xl">
            Wat er standaard in zit
          </h2>
          <div className="mt-12 grid gap-px border border-ink/10 bg-ink/10 md:grid-cols-3">
            {certificering.map((c) => (
              <div key={c.titel} className="bg-paper p-8">
                <div className="flex h-12 w-12 items-center justify-center bg-rebu-green/10 text-rebu-green">
                  <c.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-lg font-medium text-ink">{c.titel}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Levering ---- */}
      <section className="border-y border-ink/10 bg-paper">
        <div className="container-rebu py-16 md:py-24">
          <span className="eyebrow">Bij projectlevering</span>
          <h2 className="mt-5 max-w-2xl font-display text-3xl font-medium leading-tight text-ink md:text-4xl">
            Afspraken die gelden op projectbasis
          </h2>
          <dl className="mt-12 grid gap-x-14 gap-y-8 md:grid-cols-2">
            {levering.map((l) => (
              <div key={l.titel} className="border-t border-ink/10 pt-6">
                <dt className="font-display text-lg font-medium text-ink">{l.titel}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-ink-soft">{l.body}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-14 max-w-2xl text-sm leading-relaxed text-ink-soft">
            Op al onze leveringen zijn onze{" "}
            <Link href="/algemene-voorwaarden" className="text-rebu-green hover:underline">
              algemene voorwaarden
            </Link>{" "}
            van toepassing. Voor projectspecifieke afspraken — bijvoorbeeld over betaling in
            termijnen bij een gefaseerd project — neemt u contact met ons op via{" "}
            <a href={site.phoneHref} className="text-rebu-green hover:underline">
              {site.phone}
            </a>
            .
          </p>

          <Link href="/offerte" className="btn btn-primary mt-10">
            Projectofferte aanvragen <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <CTASection />
    </>
  );
}
