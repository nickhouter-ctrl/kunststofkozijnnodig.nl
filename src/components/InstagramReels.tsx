"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Instagram, Play, ExternalLink } from "lucide-react";

type Post = {
  shortcode: string;
  url: string;
  type: "reel" | "post";
};

// All posts from rebukozijnen Instagram — thumbnails are downloaded to /public/images/instagram
const posts: Post[] = [
  { shortcode: "DXHakvJFTes", url: "https://www.instagram.com/p/DXHakvJFTes/", type: "post" },
  { shortcode: "DVxthPikvKg", url: "https://www.instagram.com/reel/DVxthPikvKg/", type: "reel" },
  { shortcode: "DWGN81FCrMm", url: "https://www.instagram.com/reel/DWGN81FCrMm/", type: "reel" },
  { shortcode: "DWWosYGFih_", url: "https://www.instagram.com/p/DWWosYGFih_/", type: "post" },
  { shortcode: "DVs9sDCFA5g", url: "https://www.instagram.com/p/DVs9sDCFA5g/", type: "post" },
  { shortcode: "DWq4cl-k-xM", url: "https://www.instagram.com/reel/DWq4cl-k-xM/", type: "reel" },
  { shortcode: "DWDx6ZSlggi", url: "https://www.instagram.com/p/DWDx6ZSlggi/", type: "post" },
  { shortcode: "DWZCyY2kU-2", url: "https://www.instagram.com/reel/DWZCyY2kU-2/", type: "reel" },
];

export function InstagramReels() {
  return (
    <section className="relative overflow-hidden bg-rebu-green-dark py-20 text-white md:py-24">
      {/* Light green glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-rebu-green-light/20 blur-3xl" />

      <div className="container-rebu relative">
        {/* Header — logo + @rebukozijnen */}
        <div className="mb-10 flex items-center justify-between gap-4">
          <a
            href="https://www.instagram.com/rebukozijnen/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4"
          >
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white p-1 ring-2 ring-white/40 md:h-14 md:w-14">
              <Image
                src="/logos/favicon.png"
                alt="Rebu Kozijnen"
                width={56}
                height={56}
                className="h-full w-full object-contain"
              />
            </div>
            <span className="font-display text-xl font-semibold text-white transition-colors group-hover:text-rebu-green-light md:text-2xl">
              rebukozijnen
            </span>
          </a>
          <a
            href="https://www.instagram.com/rebukozijnen/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-white/20 md:text-sm"
          >
            <Instagram className="h-4 w-4" /> Volgen
          </a>
        </div>

        {/* Clean grid — 4 columns on desktop, 2 on mobile */}
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
          {posts.map((post, i) => (
            <motion.a
              key={post.shortcode}
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.05, duration: 0.5, ease: "easeOut" }}
              className="group relative block aspect-square overflow-hidden rounded-lg bg-rebu-green-dark ring-1 ring-white/10 transition-all hover:ring-white/60 md:rounded-xl"
            >
              <Image
                src={`/images/instagram/${post.shortcode}.jpg`}
                alt={`Instagram ${post.type}`}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(min-width: 768px) 25vw, 50vw"
              />

              {/* Play icon for reels */}
              {post.type === "reel" && (
                <div className="absolute inset-0 flex items-center justify-center bg-rebu-green-dark/0 transition-colors group-hover:bg-rebu-green-dark/30">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 backdrop-blur-sm shadow-lg md:h-14 md:w-14">
                    <Play className="ml-0.5 h-5 w-5 fill-rebu-green-dark text-rebu-green-dark md:h-6 md:w-6" />
                  </div>
                </div>
              )}

              {/* External link hint on hover */}
              <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-rebu-green-dark/70 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 md:right-3 md:top-3 md:h-8 md:w-8">
                <ExternalLink className="h-3 w-3 md:h-4 md:w-4" />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
