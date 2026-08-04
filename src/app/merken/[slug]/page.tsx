import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, Info } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { CTASection } from "@/components/CTASection";
import { brands, getBrand } from "@/lib/brands";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return brands.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const brand = getBrand(slug);
  if (!brand) return {};

  return {
    title: `${brand.name} ${brand.systeem} — specificaties en toepassing`,
    description: `${brand.kicker}. Bouwdiepte, kamers, Uf-waarde en toepassing van het ${brand.name} ${brand.systeem} profielsysteem, zoals wij het op projectbasis leveren.`,
    openGraph: {
      title: `${brand.name} ${brand.systeem} | ${site.name}`,
      description: brand.kicker,
    },
    alternates: { canonical: `/merken/${brand.slug}` },
  };
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = getBrand(slug);
  if (!brand) notFound();

  const others = brands.filter((b) => b.slug !== brand.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${brand.name} ${brand.systeem}`,
    brand: { "@type": "Brand", name: brand.name },
    category: "Kunststof kozijnprofiel",
    description: brand.intro,
    url: `${site.url}/merken/${brand.slug}`,
    additionalProperty: brand.specs.map((s) => ({
      "@type": "PropertyValue",
      name: s.label,
      value: s.value,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHero
        eyebrow={`${brand.name} — ${brand.land}`}
        title={brand.kicker}
        description={brand.intro}
        image="/images/villa-kozijn.jpg"
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Merken", href: "/merken" },
          { label: brand.name, href: `/merken/${brand.slug}` },
        ]}
      />

      {/* ---- Specificaties ---- */}
      <section className="border-b border-ink/10 bg-paper">
        <div className="container-rebu grid gap-14 py-16 md:grid-cols-12 md:py-24">
          <div className="md:col-span-5">
            <span className="eyebrow">Technische gegevens</span>
            <h2 className="mt-5 font-display text-3xl font-medium leading-tight text-ink md:text-4xl">
              {brand.systeem}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-ink-soft">
              Onderstaande waarden komen uit de officiële documentatie van {brand.name} (
              {brand.bron}). Bij een concrete aanvraag rekenen wij de Uw-waarde door voor uw
              werkelijke element- en glasmaten.
            </p>

            {brand.logo && (
              <Image
                src={brand.logo}
                alt={brand.name}
                width={160}
                height={56}
                className="mt-10 h-12 w-auto object-contain"
              />
            )}
          </div>

          <div className="md:col-span-7">
            <dl className="divide-y divide-ink/10 border-y border-ink/10">
              {brand.specs.map((s) => (
                <div key={s.label} className="grid gap-1 py-5 sm:grid-cols-2 sm:gap-6">
                  <dt className="text-sm font-medium text-ink">{s.label}</dt>
                  <dd className="text-sm text-ink-soft">
                    <span className="font-medium text-ink">{s.value}</span>
                    {s.note && <span className="mt-1 block text-xs text-ink-soft">{s.note}</span>}
                  </dd>
                </div>
              ))}
            </dl>

            {brand.nlUitvoering && (
              <div className="mt-8 flex gap-4 border border-rebu-green/25 bg-rebu-tint p-6">
                <Info className="mt-0.5 h-5 w-5 flex-none text-rebu-green" />
                <div>
                  <p className="text-sm font-medium text-ink">De Nederlandse uitvoering wijkt af</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{brand.nlUitvoering}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ---- Sterke punten ---- */}
      <section className="bg-rebu-cream">
        <div className="container-rebu py-16 md:py-24">
          <div className="grid gap-14 md:grid-cols-12">
            <div className="md:col-span-5">
              <span className="eyebrow">Waarom dit systeem</span>
              <h2 className="mt-5 font-display text-3xl font-medium leading-tight text-ink md:text-4xl">
                Wat {brand.name} onderscheidt
              </h2>
            </div>
            <ul className="space-y-5 md:col-span-7">
              {brand.sterkte.map((s) => (
                <li key={s} className="flex gap-4">
                  <Check className="mt-0.5 h-5 w-5 flex-none text-rebu-green" />
                  <span className="text-base leading-relaxed text-ink-soft">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---- Toepassing ---- */}
      <section className="border-y border-ink/10 bg-paper">
        <div className="container-rebu py-16 md:py-24">
          <span className="eyebrow">Toepassing</span>
          <h2 className="mt-5 max-w-2xl font-display text-3xl font-medium leading-tight text-ink md:text-4xl">
            Waar dit systeem tot zijn recht komt
          </h2>
          <div className="mt-12 grid gap-px border border-ink/10 bg-ink/10 sm:grid-cols-3">
            {brand.toepassing.map((t, i) => (
              <div key={t} className="bg-paper p-8">
                <span className="font-display text-3xl text-rebu-green/30">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-4 text-sm leading-relaxed text-ink-soft">{t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Andere merken ---- */}
      <section className="bg-rebu-cream">
        <div className="container-rebu py-16 md:py-24">
          <span className="eyebrow">Vergelijken</span>
          <h2 className="mt-5 font-display text-3xl font-medium leading-tight text-ink md:text-4xl">
            De andere systemen
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {others.map((b) => (
              <Link
                key={b.slug}
                href={`/merken/${b.slug}`}
                className="group border border-ink/10 bg-paper p-6 transition-colors hover:border-rebu-green/40"
              >
                <span className="text-xs uppercase tracking-[0.16em] text-rebu-green">
                  {b.systeem}
                </span>
                <h3 className="mt-2 font-display text-lg font-medium text-ink">{b.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{b.kicker}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-rebu-green">
                  Bekijken
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
