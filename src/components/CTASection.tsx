import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Phone, Sparkles } from "lucide-react";
import { site } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";

export function CTASection() {
  return (
    <section className="relative isolate overflow-hidden bg-ink py-24 text-white md:py-32">
      <Image
        src="/images/project-zaandam-4.jpg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover opacity-25"
      />
      <div className="container-rebu relative text-center">
        <Reveal>
          <span className="eyebrow is-light justify-center">Klaar voor je nieuwe kozijnen?</span>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-medium leading-[1.05] tracking-[-0.01em] md:text-6xl">
            Ontvang binnen <span className="italic text-rebu-green-light">1 werkdag</span> een offerte op maat.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/70">
            Vul in 2 minuten de online configurator in — wij nemen contact op om de details door te nemen. Geen verplichtingen, altijd gratis.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/offerte" className="btn-primary">
              <Sparkles className="h-4 w-4" /> Start offerte-configurator
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href={site.phoneHref} className="btn-light">
              <Phone className="h-4 w-4" /> Bel direct
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
