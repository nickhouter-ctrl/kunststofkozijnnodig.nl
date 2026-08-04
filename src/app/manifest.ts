import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — ${site.tagline}`,
    short_name: "Kozijnnodig",
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#f7f5f0", // rebu-cream
    theme_color: "#0b3d2e", // rebu-green-dark
    icons: [
      { src: "/logos/favicon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/logos/favicon-32.png", sizes: "32x32", type: "image/png" },
      { src: "/logos/favicon.png", sizes: "192x192", type: "image/png" },
    ],
  };
}
