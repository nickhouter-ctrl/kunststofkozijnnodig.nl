import type { Metadata } from "next";
import { ShieldCheck, Clock, Star, Euro } from "lucide-react";
import { QuoteWizard } from "@/components/QuoteWizard";

export const metadata: Metadata = {
  title: "Offerte aanvragen — binnen 1 werkdag op maat",
  description:
    "Vraag je offerte voor kunststof kozijnen, deuren of schuifpuien aan via onze stap-voor-stap configurator. Gratis, vrijblijvend en binnen 1 werkdag antwoord.",
};

const perks = [
  { icon: Clock, text: "Binnen 1 werkdag antwoord" },
  { icon: Euro, text: "Altijd gratis en vrijblijvend" },
  { icon: Star, text: "Persoonlijk advies" },
  { icon: ShieldCheck, text: "Persoonlijk advies" },
];

export default function OffertePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-rebu-green-dark py-16 text-white md:py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-rebu-green-dark via-rebu-green/85 to-rebu-green-dark" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-rebu-green-light/25 blur-3xl" />
        <div className="container-rebu relative">
          <div className="mx-auto max-w-3xl text-center">
            <span className="section-eyebrow text-rebu-cream/90">Offerte-configurator</span>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-6xl">
              Stel je offerte samen <span className="italic text-rebu-cream/90">in 2 minuten.</span>
            </h1>
            <p className="mt-5 text-lg text-white/80">
              Beantwoord een paar korte vragen en ontvang binnen 1 werkdag een prijs op maat van onze specialisten.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {perks.map((p) => (
                <div key={p.text} className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-medium text-white/95 backdrop-blur-sm">
                  <p.icon className="h-3.5 w-3.5" />
                  {p.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-rebu-cream">
        <div className="container-rebu">
          <QuoteWizard />
        </div>
      </section>
    </>
  );
}
