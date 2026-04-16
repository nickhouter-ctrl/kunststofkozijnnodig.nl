"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, MapPin, Images } from "lucide-react";
import { projects } from "@/lib/projects";

export function ProjectsShowcase() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-rebu-green-dark py-24 text-white md:py-32">
      {/* Light green glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-rebu-green-light/20 blur-3xl" />

      <div className="container-rebu relative">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <span className="section-eyebrow text-rebu-cream/90">Recente projecten</span>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-[1.05] md:text-6xl">
              Zo ziet vakmanschap{" "}
              <span className="italic text-rebu-cream/80">eruit.</span>
            </h2>
            <p className="mt-5 text-lg text-white/70">
              Klik op een project om alle foto's, details en gebruikte producten te bekijken.
            </p>
          </div>
          <Link
            href="/projecten"
            className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/20"
          >
            Alle projecten <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Feature grid with asymmetric layout */}
        <div className="mt-16 grid grid-cols-12 gap-4 md:gap-5">
          {projects.slice(0, 6).map((p, i) => {
            const layout = [
              "col-span-12 md:col-span-7 aspect-[4/3] md:aspect-[16/10]",
              "col-span-6 md:col-span-5 aspect-square md:aspect-[4/5]",
              "col-span-6 md:col-span-4 aspect-square",
              "col-span-6 md:col-span-4 aspect-square",
              "col-span-6 md:col-span-4 aspect-square",
              "col-span-12 aspect-[16/9] md:aspect-[21/9]",
            ];

            return (
              <motion.div
                key={p.slug}
                initial={reduce ? undefined : { opacity: 0, y: 40 }}
                whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.07, duration: 0.7, ease: "easeOut" }}
                className={layout[i]}
              >
                <Link
                  href={`/projecten/${p.slug}`}
                  className="group relative block h-full w-full overflow-hidden rounded-3xl ring-1 ring-white/15 transition-all hover:ring-white/60"
                >
                  <Image
                    src={p.cover}
                    alt={p.title}
                    fill
                    className="object-cover transition-all duration-[1200ms] ease-out group-hover:scale-110"
                    sizes="(min-width: 768px) 50vw, 100vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-rebu-green-dark via-rebu-green-dark/20 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-rebu-green/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:to-rebu-green-light/30" />

                  <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-rebu-green-dark/70 px-3 py-1 text-xs font-medium text-white backdrop-blur-md ring-1 ring-white/15">
                    <Images className="h-3 w-3" />
                    {p.gallery.length}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7">
                    <div className="flex items-center gap-2 text-xs text-white/70">
                      <MapPin className="h-3 w-3" />
                      <span>{p.location}</span>
                      <span className="h-1 w-1 rounded-full bg-white/30" />
                      <span>{p.year}</span>
                    </div>
                    <h3 className="mt-1.5 font-display text-xl font-semibold leading-tight md:text-2xl">
                      {p.title}
                    </h3>
                    <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-rebu-cream opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-1">
                      Bekijk project <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
