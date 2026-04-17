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
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
            className="group relative block overflow-hidden rounded-3xl bg-rebu-green-dark ring-1 ring-white/15 transition-all hover:ring-white/60"
          >
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src={p.cover}
                alt={p.title}
                fill
                className="object-cover transition-all duration-[900ms] ease-out group-hover:scale-110"
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-rebu-green-dark via-rebu-green-dark/40 to-transparent" />

              {/* Photo count badge */}
              <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-rebu-green-dark/70 px-3 py-1 text-xs font-medium text-white backdrop-blur-md ring-1 ring-white/15">
                <Images className="h-3 w-3" />
                {p.imageCount} foto's
              </div>

              {/* Arrow */}
              <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur-md transition-all duration-500 group-hover:opacity-100 group-hover:bg-white group-hover:text-rebu-green-dark">
                <ArrowUpRight className="h-5 w-5" />
              </div>

              {/* Info overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-3 text-xs text-white/75">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {p.location}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-white/30" />
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {p.year}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-white/30" />
                  <span className="rounded-full bg-white/15 px-2 py-0.5 text-rebu-cream ring-1 ring-white/20">
                    {p.category}
                  </span>
                </div>
                <h3 className="mt-2 font-display text-2xl font-semibold leading-tight text-white">
                  {p.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-white/70">{p.summary}</p>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
