/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "rebukozijnen.nl" },
      { protocol: "https", hostname: "www.instagram.com" },
      { protocol: "https", hostname: "jpjowxgkyjvydzwhalhy.supabase.co" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  async rewrites() {
    return {
      beforeFiles: [
        // Statische kleurencatalogi (public/kleuren/*.html) op schone URL's
        { source: "/kleuren/gealan", destination: "/kleuren/gealan.html" },
        { source: "/kleuren/aluplast", destination: "/kleuren/aluplast.html" },
        { source: "/kleuren/kvision", destination: "/kleuren/kvision.html" },
      ],
    };
  },
};

export default nextConfig;
