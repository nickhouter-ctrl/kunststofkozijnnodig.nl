import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Hero } from "@/components/Hero";
import { Reveal } from "@/components/ui/Reveal";
import { EditorialHeading } from "@/components/ui/EditorialHeading";
import { site } from "@/lib/site";
import { products, projects } from "@/lib/content";
import { brands } from "@/lib/brands";
import { fases } from "@/lib/werkwijze";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* ---- Voor de zakelijke markt — audiences ---- */}
      <section className="section bg-rebu-cream">
        <div className="container-rebu">
          <EditorialHeading
            eyebrow="Voor de zakelijke markt"
            title="Eén projectleverancier voor iedereen die bouwt aan volume."
            text="Van een enkele bouwstroom tot honderden woningen in groot onderhoud — wij leveren en plaatsen kozijnen op de schaal en het tempo dat uw project vraagt."
          />
          <div className="mt-16 grid grid-cols-1 gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {site.audiences.map((a, i) => (
              <Reveal key={a.title} delay={i * 0.08}>
                <Link href={a.href} className="group block border-t border-ink/15 pt-7">
                  <div className="flex items-start gap-5">
                    <span className="index-num">{String(i + 1).padStart(2, "0")}</span>
                    <div className="min-w-0">
                      <h3 className="flex items-center gap-2 font-display text-2xl font-medium leading-snug text-ink">
                        {a.title}
                        <ArrowUpRight className="h-5 w-5 text-ink/30 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-rebu-green" />
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-ink-soft">{a.body}</p>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Assortiment — range grid ---- */}
      <section className="section border-t border-ink/10 bg-paper">
        <div className="container-rebu">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <EditorialHeading
              eyebrow="Assortiment"
              title="Kozijnen, deuren en schuifpuien."
              text="Duitse topprofielen van Schüco, Aluplast, Gealan en K-Vision — onderhoudsvrij, energiezuinig en SKG-gecertificeerd, volledig op maat per project."
              className="max-w-2xl"
            />
            <Reveal direction="left">
              <Link href="/producten" className="link-underline">
                Volledig assortiment <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </Reveal>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.06}>
                <Link href={`/producten/${p.slug}`} className="group relative block aspect-[4/5] overflow-hidden bg-sand">
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.045]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/15 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-7">
                    <h3 className="font-display text-2xl font-medium text-white">{p.title}</h3>
                    <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/75">{p.description}</p>
                    <span className="mt-4 inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white">
                      Bekijk <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Merken — signature strip ---- */}
      <section className="border-y border-ink/10 bg-rebu-cream py-14">
        <div className="container-rebu flex flex-col items-center gap-8 md:flex-row md:justify-between">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-ink-soft">
            Wij verwerken uitsluitend Duitse topprofielen
          </p>
          {/* Uit `brands` en niet uit `site.brands`: die laatste is de logolijst
              voor de marquee en bevat alleen merken waarvan wij een logo hebben. */}
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {brands.map((b) => (
              <Link
                key={b.name}
                href={`/merken/${b.slug}`}
                className="font-display text-2xl font-medium text-ink/70 transition-colors hover:text-rebu-green"
              >
                {b.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Werkwijze — numbered process ---- */}
      <section className="section bg-paper">
        <div className="container-rebu">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <EditorialHeading
              eyebrow="Werkwijze"
              title="U mailt een tekening. Wij maken er een productietekening van."
              text="Wij werken uw tekening uit tot een detailtekening met alle specificaties erin en sturen die terug ter controle. Er gaat niets in productie voordat u akkoord bent."
              className="max-w-2xl"
            />
            <Reveal direction="left">
              <Link href="/zakelijk/werkwijze" className="link-underline">
                Volledige werkwijze <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </Reveal>
          </div>
          <ol className="mt-16 grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {fases.map((f, idx) => (
              <Reveal as="li" key={f.fase} delay={idx * 0.05}>
                <div className="border-t border-ink/15 pt-6">
                  <span className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-rebu-green">
                    {f.fase}
                  </span>
                  <h3 className="mt-3 font-display text-xl font-medium leading-snug text-ink">{f.titel}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ---- Projecten — editorial grid ---- */}
      <section className="section border-t border-ink/10 bg-rebu-cream">
        <div className="container-rebu">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <EditorialHeading
              eyebrow="Projecten"
              title="Werk dat voor zichzelf spreekt."
              className="max-w-xl"
            />
            <Reveal direction="left">
              <Link href="/projecten" className="link-underline">
                Alle projecten <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </Reveal>
          </div>
          <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4">
            {projects.slice(0, 8).map((p, i) => (
              <Reveal key={p.title + i} delay={(i % 4) * 0.05}>
                <div className="group relative aspect-square overflow-hidden bg-sand">
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    sizes="(max-width:768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <p className="text-sm font-medium text-white">{p.title}</p>
                    <p className="text-xs text-white/70">{p.location}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Kengetallen — trust strip ---- */}
      <section className="bg-rebu-green-dark py-16 text-white md:py-20">
        <div className="container-rebu grid grid-cols-2 gap-y-10 md:grid-cols-4">
          {site.stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.06}>
              <div className={`px-2 md:px-6 ${i > 0 ? "md:border-l md:border-white/15" : ""}`}>
                <p className="font-display text-4xl font-medium tracking-tight text-white md:text-5xl">{s.value}</p>
                <p className="mt-2 text-[0.8rem] leading-snug text-white/60">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---- CTA banner ---- */}
      <section className="relative isolate overflow-hidden bg-ink py-24 text-white md:py-32">
        <Image
          src="/images/showcase-leveringen-3.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-25"
        />
        <div className="container-rebu relative text-center">
          <Reveal>
            <span className="eyebrow is-light justify-center">Start uw project</span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-medium leading-[1.05] tracking-[-0.01em] md:text-6xl">
              Plan uw kozijnen in met een partner die levert.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/70">
              Stuur uw bestek of tekeningen door voor een scherpe projectofferte — meestal binnen enkele werkdagen terug.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link href="/offerte" className="btn-primary">
                Projectofferte aanvragen <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/contact" className="btn-light">
                Neem contact op
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
