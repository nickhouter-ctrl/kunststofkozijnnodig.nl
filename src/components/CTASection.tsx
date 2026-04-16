import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Phone, Sparkles } from "lucide-react";
import { site } from "@/lib/site";

export function CTASection() {
  return (
    <section className="section bg-rebu-cream">
      <div className="container-rebu">
        <div className="relative overflow-hidden rounded-3xl bg-rebu-green p-10 text-white md:p-16">
          {/* Background image with overlay */}
          <div className="absolute inset-0 opacity-25">
            <Image src="/images/project-zaandam-4.jpg" alt="" fill className="object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-rebu-green-dark via-rebu-green/80 to-rebu-green/30" />

          {/* Light glows */}
          <div className="pointer-events-none absolute -left-20 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-rebu-green-light/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 right-0 h-60 w-60 rounded-full bg-rebu-cream/15 blur-3xl" />

          <div className="relative max-w-2xl">
            <span className="section-eyebrow text-rebu-cream/90">Klaar voor je nieuwe kozijnen?</span>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-5xl">
              Ontvang binnen <span className="italic text-rebu-cream/90">1 werkdag</span> een offerte op maat.
            </h2>
            <p className="mt-5 text-lg text-white/80">
              Vul in 2 minuten de online configurator in — wij nemen contact op om de details door te nemen. Geen verplichtingen, altijd gratis.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/offerte"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-semibold text-rebu-green-dark shadow-[0_10px_40px_-5px_rgba(0,0,0,0.25)] transition-all hover:bg-rebu-cream hover:shadow-[0_15px_50px_-5px_rgba(0,0,0,0.35)]"
              >
                <Sparkles className="h-4 w-4" /> Start offerte-configurator
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href={site.phoneHref}
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                <Phone className="h-4 w-4" /> Bel direct
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
