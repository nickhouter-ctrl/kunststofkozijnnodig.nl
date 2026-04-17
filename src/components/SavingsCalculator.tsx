"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Leaf, TrendingDown, Euro, Info } from "lucide-react";

type GlassOld = "enkel" | "dubbel" | "hr";
type GlassNew = "hrpp" | "triple";
type HouseType = "tussenwoning" | "hoekwoning" | "twee-onder-een-kap" | "vrijstaand";

// Jaarlijkse besparing per kozijn in EUR (marktgemiddelde)
const savingsPerKozijn: Record<GlassOld, Record<GlassNew, number>> = {
  enkel:  { hrpp: 45, triple: 60 },
  dubbel: { hrpp: 22, triple: 35 },
  hr:     { hrpp: 10, triple: 18 },
};

// CO2: ~1.8 kg CO2 per m³ gas, ~0.03 m³ gas per €1 bespaard (gasprijs ~€1.30/m³)
const CO2_PER_EURO = 1.4;

// Woningtype multiplier (meer geveloppervlak = meer warmteverlies)
const houseMultiplier: Record<HouseType, number> = {
  tussenwoning: 0.8,
  hoekwoning: 1.0,
  "twee-onder-een-kap": 1.1,
  vrijstaand: 1.3,
};

// ISDE subsidie per m² glas (indicatie 2026, check rvo.nl)
const ISDE_PER_M2: Record<GlassNew, number> = {
  hrpp: 62,    // U-waarde ≤ 1.2
  triple: 93,  // U-waarde ≤ 0.7
};

const AVG_M2_PER_KOZIJN = 1.5;

// Gemiddelde investering per kozijn (alleen levering)
const investmentPerKozijn: Record<GlassNew, number> = {
  hrpp: 750,
  triple: 950,
};

function ToggleButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-all ${
        selected
          ? "bg-rebu-green text-white shadow-md"
          : "bg-rebu-stone/50 text-rebu-charcoal hover:bg-rebu-stone"
      }`}
    >
      {label}
    </button>
  );
}

export function SavingsCalculator() {
  const [count, setCount] = useState(8);
  const [oldGlass, setOldGlass] = useState<GlassOld>("dubbel");
  const [newGlass, setNewGlass] = useState<GlassNew>("hrpp");
  const [houseType, setHouseType] = useState<HouseType>("tussenwoning");

  const results = useMemo(() => {
    const base = savingsPerKozijn[oldGlass][newGlass];
    const mult = houseMultiplier[houseType];
    const yearlySaving = Math.round(base * count * mult);
    const co2 = Math.round(yearlySaving * CO2_PER_EURO);
    const subsidie = Math.round(count * AVG_M2_PER_KOZIJN * ISDE_PER_M2[newGlass]);
    const totalInvestment = count * investmentPerKozijn[newGlass] - subsidie;
    const payback = yearlySaving > 0 ? +(totalInvestment / yearlySaving).toFixed(1) : 0;
    return { yearlySaving, co2, payback, subsidie };
  }, [count, oldGlass, newGlass, houseType]);

  return (
    <section className="section bg-white">
      <div className="container-rebu">
        <div className="text-center">
          <span className="section-eyebrow">Calculator</span>
          <h2 className="section-title mt-3">
            Bereken jouw <span className="italic text-rebu-green">besparing.</span>
          </h2>
          <p className="mt-4 text-neutral-600">
            Ontdek hoeveel je bespaart op energiekosten door te investeren in nieuwe kozijnen met hoogwaardig glas. Inclusief ISDE-subsidie berekening.
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          {/* Left: inputs */}
          <div className="space-y-8">
            <div>
              <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Aantal kozijnen
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={1}
                  max={40}
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-rebu-stone accent-rebu-green"
                />
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={count}
                  onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 rounded-xl border border-rebu-stone bg-white px-3 py-2 text-center font-display text-lg font-semibold text-rebu-charcoal focus:border-rebu-green focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Huidig glastype
              </label>
              <div className="flex gap-2">
                <ToggleButton label="Enkel glas" selected={oldGlass === "enkel"} onClick={() => setOldGlass("enkel")} />
                <ToggleButton label="Dubbel glas" selected={oldGlass === "dubbel"} onClick={() => setOldGlass("dubbel")} />
                <ToggleButton label="HR glas" selected={oldGlass === "hr"} onClick={() => setOldGlass("hr")} />
              </div>
            </div>

            <div>
              <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Nieuw glastype
              </label>
              <div className="flex gap-2">
                <ToggleButton label="HR++" selected={newGlass === "hrpp"} onClick={() => setNewGlass("hrpp")} />
                <ToggleButton label="Triple glas" selected={newGlass === "triple"} onClick={() => setNewGlass("triple")} />
              </div>
            </div>

            <div>
              <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Woningtype
              </label>
              <div className="grid grid-cols-2 gap-2">
                <ToggleButton label="Tussenwoning" selected={houseType === "tussenwoning"} onClick={() => setHouseType("tussenwoning")} />
                <ToggleButton label="Hoekwoning" selected={houseType === "hoekwoning"} onClick={() => setHouseType("hoekwoning")} />
                <ToggleButton label="Twee-onder-een-kap" selected={houseType === "twee-onder-een-kap"} onClick={() => setHouseType("twee-onder-een-kap")} />
                <ToggleButton label="Vrijstaand" selected={houseType === "vrijstaand"} onClick={() => setHouseType("vrijstaand")} />
              </div>
            </div>
          </div>

          {/* Right: results */}
          <div>
            <h3 className="font-display text-2xl font-semibold text-rebu-charcoal md:text-3xl">
              Jouw geschatte besparing
            </h3>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-rebu-stone bg-white p-5">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rebu-green/10 text-rebu-green">
                    <Euro className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Jaarlijkse besparing</span>
                </div>
                <p className="mt-3 font-display text-3xl font-bold text-rebu-charcoal">€{results.yearlySaving}</p>
                <p className="mt-1 text-xs text-neutral-500">per jaar op energie</p>
              </div>

              <div className="rounded-2xl border border-rebu-stone bg-white p-5">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rebu-green/10 text-rebu-green">
                    <Leaf className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">CO₂ besparing</span>
                </div>
                <p className="mt-3 font-display text-3xl font-bold text-rebu-charcoal">{results.co2} kg</p>
                <p className="mt-1 text-xs text-neutral-500">minder CO₂ per jaar</p>
              </div>

              <div className="rounded-2xl border border-rebu-stone bg-white p-5">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rebu-green/10 text-rebu-green">
                    <TrendingDown className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">ISDE subsidie</span>
                </div>
                <p className="mt-3 font-display text-3xl font-bold text-rebu-charcoal">€{results.subsidie}</p>
                <p className="mt-1 text-xs text-neutral-500">{count} kozijnen × {AVG_M2_PER_KOZIJN} m² × €{ISDE_PER_M2[newGlass]}/m²</p>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-5 flex items-start gap-3 rounded-2xl bg-rebu-green/5 p-4 text-sm ring-1 ring-rebu-green/15">
              <Info className="mt-0.5 h-4 w-4 flex-none text-rebu-green" />
              <div>
                <p className="font-semibold text-rebu-charcoal">Disclaimer</p>
                <p className="mt-1 text-neutral-600">
                  Deze berekening is een indicatie op basis van gemiddelden. De werkelijke besparing hangt af van je specifieke situatie (isolatie, stookgedrag, gasprijs). ISDE-subsidiebedragen zijn indicatief — check{" "}
                  <a href="https://www.rvo.nl/subsidies-financiering/isde" target="_blank" rel="noopener noreferrer" className="text-rebu-green underline">rvo.nl</a>{" "}
                  voor actuele tarieven. Subsidie geldt alleen voor bestaande woningen.
                </p>
              </div>
            </div>

            <Link
              href="/offerte"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-rebu-green px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-rebu-green-dark"
            >
              Offerte aanvragen <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-2 text-center text-xs text-neutral-500">Vrijblijvend en gratis — binnen 1 werkdag reactie</p>
          </div>
        </div>
      </div>
    </section>
  );
}
