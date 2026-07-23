"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Phone } from "lucide-react";
import { site } from "@/lib/site";

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[88svh] flex-col justify-end overflow-hidden bg-rebu-green-dark text-white">
      <div className="absolute inset-0 -z-10">
        <Image src="/images/hero-main.jpg" alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-rebu-green-dark via-rebu-green-dark/55 to-rebu-green-dark/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
      </div>

      <div className="container-rebu pb-16 pt-32 md:pb-24 md:pt-40">
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          className="eyebrow is-light"
        >
          Zakelijke projectleverancier
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.08, ease }}
          className="mt-6 max-w-4xl font-display text-[2.75rem] font-medium leading-[1.03] tracking-[-0.015em] md:text-6xl lg:text-[4.4rem]"
        >
          Kunststof kozijnen voor projecten die op planning moeten blijven.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.16, ease }}
          className="mt-7 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg"
        >
          Uw partner voor kozijnen, deuren en schuifpuien op projectbasis — aannemers, VvE&apos;s,
          woningcorporaties en ontwikkelaars. Vaste projectprijzen, voorspelbare levering, door heel Nederland.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.24, ease }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <Link href="/offerte" className="btn-primary">
            Projectofferte aanvragen <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/zakelijk" className="btn-light">
            Voor de zakelijke markt
          </Link>
          <a
            href={site.phoneHref}
            className="inline-flex items-center gap-2 text-sm font-medium text-white/85 transition-colors hover:text-white"
          >
            <Phone className="h-4 w-4 text-rebu-green-light" /> {site.phone}
          </a>
        </motion.div>
      </div>

      {/* USP strip */}
      <div className="relative border-t border-white/15 bg-rebu-green-dark/40 backdrop-blur-sm">
        <div className="container-rebu grid grid-cols-2 md:grid-cols-4">
          {site.usps.map((u, i) => (
            <div
              key={u.title}
              className={`px-1 py-6 md:px-6 md:py-7 ${i > 0 ? "md:border-l md:border-white/12" : ""} ${
                i % 2 === 1 ? "border-l border-white/12" : ""
              } ${i > 1 ? "border-t border-white/12 md:border-t-0" : ""}`}
            >
              <p className="font-display text-lg font-medium leading-tight text-white md:text-xl">{u.title}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-white/55 md:text-[0.8rem]">{u.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
