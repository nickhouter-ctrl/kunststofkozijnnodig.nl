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
      <div className="container-rebu relative">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <span className="eyebrow is-light">Recente projecten</span>
            <h2 className="mt-5 font-display text-3xl font-medium leading-[1.06] tracking-[-0.01em] sm:text-4xl md:text-[2.7rem]">
              Zo ziet vakmanschap{" "}
              <span className="italic text-rebu-green-light">eruit.</span>
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/70 md:text-[1.05rem]">
              Klik op een project om alle foto's, details en gebruikte producten te bekijken.
            </p>
          </div>
          <Link href="/projecten" className="btn-light">
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
                  className="group relative block h-full w-full overflow-hidden border border-white/12 transition-colors hover:border-white/40"
                >
                  <Image
                    src={p.cover}
                    alt={p.title}
                    fill
                    className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]"
                    sizes="(min-width: 768px) 50vw, 100vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-rebu-green-dark via-rebu-green-dark/20 to-transparent" />

                  <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 bg-rebu-green-dark/70 px-3 py-1 text-[0.7rem] font-medium text-white">
                    <Images className="h-3 w-3" />
                    {p.gallery.length}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7">
                    <div className="flex items-center gap-2 text-[0.7rem] text-white/70">
                      <MapPin className="h-3 w-3" />
                      <span>{p.location}</span>
                      <span className="h-1 w-1 bg-white/30" />
                      <span>{p.year}</span>
                    </div>
                    <h3 className="mt-1.5 font-display text-xl font-medium leading-tight md:text-2xl">
                      {p.title}
                    </h3>
                    <div className="mt-3 flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-white opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-1">
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
