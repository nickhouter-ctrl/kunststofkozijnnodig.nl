"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Maximize2 } from "lucide-react";
import { Lightbox } from "./Lightbox";

export function ProjectGallery({
  images,
  title,
}: {
  images: string[];
  title?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {images.map((img, i) => (
          <motion.button
            key={`${img}-${i}`}
            type="button"
            onClick={() => setOpenIndex(i)}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: i * 0.05, duration: 0.5, ease: "easeOut" }}
            whileHover={{ y: -4 }}
            className={`group relative overflow-hidden rounded-2xl bg-rebu-green-dark/40 ring-1 ring-white/15 transition-shadow hover:shadow-2xl ${
              i === 0 ? "col-span-2 row-span-2 md:col-span-2 md:row-span-2 aspect-square" : "aspect-square"
            }`}
          >
            <Image
              src={img}
              alt={`${title ?? "Project"} foto ${i + 1}`}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-rebu-green-dark/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
              <Maximize2 className="h-4 w-4" />
            </div>
          </motion.button>
        ))}
      </div>

      <Lightbox
        images={images}
        openIndex={openIndex}
        onClose={() => setOpenIndex(null)}
        title={title}
      />
    </>
  );
}
