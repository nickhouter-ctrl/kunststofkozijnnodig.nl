import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { CTASection } from "@/components/CTASection";

export const metadata: Metadata = {
  title: "Kleuren kunststof kozijnen — alle opties op een rij",
  description:
    "Bekijk alle beschikbare kleuren voor kunststof kozijnen: houtlook, RAL-kleuren, glad en met nerf. Binnenkant en buitenkant apart te kiezen.",
};

type ColorItem = {
  code: string;
  name: string;
  type: "Houtprint" | "RAL" | "Zandstructuur" | "Brush" | "Glad";
  structure: "Nerf" | "Glad" | "Zandstructuur / Glad" | "Brush (recht)";
  hex: string;
};

const houtlookColors: ColorItem[] = [
  { code: "AP01", name: "Eiken Speciaal", type: "Houtprint", structure: "Nerf", hex: "#8B7355" },
  { code: "AP02", name: "Natuur Eiken", type: "Houtprint", structure: "Nerf", hex: "#C4A96A" },
  { code: "AP05", name: "Mahonie", type: "Houtprint", structure: "Nerf", hex: "#4A2028" },
  { code: "AP06", name: "Donker Eiken", type: "Houtprint", structure: "Nerf", hex: "#3E2723" },
  { code: "AP11", name: "Douglas Spar", type: "Houtprint", structure: "Nerf", hex: "#B5651D" },
  { code: "AP15", name: "Oregon", type: "Houtprint", structure: "Nerf", hex: "#D4901F" },
  { code: "AP19", name: "Turner Oak Malt", type: "Houtprint", structure: "Nerf", hex: "#A98B60" },
  { code: "AP20", name: "Sheffield Oak Alpine", type: "Houtprint", structure: "Nerf", hex: "#E8DED0" },
  { code: "AP21", name: "Sheffield Oak Concrete", type: "Houtprint", structure: "Nerf", hex: "#B0A89A" },
  { code: "AP22", name: "Oak Toffee", type: "Houtprint", structure: "Nerf", hex: "#6B4C30" },
  { code: "AP23", name: "Gouden Eik", type: "Houtprint", structure: "Nerf", hex: "#C87B20" },
  { code: "AP25", name: "Palissander / Zwart Bruin", type: "Houtprint", structure: "Nerf", hex: "#1C1C1C" },
  { code: "AP27", name: "Moer", type: "Houtprint", structure: "Nerf", hex: "#5C3A1E" },
  { code: "AP28", name: "Walnoot Terra", type: "Houtprint", structure: "Nerf", hex: "#C06020" },
  { code: "AP29", name: "Walnoot Amaretto", type: "Houtprint", structure: "Nerf", hex: "#8B4513" },
  { code: "AP52", name: "Berk", type: "Houtprint", structure: "Nerf", hex: "#D4B896" },
];

const ralColors: ColorItem[] = [
  { code: "AP30", name: "Dennen Groen", type: "RAL", structure: "Nerf", hex: "#1E3A2B" },
  { code: "AP32", name: "Donker Rood", type: "RAL", structure: "Nerf", hex: "#8B1A1A" },
  { code: "AP34", name: "Venster Grijs", type: "RAL", structure: "Nerf", hex: "#9DA1A1" },
  { code: "AP40", name: "Antraciet Grijs", type: "RAL", structure: "Nerf", hex: "#3E4347" },
  { code: "AP41", name: "Staal Blauw", type: "RAL", structure: "Nerf", hex: "#1B2A3D" },
  { code: "AP43", name: "Mos Groen", type: "RAL", structure: "Nerf", hex: "#005E4F" },
  { code: "AP44", name: "Gebroken Wit", type: "RAL", structure: "Nerf", hex: "#E8E0D0" },
  { code: "AP47", name: "Briljant Blauw", type: "RAL", structure: "Nerf", hex: "#2E7BAF" },
  { code: "AP50", name: "Crème Wit", type: "RAL", structure: "Nerf", hex: "#FFF8E1" },
];

const grijsColors: ColorItem[] = [
  { code: "AP60", name: "Antraciet Grijs", type: "Zandstructuur", structure: "Zandstructuur / Glad", hex: "#484D50" },
  { code: "AP61", name: "Zilver Grijs", type: "Zandstructuur", structure: "Zandstructuur / Glad", hex: "#9AA0A4" },
  { code: "AP62", name: "Basalt Grijs", type: "Zandstructuur", structure: "Zandstructuur / Glad", hex: "#7A7D7A" },
  { code: "AP63", name: "Geborsteld Aluminium / Zilver", type: "Brush", structure: "Brush (recht)", hex: "#C0C4C0" },
  { code: "AP65", name: "Kwarts Grijs", type: "Zandstructuur", structure: "Zandstructuur / Glad", hex: "#6B6E60" },
  { code: "AP69", name: "Zwart Grijs", type: "Zandstructuur", structure: "Zandstructuur / Glad", hex: "#2C3035" },
];

const standardColors = [
  { name: "Wit (RAL 9016)", hex: "#FFFFFF", border: true, structure: "Glad (zonder folie)" },
  { name: "Crème Wit (RAL 9001)", hex: "#FFF5E0", border: false, structure: "Glad (zonder folie)" },
  { name: "Zwart (RAL 9005)", hex: "#0D0D0D", border: false, structure: "Glad / nerf" },
];

function ColorCard({ color }: { color: ColorItem }) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-rebu-stone bg-white transition-all hover:shadow-soft">
      <div
        className="h-24 w-full transition-transform duration-500 group-hover:scale-110"
        style={{ backgroundColor: color.hex }}
      />
      <div className="p-4">
        <p className="text-xs font-bold text-rebu-green">{color.code}</p>
        <p className="mt-1 font-semibold text-rebu-charcoal">{color.name}</p>
        <p className="mt-1 text-xs text-neutral-500">{color.structure}</p>
      </div>
    </div>
  );
}

export default function KleurenPage() {
  return (
    <>
      <PageHero
        eyebrow="Kleuren"
        title="Alle kleuren op een rij."
        description="Bijna elke kleur is mogelijk — met en zonder houtnerf. Binnenkant en buitenkant apart te kiezen. Hieronder het volledige kleurenoverzicht."
        image="/images/villa-kozijn.jpg"
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Kleuren", href: "/kleuren" },
        ]}
      />

      {/* Standard colors */}
      <section className="section bg-white">
        <div className="container-rebu">
          <span className="section-eyebrow">Standaard</span>
          <h2 className="section-title mt-3">
            Standaard kleuren <span className="italic text-rebu-green">zonder folie</span>
          </h2>
          <p className="mt-4 text-neutral-600">Glad profiel zonder nerf — de meest gekozen basiskleuren.</p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {standardColors.map((c) => (
              <div key={c.name} className="overflow-hidden rounded-2xl border border-rebu-stone bg-white">
                <div
                  className="h-32 w-full"
                  style={{ backgroundColor: c.hex, border: c.border ? "1px solid #e0e0e0" : "none" }}
                />
                <div className="p-5">
                  <p className="font-display text-lg font-semibold text-rebu-charcoal">{c.name}</p>
                  <p className="mt-1 text-sm text-neutral-500">{c.structure}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Houtlook */}
      <section className="section bg-rebu-cream">
        <div className="container-rebu">
          <span className="section-eyebrow">Houtlook</span>
          <h2 className="section-title mt-3">
            Houtlook kleuren <span className="italic text-rebu-green">met nerf</span>
          </h2>
          <p className="mt-4 text-neutral-600">
            De warme uitstraling van echt hout, maar dan volledig onderhoudsvrij. Alle houtlook kleuren hebben een natuurlijke nerfstructuur.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
            {houtlookColors.map((c) => (
              <ColorCard key={c.code} color={c} />
            ))}
          </div>
        </div>
      </section>

      {/* RAL kleuren */}
      <section className="section bg-white">
        <div className="container-rebu">
          <span className="section-eyebrow">RAL kleuren</span>
          <h2 className="section-title mt-3">
            RAL kleuren <span className="italic text-rebu-green">met nerf</span>
          </h2>
          <p className="mt-4 text-neutral-600">
            Uni-kleuren met een subtiele nerfstructuur. Van klassiek groen tot modern staalblauw.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {ralColors.map((c) => (
              <ColorCard key={c.code} color={c} />
            ))}
          </div>
        </div>
      </section>

      {/* Grijs / Aluminium */}
      <section className="section bg-rebu-cream">
        <div className="container-rebu">
          <span className="section-eyebrow">Grijs & aluminium</span>
          <h2 className="section-title mt-3">
            Grijs tinten & <span className="italic text-rebu-green">aluminium look</span>
          </h2>
          <p className="mt-4 text-neutral-600">
            Moderne grijstinten met zandstructuur of glad oppervlak. Inclusief geborsteld aluminium voor een industriële uitstraling.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {grijsColors.map((c) => (
              <ColorCard key={c.code} color={c} />
            ))}
          </div>
        </div>
      </section>

      {/* Info */}
      <section className="section bg-white">
        <div className="container-rebu max-w-3xl">
          <div className="rounded-3xl bg-rebu-green p-10 text-white">
            <h2 className="font-display text-3xl font-semibold md:text-4xl">
              Binnenkant en buitenkant apart kiezen
            </h2>
            <p className="mt-4 text-white/80">
              Bij al onze kozijnen kun je de binnenkant en buitenkant in een andere kleur laten uitvoeren.
              Bijvoorbeeld: antraciet aan de buitenzijde voor een strakke look, en wit aan de binnenzijde passend bij je interieur.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-white/90">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-white/60" />
                Alle kleuren beschikbaar voor Aluplast, Schüco en Gealan profielen
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-white/60" />
                Binnenkant en buitenkant los te kiezen
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-white/60" />
                Kleuren weergave op scherm kan afwijken — vraag een staal aan
              </li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/offerte"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-rebu-green-dark hover:bg-rebu-cream"
              >
                Offerte aanvragen <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20"
              >
                Kleurstaal aanvragen
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
