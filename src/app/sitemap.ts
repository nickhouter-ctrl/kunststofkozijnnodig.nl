import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { cities } from "@/lib/cities";
import { projects } from "@/lib/projects";
import { brands } from "@/lib/brands";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url;
  const now = new Date();

  const pages = [
    { url: "", priority: 1 },
    { url: "/particulier", priority: 0.9 },
    { url: "/zakelijk", priority: 0.9 },
    { url: "/producten", priority: 0.9 },
    { url: "/producten/kozijnen", priority: 0.85 },
    { url: "/producten/deuren", priority: 0.85 },
    { url: "/producten/schuifpuien", priority: 0.85 },
    { url: "/projecten", priority: 0.8 },
    { url: "/prijzen", priority: 0.9 },
    { url: "/merken", priority: 0.85 },
    { url: "/kleuren", priority: 0.8 },
    { url: "/besparing", priority: 0.75 },
    { url: "/veelgestelde-vragen", priority: 0.85 },
    { url: "/over-ons", priority: 0.7 },
    { url: "/contact", priority: 0.8 },
    { url: "/offerte", priority: 0.95 },
    { url: "/privacyverklaring", priority: 0.3 },
    { url: "/algemene-voorwaarden", priority: 0.3 },
  ];

  const cityPages = cities.map((c) => ({
    url: `/kozijnen/${c.slug}`,
    priority: 0.8,
  }));

  const projectPages = projects.map((p) => ({
    url: `/projecten/${p.slug}`,
    priority: 0.7,
  }));

  const brandPages = brands.map((b) => ({
    url: `/merken/${b.slug}`,
    priority: 0.75,
  }));

  return [...pages, ...cityPages, ...projectPages, ...brandPages].map((p) => ({
    url: `${base}${p.url}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: p.priority,
  }));
}
