import type { Metadata, Viewport } from "next";
import { Montserrat, Cormorant } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { SiteChrome } from "@/components/SiteChrome";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { site } from "@/lib/site";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});
const cormorant = Cormorant({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600"],
});

// Viewport hoort een aparte export te zijn; binnen `metadata` wordt hij door
// Next.js genegeerd. themeColor kleurt de browserbalk op mobiel.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b3d2e",
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  keywords: [
    "kunststof kozijnen",
    "kozijnen op maat",
    "kozijnen Wormerveer",
    "kozijnen Zaanstreek",
    "schuifpuien",
    "kunststof deuren",
    "Schüco",
    "Aluplast",
    "Gealan",
  ],
  authors: [{ name: site.name }],
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: site.url,
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    // Geen `images` hier: die komen uit app/opengraph-image.jpg. Next.js leest
    // de echte afmetingen uit het bestand, dus ze kunnen niet meer scheelen —
    // hiervoor stond hero-main.jpg (2560x1707) opgegeven als 1200x630.
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  // Geen canonical hier: die geldt anders voor élke pagina die er zelf geen
  // zet, waardoor alle subpagina's de homepage als canoniek aanwijzen.
  // Elke pagina zet zijn eigen canonical via `alternates`.
  icons: { icon: "/logos/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: site.name,
    image: `${site.url}/logos/logo-kkn.png`,
    "@id": site.url,
    url: site.url,
    telephone: site.phone,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      postalCode: site.address.postalCode,
      addressLocality: site.address.city,
      addressCountry: "NL",
    },
    geo: { "@type": "GeoCoordinates", latitude: 52.50847, longitude: 4.78471 },
    priceRange: "€€",
  };

  return (
    <html lang="nl" className={`${montserrat.variable} ${cormorant.variable}`}>
      <body className="font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <GoogleAnalytics />
        {/* De configurator draait als eigen werkomgeving, zonder sitemenu. */}
        <SiteChrome voettekst={<Footer />}>{children}</SiteChrome>
      </body>
    </html>
  );
}
