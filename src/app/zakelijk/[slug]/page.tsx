import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { CTASection } from "@/components/CTASection";
import { segments, getSegment } from "@/lib/segments";

export function generateStaticParams() {
  return segments.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const seg = getSegment(slug);
  if (!seg) return {};

  return {
    title: `Kunststof kozijnen voor ${seg.aanhef} — ${seg.kicker}`,
    description: `${seg.kicker}. Hoe wij projectleveringen van kunststof kozijnen, deuren en schuifpuien verzorgen voor ${seg.aanhef}.`,
    alternates: { canonical: `/zakelijk/${seg.slug}` },
  };
}

export default async function SegmentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const seg = getSegment(slug);
  if (!seg) notFound();

  const others = segments.filter((s) => s.slug !== seg.slug);

  return (
    <>
      <PageHero
        eyebrow={`Voor ${seg.aanhef}`}
        title={seg.kicker}
        description={seg.intro}
        image="/images/showcase-leveringen-3.webp"
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Zakelijk", href: "/zakelijk" },
          { label: seg.naam, href: `/zakelijk/${seg.slug}` },
        ]}
      />

      {/* ---- Knelpunten ---- */}
      <section className="border-b border-ink/10 bg-paper">
        <div className="container-rebu py-16 md:py-24">
          <span className="eyebrow">De praktijk</span>
          <h2 className="mt-5 max-w-2xl font-display text-3xl font-medium leading-tight text-ink md:text-4xl">
            Waar het bij {seg.aanhef} misgaat
          </h2>
          <div className="mt-12 grid gap-px border border-ink/10 bg-ink/10 md:grid-cols-3">
            {seg.knelpunten.map((k, i) => (
              <div key={k.titel} className="bg-paper p-8">
                <span className="font-display text-3xl text-rebu-green/30">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 font-display text-lg font-medium leading-snug text-ink">
                  {k.titel}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{k.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Onze aanpak ---- */}
      <section className="bg-rebu-cream">
        <div className="container-rebu grid gap-14 py-16 md:grid-cols-12 md:py-24">
          <div className="md:col-span-5">
            <span className="eyebrow">Onze aanpak</span>
            <h2 className="mt-5 font-display text-3xl font-medium leading-tight text-ink md:text-4xl">
              Wat wij daartegenover zetten
            </h2>

            <ul className="mt-10 space-y-3 border-t border-ink/10 pt-8">
              {seg.feiten.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-ink-soft">
                  <Check className="mt-0.5 h-4 w-4 flex-none text-rebu-green" />
                  {f}
                </li>
              ))}
            </ul>

            <Link href="/offerte" className="btn btn-primary mt-10">
              Projectofferte aanvragen <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="md:col-span-7">
            <dl className="divide-y divide-ink/10 border-y border-ink/10">
              {seg.aanpak.map((a) => (
                <div key={a.titel} className="py-6">
                  <dt className="font-display text-lg font-medium text-ink">{a.titel}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-ink-soft">{a.body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ---- Doorverwijzing ---- */}
      <section className="border-y border-ink/10 bg-paper">
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
                Van eerste contact en opname tot levering op locatie en facturatie — stap voor stap,
                met de doorlooptijd per fase.
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-rebu-green">
                Bekijk de werkwijze
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>

            <Link
              href="/merken"
              className="group border border-ink/10 p-8 transition-colors hover:border-rebu-green/40"
            >
              <span className="eyebrow">Profielsystemen</span>
              <h3 className="mt-4 font-display text-xl font-medium text-ink">
                Vier systemen om uit te kiezen
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                Aluplast, Gealan, Schüco en K-Vision — met bouwdiepte, kamers en Uf-waarde naast
                elkaar.
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-rebu-green">
                Vergelijk de systemen
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>

          <div className="mt-12 border-t border-ink/10 pt-8">
            <span className="eyebrow">Andere doelgroepen</span>
            <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
              {others.map((o) => (
                <Link
                  key={o.slug}
                  href={`/zakelijk/${o.slug}`}
                  className="text-sm font-medium text-ink-soft transition-colors hover:text-rebu-green"
                >
                  {o.naam}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
