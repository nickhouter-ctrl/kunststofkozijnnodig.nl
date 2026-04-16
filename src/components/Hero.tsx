"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ArrowRight, Phone, Star, ShieldCheck, Clock, Ruler, Sparkles } from "lucide-react";
import { site } from "@/lib/site";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const cardY = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-rebu-green-dark text-white">
      {/* Parallax background image */}
      <motion.div
        style={reduce ? undefined : { y: bgY, scale: bgScale }}
        className="absolute inset-0 will-change-transform"
      >
        <Image
          src="/images/hero-main.jpg"
          alt=""
          fill
          priority
          className="object-cover opacity-30"
          sizes="100vw"
        />
      </motion.div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-rebu-green-dark via-rebu-green/85 to-rebu-green-dark" />
      <div className="absolute inset-0 bg-gradient-to-t from-rebu-green-dark via-transparent to-transparent" />

      {/* Lighter green glows for depth */}
      <div className="pointer-events-none absolute -left-40 top-1/4 h-[500px] w-[500px] rounded-full bg-rebu-green-light/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-1/4 h-[400px] w-[400px] rounded-full bg-rebu-green-light/20 blur-3xl" />

      <div className="container-rebu relative py-24 md:py-36 lg:py-44">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <motion.div
            style={reduce ? undefined : { y: textY, opacity: textOpacity }}
            className="lg:col-span-7 will-change-transform"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-white/95 backdrop-blur-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
              Binnen 4 weken geleverd
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="mt-6 font-display text-5xl font-semibold leading-[1.02] tracking-tight md:text-6xl lg:text-7xl"
            >
              Kunststof kozijnen{" "}
              <span className="italic text-rebu-cream/90">die het verschil maken.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-8 max-w-xl text-lg text-white/80"
            >
              Wij zijn Kunststofkozijnnodig.nl: kleinschalig maar groots in wat we doen. Maatwerk kozijnen, deuren en schuifpuien — geleverd én vakkundig geplaatst door ons eigen team.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-10 flex flex-wrap items-center gap-3"
            >
              <Link
                href="/offerte"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-semibold text-rebu-green-dark shadow-[0_10px_40px_-5px_rgba(0,0,0,0.25)] transition-all hover:bg-rebu-cream hover:shadow-[0_15px_50px_-5px_rgba(0,0,0,0.35)]"
              >
                <Sparkles className="h-4 w-4" /> Offerte in 2 minuten
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href={site.phoneHref}
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                <Phone className="h-4 w-4" /> {site.phone}
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-12 flex flex-wrap items-center gap-6 text-sm"
            >
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-300 text-yellow-300" />
                  ))}
                </div>
                <span className="text-white/90">Vakmanschap gegarandeerd</span>
              </div>
              <div className="h-4 w-px bg-white/20" />
              <div className="flex items-center gap-2 text-white/85">
                <ShieldCheck className="h-4 w-4" /> SKG 2‑ster gecertificeerd
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            style={reduce ? undefined : { y: cardY }}
            className="lg:col-span-5 will-change-transform"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateY: -8 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              style={{ transformStyle: "preserve-3d", perspective: 1000 }}
              className="relative"
            >
              <div className="relative overflow-hidden rounded-3xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] ring-1 ring-white/15">
                <Image
                  src="/images/project-zaandam-1.jpg"
                  alt="Geplaatst kunststof kozijn"
                  width={800}
                  height={1000}
                  className="h-[520px] w-full object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-rebu-green-dark/40 via-transparent to-transparent" />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                className="absolute -bottom-6 -left-6 hidden rounded-2xl bg-white p-5 shadow-glow md:block"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rebu-green/10 text-rebu-green">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-neutral-500">Levertijd</p>
                    <p className="font-display text-2xl font-semibold text-rebu-charcoal">4 weken</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.0 }}
                className="absolute -top-6 -right-6 hidden rounded-2xl bg-white p-5 shadow-glow md:block"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rebu-green/10 text-rebu-green">
                    <Ruler className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-neutral-500">Altijd</p>
                    <p className="font-display text-2xl font-semibold text-rebu-charcoal">Op maat</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* USP strip */}
      <div className="relative border-t border-white/10 bg-rebu-green-dark/60 backdrop-blur-sm">
        <div className="container-rebu grid grid-cols-2 divide-x divide-white/10 md:grid-cols-4">
          {site.usps.map((u, i) => (
            <motion.div
              key={u.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="px-4 py-5 md:px-8 md:py-6"
            >
              <p className="font-display text-lg font-semibold text-white md:text-xl">{u.title}</p>
              <p className="mt-1 text-xs text-white/60 md:text-sm">{u.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
