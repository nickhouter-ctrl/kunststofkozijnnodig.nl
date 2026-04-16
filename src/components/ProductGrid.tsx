"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { products } from "@/lib/content";

export function ProductGrid() {
  return (
    <section className="section bg-rebu-cream">
      <div className="container-rebu">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <span className="section-eyebrow">Onze producten</span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7 }}
              className="section-title mt-3"
            >
              Kozijnen, deuren en schuifpuien{" "}
              <span className="italic text-rebu-green">op maat.</span>
            </motion.h2>
            <p className="mt-5 text-lg text-neutral-600">
              Een breed scala aan onderhoudsvrije kunststof oplossingen in elk profiel, kleur en afwerking. Geschikt voor woningen, villa's en bedrijfspanden.
            </p>
          </div>
          <Link href="/producten" className="btn-secondary">
            Alle producten bekijken
          </Link>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {products.map((p, i) => (
            <motion.div
              key={p.slug}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: i * 0.1, duration: 0.7, ease: "easeOut" }}
              whileHover={{ y: -6 }}
            >
              <Link
                href={`/producten/${p.slug}`}
                className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-black/5 transition-shadow hover:shadow-glow"
              >
                {/* Icon section — replaces photo */}
                <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br from-rebu-cream to-rebu-stone">
                  {/* Green glow behind icon */}
                  <div className="pointer-events-none absolute left-1/2 top-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rebu-green/20 blur-3xl transition-all duration-700 group-hover:h-80 group-hover:w-80 group-hover:bg-rebu-green/30" />

                  {/* Subtle grid pattern */}
                  <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                      backgroundImage:
                        "linear-gradient(to right, #1f5f3f 1px, transparent 1px), linear-gradient(to bottom, #1f5f3f 1px, transparent 1px)",
                      backgroundSize: "28px 28px",
                    }}
                  />

                  {/* Icon */}
                  <motion.div
                    whileHover={{ rotateY: 8, rotateX: -4, scale: 1.08 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    style={{ transformStyle: "preserve-3d", perspective: 800 }}
                    className="relative z-10 will-change-transform"
                  >
                    <Image
                      src={p.icon}
                      alt={p.title}
                      width={180}
                      height={180}
                      className="h-36 w-auto object-contain drop-shadow-[0_10px_25px_rgba(31,95,63,0.35)] transition-all duration-700 group-hover:drop-shadow-[0_15px_40px_rgba(31,95,63,0.55)]"
                    />
                  </motion.div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col gap-3 p-7">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-2xl font-semibold text-rebu-charcoal">
                      {p.title}
                    </h3>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rebu-green/10 text-rebu-green transition-all group-hover:rotate-45 group-hover:bg-rebu-green group-hover:text-white">
                      <ArrowUpRight className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600">{p.description}</p>
                  <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-rebu-green group-hover:text-rebu-green-dark">
                    Lees meer →
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
