"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { projects } from "@/lib/projects";

// Collect all gallery images with their project reference
const tiles = projects.flatMap((p) =>
  p.gallery.map((img) => ({ img, slug: p.slug, title: p.title })),
);

export function ProjectsMarquee() {
  const row1 = [...tiles, ...tiles];
  const row2 = [...tiles.slice().reverse(), ...tiles.slice().reverse()];

  return (
    <section className="relative overflow-hidden bg-rebu-green-dark py-20">
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r from-rebu-green-dark to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l from-rebu-green-dark to-transparent" />

      <div className="space-y-5">
        {/* Row 1 — scroll left */}
        <motion.div
          className="flex gap-5 will-change-transform"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 60,
            ease: "linear",
            repeat: Infinity,
          }}
        >
          {row1.map((t, i) => (
            <Link
              key={`r1-${i}`}
              href={`/projecten/${t.slug}`}
              className="group relative h-56 w-80 flex-none overflow-hidden border border-white/12 transition-colors hover:border-white/40 md:h-64 md:w-96"
            >
              <Image
                src={t.img}
                alt={t.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="384px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-rebu-green-dark/70 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <p className="absolute bottom-4 left-4 right-4 font-display text-sm font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                {t.title}
              </p>
            </Link>
          ))}
        </motion.div>

        {/* Row 2 — scroll right */}
        <motion.div
          className="flex gap-5 will-change-transform"
          animate={{ x: ["-50%", "0%"] }}
          transition={{
            duration: 70,
            ease: "linear",
            repeat: Infinity,
          }}
        >
          {row2.map((t, i) => (
            <Link
              key={`r2-${i}`}
              href={`/projecten/${t.slug}`}
              className="group relative h-48 w-72 flex-none overflow-hidden border border-white/12 transition-colors hover:border-white/40 md:h-56 md:w-80"
            >
              <Image
                src={t.img}
                alt={t.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="320px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-rebu-green-dark/70 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <p className="absolute bottom-4 left-4 right-4 font-display text-sm font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                {t.title}
              </p>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
