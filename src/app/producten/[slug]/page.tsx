import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, ChevronRight, Download, Palette } from "lucide-react";
import { productDetails } from "@/lib/product-details";
import { createServiceClient } from "@/lib/supabase";
import { ProjectGallery } from "@/components/ProjectGallery";
import { Workflow } from "@/components/Workflow";
import { BrandMarquee } from "@/components/BrandMarquee";
import { CTASection } from "@/components/CTASection";

export const revalidate = 60;

const SLUGS = ["kozijnen", "deuren", "schuifpuien"] as const;

const PRODUCT_TAG: Record<string, string> = {
  kozijnen: "Kozijnen",
  deuren: "Deuren",
  schuifpuien: "Schuifpuien",
};

async function getProductGallery(slug: string): Promise<string[]> {
  try {
    const tag = PRODUCT_TAG[slug];
    if (!tag) return [];
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("projects")
      .select("images")
      .eq("published", true)
      .contains("products", [tag])
      .order("sort_order");
    if (!data) return [];
    return data.flatMap((p: any) => p.images ?? []);
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  return SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = productDetails[slug as keyof typeof productDetails];
  if (!product) return {};
  return {
    title: product.title,
    description: product.intro.slice(0, 155),
    openGraph: {
      title: product.title,
      description: product.subtitle,
      images: [{ url: product.heroImage }],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = productDetails[slug as keyof typeof productDetails];
  if (!product) notFound();

  const others = SLUGS.filter((s) => s !== slug).map((s) => productDetails[s]);
  const supabaseGallery = await getProductGallery(slug);
  const gallery = supabaseGallery.length > 0 ? supabaseGallery : product.gallery;

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[70vh] overflow-hidden bg-rebu-green-dark text-white">
        <Image
          src={product.heroImage}
          alt={product.title}
          fill
          priority
          className="object-cover opacity-30"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-rebu-green-dark via-rebu-green/85 to-rebu-green-dark" />
        <div className="absolute inset-0 bg-gradient-to-t from-rebu-green-dark via-transparent to-transparent" />
        <div className="pointer-events-none absolute -left-40 top-1/3 h-[500px] w-[500px] rounded-full bg-rebu-green-light/25 blur-3xl" />

        <div className="container-rebu relative flex min-h-[70vh] flex-col justify-end py-24">
          <nav className="mb-6 flex items-center gap-2 text-xs text-white/70">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/producten" className="hover:text-white">Producten</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white">{product.title}</span>
          </nav>
          <span className="section-eyebrow text-rebu-cream/90">Producten</span>
          <h1 className="mt-3 max-w-4xl font-display text-5xl font-semibold leading-[1.05] md:text-7xl">
            {product.title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/80">{product.subtitle}</p>
          <div className="mt-8">
            <Link
              href="/offerte"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-semibold text-rebu-green-dark shadow-lg transition-all hover:bg-rebu-cream hover:shadow-xl"
            >
              Offerte aanvragen <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Intro + features */}
      <section className="section bg-white">
        <div className="container-rebu grid gap-14 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <span className="section-eyebrow">Over {product.title.toLowerCase()}</span>
            <h2 className="section-title mt-3">
              De kwaliteit die je <span className="italic text-rebu-green">verdient.</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-neutral-600">{product.intro}</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {product.features.map((f) => (
              <div key={f.title} className="rounded-2xl border border-rebu-stone bg-rebu-cream p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rebu-green/10 text-rebu-green">
                  <Check className="h-5 w-5" />
                </div>
                <p className="mt-4 font-display text-lg font-semibold text-rebu-charcoal">{f.title}</p>
                <p className="mt-1 text-sm text-neutral-600">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="section bg-rebu-green-dark text-white">
        <div className="container-rebu">
          <div className="mb-12 max-w-2xl">
            <span className="section-eyebrow text-rebu-cream/90">Voorbeelden</span>
            <h2 className="mt-3 font-display text-3xl font-semibold md:text-5xl">
              Zo ziet het eruit <span className="italic text-rebu-cream/80">bij onze klanten.</span>
            </h2>
          </div>
          <ProjectGallery images={gallery} title={product.title} />
        </div>
      </section>

      {/* Options */}
      <section className="section bg-rebu-cream">
        <div className="container-rebu">
          <div className="mx-auto max-w-3xl text-center">
            <span className="section-eyebrow">Opties & varianten</span>
            <h2 className="section-title mt-3">
              Volledig <span className="italic text-rebu-green">op maat.</span>
            </h2>
            <p className="mt-5 text-lg text-neutral-600">
              Van profiel tot kleur tot hardware — alles is configureerbaar.
            </p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {product.options.map((opt) => {
              const isKleuren = opt.label.toLowerCase().includes("kleur");
              return (
                <div key={opt.label} className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-black/5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-rebu-green">
                    {opt.label}
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-rebu-charcoal">
                    {opt.items.slice(0, 6).map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-rebu-green" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  {isKleuren && (
                    <Link href="/kleuren" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-rebu-green hover:text-rebu-green-dark">
                      Bekijk alle kleuren <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>

          {/* Brochures + voordeuren link - only for deuren */}
          {slug === "deuren" && (
            <div className="mt-10 space-y-4">
              <Link href="/voordeuren" className="block rounded-2xl bg-rebu-green p-8 text-white shadow-glow transition-all hover:bg-rebu-green-dark">
                <h3 className="font-display text-xl font-semibold">Bekijk alle 30+ voordeurmodellen</h3>
                <p className="mt-2 text-sm text-white/80">Van Style tot Elegance — ontdek de volledige collectie premium voordeuren.</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">
                  Naar voordeurmodellen <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
              <div className="rounded-2xl bg-white p-8 shadow-soft ring-1 ring-black/5">
                <h3 className="font-display text-xl font-semibold text-rebu-charcoal">Brochures</h3>
                <p className="mt-2 text-sm text-neutral-600">Download de volledige catalogus met alle voordeurmodellen.</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <a href="https://rebukozijnen.nl/wp-content/uploads/2024/10/RebuKozijnen_Catalogus_buitendeuren.pdf-3.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-rebu-green/20 bg-rebu-green/5 px-5 py-2.5 text-sm font-semibold text-rebu-green transition-all hover:bg-rebu-green hover:text-white">
                    <Download className="h-4 w-4" /> Aluplast voordeuren (PDF)
                  </a>
                  <a href="https://rebukozijnen.nl/wp-content/uploads/2024/10/Voordeurmodellen-Gealan_rebukozijnen.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-rebu-green/20 bg-rebu-green/5 px-5 py-2.5 text-sm font-semibold text-rebu-green transition-all hover:bg-rebu-green hover:text-white">
                    <Download className="h-4 w-4" /> Gealan voordeuren (PDF)
                  </a>
                  <Link href="/kleuren" className="inline-flex items-center gap-2 rounded-full border border-rebu-green/20 bg-rebu-green/5 px-5 py-2.5 text-sm font-semibold text-rebu-green transition-all hover:bg-rebu-green hover:text-white">
                    <Palette className="h-4 w-4" /> Alle kleuren bekijken
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <BrandMarquee />
      <Workflow />

      {/* FAQ */}
      <section className="section bg-white">
        <div className="container-rebu max-w-3xl">
          <div className="text-center">
            <span className="section-eyebrow">Veelgestelde vragen</span>
            <h2 className="section-title mt-3">
              Nog vragen over <span className="italic text-rebu-green">{product.title.toLowerCase()}</span>?
            </h2>
          </div>
          <div className="mt-12 space-y-4">
            {product.faqs.map((faq, i) => (
              <details
                key={i}
                className="group rounded-2xl border border-rebu-stone bg-rebu-cream p-6 transition-all hover:border-rebu-green open:border-rebu-green"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 font-display text-lg font-semibold text-rebu-charcoal">
                  {faq.q}
                  <ChevronRight className="h-5 w-5 flex-none text-rebu-green transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-4 text-neutral-600">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Other products */}
      <section className="section bg-rebu-cream">
        <div className="container-rebu">
          <div className="mb-10 text-center">
            <span className="section-eyebrow">Ook interessant</span>
            <h2 className="section-title mt-3">Andere producten</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {others.map((o) => (
              <Link
                key={o.slug}
                href={`/producten/${o.slug}`}
                className="group relative overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-black/5 transition-all hover:-translate-y-1 hover:shadow-glow"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={o.heroImage}
                    alt={o.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(min-width: 768px) 50vw, 100vw"
                  />
                </div>
                <div className="p-7">
                  <h3 className="font-display text-2xl font-semibold text-rebu-charcoal">{o.title}</h3>
                  <p className="mt-2 text-sm text-neutral-600">{o.subtitle}</p>
                  <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-rebu-green">
                    Bekijk {o.title.toLowerCase()} <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
