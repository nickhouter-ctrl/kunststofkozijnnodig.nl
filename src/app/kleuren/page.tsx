import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
  structure: string;
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
  { code: "AP75", name: "Eiken Sheffield Licht", type: "Houtprint", structure: "Nerf", hex: "#E0D5C0" },
  { code: "AP94", name: "Eiken Sheffield Donker", type: "Houtprint", structure: "Nerf", hex: "#A08050" },
  { code: "AP95", name: "Winchester", type: "Houtprint", structure: "Nerf", hex: "#C07838" },
  { code: "AP109", name: "Platinum", type: "Houtprint", structure: "Lichte nerf", hex: "#C0B8AE" },
  { code: "AP110", name: "Goud", type: "Houtprint", structure: "Lichte nerf", hex: "#8C7E60" },
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
  { code: "AP70", name: "Beton Grijs", type: "RAL", structure: "Nerf", hex: "#7D7A6E" },
  { code: "AP71", name: "Agaat Grijs", type: "RAL", structure: "Nerf", hex: "#B5B8A0" },
  { code: "AP72", name: "Maron Bruin", type: "RAL", structure: "Nerf", hex: "#3E2218" },
  { code: "AP88", name: "Kwarts Grijs", type: "RAL", structure: "Nerf", hex: "#6A6A60" },
  { code: "AP101", name: "Monumenten Blauw", type: "RAL", structure: "Nerf", hex: "#1A1A2E" },
  { code: "AP102", name: "Basalt Grijs", type: "RAL", structure: "Nerf", hex: "#6B7068" },
  { code: "AP113", name: "Donker Groen", type: "RAL", structure: "Nerf (onderbroken)", hex: "#1A2E1A" },
  { code: "AP116", name: "Verkeers Wit", type: "RAL", structure: "Nerf (onderbroken)", hex: "#FAFAE8" },
  { code: "AP117", name: "Monumenten Groen", type: "RAL", structure: "Nerf", hex: "#2A3A2A" },
  { code: "AP121", name: "Zwart Grijs", type: "RAL", structure: "Nerf", hex: "#343840" },
];

const grijsColors: ColorItem[] = [
  { code: "AP60", name: "Antraciet Grijs", type: "Zandstructuur", structure: "Zandstructuur / Glad", hex: "#484D50" },
  { code: "AP61", name: "Zilver Grijs", type: "Zandstructuur", structure: "Zandstructuur / Glad", hex: "#9AA0A4" },
  { code: "AP62", name: "Basalt Grijs", type: "Zandstructuur", structure: "Zandstructuur / Glad", hex: "#7A7D7A" },
  { code: "AP63", name: "Geborsteld Aluminium / Zilver", type: "Brush", structure: "Brush (recht)", hex: "#C0C4C0" },
  { code: "AP65", name: "Kwarts Grijs", type: "Zandstructuur", structure: "Zandstructuur / Glad", hex: "#6B6E60" },
  { code: "AP69", name: "Zwart Grijs", type: "Zandstructuur", structure: "Zandstructuur / Glad", hex: "#2C3035" },
  { code: "AP79", name: "Alux DB 703 / Antraciet Zwart Zilver", type: "Zandstructuur", structure: "Zandstructuur / Glad", hex: "#4A4E50" },
  { code: "AP103", name: "Leisteen Grijs", type: "Zandstructuur", structure: "Zandstructuur / Glad", hex: "#6A6E68" },
  { code: "AP105", name: "Trompet C-32", type: "Zandstructuur", structure: "Zandstructuur / Glad", hex: "#7A7560" },
  { code: "AP106", name: "Jet Black Mat / Zwart", type: "Zandstructuur", structure: "Zandstructuur / Glad", hex: "#0E0E0E" },
  { code: "AP107", name: "Silver Alux", type: "Zandstructuur", structure: "Zandstructuur / Glad", hex: "#A0A0A0" },
  { code: "AP108", name: "Donker Bruin", type: "Brush", structure: "Brush (schuin)", hex: "#5A5050" },
  { code: "AP111", name: "Zilver Blauw", type: "Brush", structure: "Brush (schuin)", hex: "#2A3545" },
  { code: "AP112", name: "Gebroken Wit", type: "Zandstructuur", structure: "Zandstructuur / Glad", hex: "#E8E0D8" },
  { code: "AP115", name: "Grijs Beton", type: "Zandstructuur", structure: "Speciale print", hex: "#A8A090" },
];

const standardColors = [
  { name: "Wit (RAL 9016)", hex: "#FFFFFF", border: true, structure: "Zonder folie" },
  { name: "Crème wit (RAL 9001)", hex: "#FFF5E0", border: false, structure: "Zonder folie" },
];

function ColorCard({ color }: { color: ColorItem }) {
  return (
    <div className="group overflow-hidden border border-ink/10 bg-paper transition-colors hover:border-rebu-green">
      <div
        className="h-24 w-full transition-transform duration-500 group-hover:scale-110"
        style={{ backgroundColor: color.hex }}
      />
      <div className="p-4">
        <p className="text-xs font-bold text-rebu-green">{color.code}</p>
        <p className="mt-1 font-semibold text-ink">{color.name}</p>
        <p className="mt-1 text-xs text-ink-soft">{color.structure}</p>
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

      {/* Merk-kleurencatalogi */}
      <section className="section bg-rebu-cream">
        <div className="container-rebu">
          <span className="section-eyebrow">Decorfolies</span>
          <h2 className="section-title mt-3">
            Volledige <span className="italic text-rebu-green">merkcatalogi</span>
          </h2>
          <p className="mt-4 max-w-2xl text-ink-soft">
            Blader door alle decorfolies per profielmerk — zoek op naam, kleur of artikelnummer en bekijk realistische kleurindrukken.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { merk: "Gealan", href: "/kleuren/gealan", desc: "52 decorfolies van Gealan — het volledige overzicht met houtlook en effen tinten." },
              { merk: "Aluplast", href: "/kleuren/aluplast", desc: "De complete Aluplast-decorfoliecollectie voor kozijnen, deuren en schuifpuien." },
              { merk: "K-Vision", href: "/kleuren/kvision", desc: "77 Kömmerling-decorfolies voor K-Vision — unikleuren, houtprint, metallic en mattex." },
            ].map((b) => (
              <Link
                key={b.merk}
                href={b.href}
                className="group flex flex-col justify-between border border-ink/10 bg-paper p-8 transition-colors hover:border-rebu-green"
              >
                <div>
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-rebu-green">Kleurencatalogus</p>
                  <h3 className="mt-3 font-display text-3xl font-medium text-ink">{b.merk}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">{b.desc}</p>
                </div>
                <span className="mt-8 inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-ink">
                  Bekijk catalogus
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Standard colors */}
      <section className="section bg-white">
        <div className="container-rebu">
          <span className="section-eyebrow">Standaard</span>
          <h2 className="section-title mt-3">
            Standaard <span className="italic text-rebu-green">basiskleuren</span>
          </h2>
          <p className="mt-4 text-ink-soft">De basiskleuren zonder folie. Snelst leverbaar en het meest gekozen.</p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {standardColors.map((c) => (
              <div key={c.name} className="overflow-hidden border border-ink/10 bg-paper">
                <div
                  className="h-32 w-full"
                  style={{ backgroundColor: c.hex, border: c.border ? "1px solid #e0e0e0" : "none" }}
                />
                <div className="p-5">
                  <p className="font-display text-lg font-medium text-ink">{c.name}</p>
                  <p className="mt-1 text-sm text-ink-soft">{c.structure}</p>
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
          <p className="mt-4 text-ink-soft">
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
          <p className="mt-4 text-ink-soft">
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
          <p className="mt-4 text-ink-soft">
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
          <div className="bg-rebu-green-dark p-10 text-white md:p-12">
            <h2 className="font-display text-3xl font-medium md:text-4xl">
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
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/offerte" className="btn-light">
                Offerte aanvragen <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/contact" className="btn-light">
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
