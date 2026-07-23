"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, MapPin, Calendar, Images } from "lucide-react";

type ProjectCard = {
  slug: string;
  title: string;
  location: string;
  year: string;
  category: string;
  summary: string;
  cover: string;
  imageCount: number;
};

export function ProjectsGrid({ projects }: { projects: ProjectCard[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((p, i) => (
        <motion.div
          key={p.slug}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ delay: i * 0.08, duration: 0.6, ease: "easeOut" }}
        >
          <Link
            href={`/projecten/${p.slug}`}
            className="group relative block overflow-hidden bg-sand"
          >
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src={p.cover}
                alt={p.title}
                fill
                className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/15 to-transparent" />

              {/* Photo count badge */}
              <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 bg-ink/70 px-3 py-1 text-[0.7rem] font-medium text-white">
                <Images className="h-3 w-3" />
                {p.imageCount} foto's
              </div>

              {/* Arrow */}
              <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center bg-white text-ink opacity-0 transition-all duration-300 group-hover:opacity-100">
                <ArrowUpRight className="h-5 w-5" />
              </div>

              {/* Info overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.7rem] text-white/75">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {p.location}
                  </span>
                  <span className="h-1 w-1 bg-white/30" />
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {p.year}
                  </span>
                  <span className="h-1 w-1 bg-white/30" />
                  <span className="uppercase tracking-[0.14em] text-white/85">
                    {p.category}
                  </span>
                </div>
                <h3 className="mt-2 font-display text-2xl font-medium leading-tight text-white">
                  {p.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/70">{p.summary}</p>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
