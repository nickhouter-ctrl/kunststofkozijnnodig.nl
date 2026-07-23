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
            <span className="eyebrow">Onze producten</span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7 }}
              className="mt-5 font-display text-3xl font-medium leading-[1.06] tracking-[-0.01em] text-ink sm:text-4xl md:text-[2.7rem]"
            >
              Kozijnen, deuren en schuifpuien{" "}
              <span className="italic text-rebu-green">op maat.</span>
            </motion.h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-soft md:text-[1.05rem]">
              Een breed scala aan onderhoudsvrije kunststof oplossingen in elk profiel, kleur en afwerking. Geschikt voor woningen, villa's en bedrijfspanden.
            </p>
          </div>
          <Link href="/producten" className="btn-secondary">
            Alle producten bekijken
          </Link>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {products.map((p, i) => (
            <motion.div
              key={p.slug}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: i * 0.1, duration: 0.7, ease: "easeOut" }}
            >
              <Link
                href={`/producten/${p.slug}`}
                className="group flex h-full flex-col overflow-hidden border border-ink/10 bg-paper transition-colors hover:border-ink/25"
              >
                {/* Icon section */}
                <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden border-b border-ink/10 bg-rebu-cream">
                  <Image
                    src={p.icon}
                    alt={p.title}
                    width={180}
                    height={180}
                    className="relative z-10 h-36 w-auto object-contain transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col gap-3 p-7">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-2xl font-medium text-ink">
                      {p.title}
                    </h3>
                    <div className="flex h-10 w-10 items-center justify-center bg-rebu-green/10 text-rebu-green transition-all group-hover:bg-rebu-green group-hover:text-white">
                      <ArrowUpRight className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-ink-soft">{p.description}</p>
                  <span className="mt-auto inline-flex items-center gap-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-rebu-green">
                    Lees meer <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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
