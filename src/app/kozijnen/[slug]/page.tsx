import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, MapPin, Clock, ShieldCheck, Star, Phone, ChevronRight, Truck } from "lucide-react";
import { cities, getCity } from "@/lib/cities";
import { site } from "@/lib/site";
import { reviews } from "@/lib/content";
import { CTASection } from "@/components/CTASection";
import { BrandMarquee } from "@/components/BrandMarquee";

export async function generateStaticParams() {
  return cities.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const city = getCity(slug);
  if (!city) return {};
  return {
    title: `Kunststof kozijnen ${city.name} — leveren & plaatsen | Rebu`,
    description: `Kunststof kozijnen in ${city.name} (${city.region})? Rebu Kozijnen levert en plaatst maatwerk kozijnen, deuren en schuifpuien. SKG 2-ster, binnen 4 weken. Gratis offerte.`,
    openGraph: {
      title: `Kunststof kozijnen ${city.name} | Rebu Kozijnen`,
      description: `Specialist in kunststof kozijnen in ${city.name}. Maatwerk, scherpe prijs, binnen 4 weken geleverd. Vraag gratis een offerte aan.`,
    },
    alternates: { canonical: `${site.url}/kozijnen/${city.slug}` },
  };
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const city = getCity(slug);
  if (!city) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Kunststof kozijnen ${city.name}`,
    description: `Levering en plaatsing van kunststof kozijnen, deuren en schuifpuien in ${city.name} en omgeving.`,
    provider: {
      "@type": "LocalBusiness",
      name: site.name,
      telephone: site.phone,
      address: {
        "@type": "PostalAddress",
        streetAddress: site.address.street,
        postalCode: site.address.postalCode,
        addressLocality: site.address.city,
        addressCountry: "NL",
      },
    },
    areaServed: {
      "@type": "City",
      name: city.name,
      containedInPlace: { "@type": "State", name: "Noord-Holland" },
    },
    serviceType: "Levering en plaatsing kunststof kozijnen",
  };

  // Show nearby cities of same type first, then others
  const sametype = cities.filter((c) => c.slug !== slug && c.serviceType === city.serviceType);
  const othertype = cities.filter((c) => c.slug !== slug && c.serviceType !== city.serviceType);
  const otherCities = [...sametype.slice(0, 6), ...othertype.slice(0, 2)];
  const selectedReviews = reviews.slice(0, 3);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-rebu-green-dark text-white">
        <div className="absolute inset-0">
          <Image src="/images/hero-main.jpg" alt="" fill className="object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-br from-rebu-green-dark via-rebu-green/85 to-rebu-green-dark" />
        </div>
        <div className="pointer-events-none absolute -left-40 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-rebu-green-light/25 blur-3xl" />

        <div className="container-rebu relative py-20 md:py-28">
          <nav className="mb-6 flex items-center gap-2 text-xs text-white/70">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white">Kozijnen {city.name}</span>
          </nav>

          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm">
            <MapPin className="h-3 w-3" /> {city.region} · {city.distance} vanaf Wormerveer
          </div>

          <h1 className="mt-6 max-w-4xl font-display text-5xl font-semibold leading-[1.05] md:text-7xl">
            Kunststof kozijnen in{" "}
            <span className="italic text-rebu-cream/90">{city.name}</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-white/80">
            {city.serviceType === "leveren-plaatsen"
              ? `Maatwerk kunststof kozijnen, deuren en schuifpuien — geleverd én vakkundig geplaatst in ${city.name} en omgeving. SKG 2‑ster gecertificeerd, binnen 4 weken.`
              : `Levering van hoogwaardige kunststof kozijnen, deuren en schuifpuien aan aannemers en bouwbedrijven in ${city.name} en omgeving. Rechtstreeks van de fabriek, binnen 4 weken.`}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/offerte"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-semibold text-rebu-green-dark shadow-lg transition-all hover:bg-rebu-cream"
            >
              Gratis offerte aanvragen <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={site.phoneHref}
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              <Phone className="h-4 w-4" /> {site.phone}
            </a>
          </div>
        </div>
      </section>

      {/* USPs */}
      <section className="border-b border-rebu-stone bg-white py-10">
        <div className="container-rebu grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            { icon: Clock, title: "Binnen 4 weken", sub: "Geleverd én geplaatst" },
            { icon: ShieldCheck, title: "SKG 2‑ster", sub: "Inbraakwerend gecertificeerd" },
            { icon: Star, title: "5,0 op Google", sub: "100% tevreden klanten" },
            { icon: Truck, title: city.serviceType === "leveren-plaatsen" ? "Leveren + plaatsen" : "Landelijke levering", sub: city.serviceType === "leveren-plaatsen" ? `${city.distance} vanaf Wormerveer` : `Levering aan aannemers in ${city.name}` },
          ].map((u) => (
            <div key={u.title} className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-rebu-green/10 text-rebu-green">
                <u.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-rebu-charcoal">{u.title}</p>
                <p className="text-xs text-neutral-500">{u.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lokale content */}
      <section className="section bg-rebu-cream">
        <div className="container-rebu grid gap-14 lg:grid-cols-2">
          <div>
            <span className="section-eyebrow">Kozijnen in {city.name}</span>
            <h2 className="section-title mt-3">
              Waarom kiezen voor Rebu in{" "}
              <span className="italic text-rebu-green">{city.name}?</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-neutral-600">{city.description}</p>

            <ul className="mt-8 space-y-3">
              {city.highlights.map((h) => (
                <li key={h} className="flex items-start gap-3 text-neutral-700">
                  <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-rebu-green/10 text-rebu-green">
                    <Check className="h-3 w-3" />
                  </span>
                  {h}
                </li>
              ))}
              <li className="flex items-start gap-3 text-neutral-700">
                <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-rebu-green/10 text-rebu-green">
                  <Check className="h-3 w-3" />
                </span>
                Schüco, Aluplast en Gealan profielen
              </li>
              <li className="flex items-start gap-3 text-neutral-700">
                <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-rebu-green/10 text-rebu-green">
                  <Check className="h-3 w-3" />
                </span>
                HR++ of triple glas standaard
              </li>
              <li className="flex items-start gap-3 text-neutral-700">
                <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-rebu-green/10 text-rebu-green">
                  <Check className="h-3 w-3" />
                </span>
                30+ jaar onderhoudsvrij
              </li>
            </ul>
          </div>

          <div className="space-y-5">
            <div className="overflow-hidden rounded-3xl shadow-glow">
              <Image
                src="/images/project-zaandam-1.jpg"
                alt={`Kunststof kozijnen project nabij ${city.name}`}
                width={800}
                height={600}
                className="h-[380px] w-full object-cover"
              />
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div className="overflow-hidden rounded-2xl">
                <Image
                  src="/images/project-latten-5.webp"
                  alt="Kozijnen detail"
                  width={400}
                  height={300}
                  className="h-[180px] w-full object-cover"
                />
              </div>
              <div className="overflow-hidden rounded-2xl">
                <Image
                  src="/images/showcase-leveringen-3.webp"
                  alt="Levering kozijnen"
                  width={400}
                  height={300}
                  className="h-[180px] w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Producten */}
      <section className="section bg-white">
        <div className="container-rebu">
          <div className="mx-auto max-w-3xl text-center">
            <span className="section-eyebrow">Ons assortiment in {city.name}</span>
            <h2 className="section-title mt-3">
              Kozijnen, deuren en schuifpuien <span className="italic text-rebu-green">op maat</span>
            </h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              { title: "Kunststof kozijnen", slug: "kozijnen", desc: `Draaikiepramen, vastglas, uitzetramen — elk type kozijn leverbaar in ${city.name}. Onderhoudsvrij, isolerend en naar wens vormgegeven.`, img: "/images/icon-kozijnen.png" },
              { title: "Kunststof deuren", slug: "deuren", desc: `Voordeuren, achterdeuren en openslaande deuren voor woningen in ${city.name}. 3-puntsvergrendeling standaard.`, img: "/images/icon-deuren.png" },
              { title: "Schuifpuien", slug: "schuifpuien", desc: `2-, 3- en 4-delige schuifpuien en hefschuifdeuren. Slanke profielen, groot glasoppervlak — populair in ${city.name}.`, img: "/images/icon-schuifpuien.png" },
            ].map((p) => (
              <Link
                key={p.slug}
                href={`/producten/${p.slug}`}
                className="group card transition-all hover:-translate-y-1 hover:shadow-glow"
              >
                <div className="flex h-24 items-center justify-center">
                  <Image src={p.img} alt={p.title} width={80} height={80} className="h-20 w-auto object-contain" />
                </div>
                <h3 className="mt-4 text-center font-display text-xl font-semibold text-rebu-charcoal">{p.title}</h3>
                <p className="mt-2 text-center text-sm text-neutral-600">{p.desc}</p>
                <p className="mt-4 text-center text-sm font-semibold text-rebu-green">
                  Meer info <ArrowRight className="ml-1 inline h-3 w-3" />
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="section bg-rebu-cream">
        <div className="container-rebu">
          <div className="mx-auto max-w-3xl text-center">
            <span className="section-eyebrow">Klanten in de regio {city.region}</span>
            <h2 className="section-title mt-3">
              Dit zeggen onze klanten
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {selectedReviews.map((r) => (
              <div key={r.name} className="card">
                <div className="flex gap-1">
                  {[...Array(r.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-neutral-700">"{r.body}"</p>
                <p className="mt-4 text-sm font-semibold text-rebu-charcoal">{r.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BrandMarquee />

      {/* Nearby areas */}
      <section className="section bg-white">
        <div className="container-rebu">
          <div className="mx-auto max-w-3xl text-center">
            <span className="section-eyebrow">Wij werken ook in</span>
            <h2 className="section-title mt-3">
              Kozijnen in de buurt van{" "}
              <span className="italic text-rebu-green">{city.name}</span>
            </h2>
            <p className="mt-4 text-neutral-600">
              Naast {city.name} zijn we ook actief in {city.nearbyAreas.join(", ")} en de rest van {city.region}.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
            {otherCities.map((c) => (
              <Link
                key={c.slug}
                href={`/kozijnen/${c.slug}`}
                className="group rounded-2xl border border-rebu-stone bg-rebu-cream p-4 text-center transition-all hover:border-rebu-green hover:shadow-soft"
              >
                <p className="font-display text-lg font-semibold text-rebu-charcoal group-hover:text-rebu-green">{c.name}</p>
                <p className="mt-1 text-xs text-neutral-500">{c.region} · {c.distance}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
