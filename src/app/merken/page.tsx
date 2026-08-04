import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { CTASection } from "@/components/CTASection";
import { brands } from "@/lib/brands";

export const metadata: Metadata = {
  alternates: { canonical: "/merken" },
  title: "Profielmerken — Aluplast, Gealan, Schüco en K-Vision",
  description:
    "De vier profielsystemen die wij leveren, met bouwdiepte, kamers en Uf-waarde naast elkaar. Zodat u als aannemer of opdrachtgever kunt zien welk systeem bij uw bestek past.",
  keywords: [
    "kunststof kozijnen merken",
    "Aluplast IDEAL 7000",
    "Gealan S 9000",
    "Schüco LivIng 82",
    "Kömmerling K-Vision",
    "profielsysteem kozijnen",
  ],
};

export default function MerkenPage() {
  return (
    <>
      <PageHero
        eyebrow="Profielsystemen"
        title="Vier systemen. Eén die bij uw bestek past."
        description="Wij zijn niet aan één fabrikant gebonden. Dat betekent dat we het profiel kiezen dat bij de eis van uw project hoort — een scherpe BENG-eis vraagt iets anders dan een renovatie waar het gevelbeeld moet aansluiten."
        image="/images/villa-kozijn.jpg"
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Merken", href: "/merken" },
        ]}
      />

      {/* ---- Vergelijkingstabel ---- */}
      <section className="border-b border-ink/10 bg-paper">
        <div className="container-rebu py-16 md:py-24">
          <span className="eyebrow">In één oogopslag</span>
          <h2 className="mt-5 max-w-2xl font-display text-3xl font-medium leading-tight text-ink md:text-4xl">
            De vier systemen naast elkaar
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-soft">
            Alle waarden komen uit de officiële documentatie van de fabrikant. Let op: de opgegeven
            bouwdiepte is die van het basissysteem — het Nederlandse kozijnprofiel is bij vrijwel elk
            merk dieper. Dat staat per merk toegelicht.
          </p>

          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[42rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-ink/15">
                  <th className="py-4 pr-6 font-medium text-ink">Systeem</th>
                  <th className="py-4 pr-6 font-medium text-ink">Bouwdiepte</th>
                  <th className="py-4 pr-6 font-medium text-ink">Kamers</th>
                  <th className="py-4 pr-6 font-medium text-ink">Uf-waarde</th>
                  <th className="py-4 font-medium text-ink">Beglazing</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((b) => {
                  const find = (needle: string) =>
                    b.specs.find((s) => s.label.toLowerCase().startsWith(needle))?.value ?? "—";
                  return (
                    <tr key={b.slug} className="border-b border-ink/10 last:border-0">
                      <td className="py-4 pr-6">
                        <Link
                          href={`/merken/${b.slug}`}
                          className="font-medium text-ink transition-colors hover:text-rebu-green"
                        >
                          {b.name}
                        </Link>
                        <span className="block text-xs text-ink-soft">{b.systeem}</span>
                      </td>
                      <td className="py-4 pr-6 text-ink-soft">{find("bouwdiepte")}</td>
                      <td className="py-4 pr-6 text-ink-soft">{find("kamers")}</td>
                      <td className="py-4 pr-6 text-ink-soft">{find("uf-waarde")}</td>
                      <td className="py-4 text-ink-soft">{find("beglazing")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ---- Merkkaarten ---- */}
      <section className="bg-rebu-cream">
        <div className="container-rebu py-16 md:py-24">
          <div className="grid gap-8 md:grid-cols-2">
            {brands.map((b) => (
              <Link
                key={b.slug}
                href={`/merken/${b.slug}`}
                className="group flex flex-col border border-ink/10 bg-paper p-8 transition-colors hover:border-rebu-green/40"
              >
                <div className="flex h-12 items-center">
                  {b.logo ? (
                    <Image
                      src={b.logo}
                      alt={b.name}
                      width={140}
                      height={48}
                      className="h-10 w-auto object-contain"
                    />
                  ) : (
                    <span className="font-display text-2xl font-medium text-ink">{b.name}</span>
                  )}
                </div>
                <span className="mt-6 text-xs uppercase tracking-[0.16em] text-rebu-green">
                  {b.systeem}
                </span>
                <h3 className="mt-3 font-display text-xl font-medium leading-snug text-ink">
                  {b.kicker}
                </h3>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-soft">
                  {b.intro.split(". ").slice(0, 2).join(". ").replace(/\.?$/, ".")}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-rebu-green">
                  Specificaties bekijken
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
