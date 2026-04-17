"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Leaf, TrendingDown, Clock, Euro, Info } from "lucide-react";

type CurrentGlass = "enkel" | "dubbel" | "hr";
type NewGlass = "hr++" | "triple";
type HouseType = "tussenwoning" | "hoekwoning" | "2-onder-1-kap" | "vrijstaand";

const M2_PER_KOZIJN = 1.5;
const GAS_PRICE = 0.14;
const DEGREE_HOURS = 72_000;
const CO2_PER_KWH = 0.204;
const ISDE_PER_M2 = 62;
const COST_PER_M2 = 800;

const uValues: Record<string, number> = {
  enkel: 5.8, dubbel: 2.8, hr: 1.6, "hr++": 1.0, triple: 0.6,
};

function calculate(kozijnen: number, current: CurrentGlass, newGlass: NewGlass) {
  const m2 = kozijnen * M2_PER_KOZIJN;
  const deltaU = uValues[current] - uValues[newGlass];
  if (deltaU <= 0) return { euros: 0, co2: 0, isde: 0, payback: 0, m2 };
  const kwhSaved = (deltaU * m2 * DEGREE_HOURS) / 1000;
  const euros = Math.round(kwhSaved * GAS_PRICE);
  const co2 = Math.round(kwhSaved * CO2_PER_KWH);
  const isde = Math.round(m2 * ISDE_PER_M2);
  const netCost = m2 * COST_PER_M2 - isde;
  const payback = euros > 0 ? Math.round((netCost / euros) * 10) / 10 : 0;
  return { euros, co2, isde, payback, m2 };
}

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
  const [kozijnen, setKozijnen] = useState(8);
  const [current, setCurrent] = useState<CurrentGlass>("dubbel");
  const [newGlass, setNewGlass] = useState<NewGlass>("hr++");
  const [houseType, setHouseType] = useState<HouseType>("tussenwoning");

  const result = calculate(kozijnen, current, newGlass);

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
            {/* Aantal kozijnen - slider + number */}
            <div>
              <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Aantal kozijnen
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={1}
                  max={40}
                  value={kozijnen}
                  onChange={(e) => setKozijnen(Number(e.target.value))}
                  className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-rebu-stone accent-rebu-green"
                />
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={kozijnen}
                  onChange={(e) => setKozijnen(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 rounded-xl border border-rebu-stone bg-white px-3 py-2 text-center font-display text-lg font-semibold text-rebu-charcoal focus:border-rebu-green focus:outline-none"
                />
              </div>
            </div>

            {/* Huidig glastype - toggle buttons */}
            <div>
              <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Huidig glastype
              </label>
              <div className="flex gap-2">
                <ToggleButton label="Enkel glas" selected={current === "enkel"} onClick={() => setCurrent("enkel")} />
                <ToggleButton label="Dubbel glas" selected={current === "dubbel"} onClick={() => setCurrent("dubbel")} />
                <ToggleButton label="HR glas" selected={current === "hr"} onClick={() => setCurrent("hr")} />
              </div>
            </div>

            {/* Nieuw glastype - toggle buttons */}
            <div>
              <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Nieuw glastype
              </label>
              <div className="flex gap-2">
                <ToggleButton label="HR++" selected={newGlass === "hr++"} onClick={() => setNewGlass("hr++")} />
                <ToggleButton label="Triple glas" selected={newGlass === "triple"} onClick={() => setNewGlass("triple")} />
              </div>
            </div>

            {/* Woningtype - toggle buttons 2x2 */}
            <div>
              <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Woningtype
              </label>
              <div className="grid grid-cols-2 gap-2">
                <ToggleButton label="Tussenwoning" selected={houseType === "tussenwoning"} onClick={() => setHouseType("tussenwoning")} />
                <ToggleButton label="Hoekwoning" selected={houseType === "hoekwoning"} onClick={() => setHouseType("hoekwoning")} />
                <ToggleButton label="Twee-onder-een-kap" selected={houseType === "2-onder-1-kap"} onClick={() => setHouseType("2-onder-1-kap")} />
                <ToggleButton label="Vrijstaand" selected={houseType === "vrijstaand"} onClick={() => setHouseType("vrijstaand")} />
              </div>
            </div>
          </div>

          {/* Right: results (always visible) */}
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
                <p className="mt-3 font-display text-3xl font-bold text-rebu-charcoal">€{result.euros}</p>
                <p className="mt-1 text-xs text-neutral-500">per jaar op energie</p>
              </div>

              <div className="rounded-2xl border border-rebu-stone bg-white p-5">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rebu-green/10 text-rebu-green">
                    <Leaf className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">CO₂ besparing</span>
                </div>
                <p className="mt-3 font-display text-3xl font-bold text-rebu-charcoal">{result.co2} kg</p>
                <p className="mt-1 text-xs text-neutral-500">minder CO₂ per jaar</p>
              </div>

              <div className="rounded-2xl border border-rebu-stone bg-white p-5">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rebu-green/10 text-rebu-green">
                    <Clock className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Terugverdientijd</span>
                </div>
                <p className="mt-3 font-display text-3xl font-bold text-rebu-charcoal">{result.payback} jaar</p>
                <p className="mt-1 text-xs text-neutral-500">incl. ISDE subsidie</p>
              </div>

              <div className="rounded-2xl border border-rebu-stone bg-white p-5">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rebu-green/10 text-rebu-green">
                    <TrendingDown className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">ISDE subsidie</span>
                </div>
                <p className="mt-3 font-display text-3xl font-bold text-rebu-charcoal">€{result.isde}</p>
                <p className="mt-1 text-xs text-neutral-500">{kozijnen} kozijnen × {M2_PER_KOZIJN} m² × €{ISDE_PER_M2}/m²</p>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-5 flex items-start gap-3 rounded-2xl bg-rebu-green/5 p-4 text-sm ring-1 ring-rebu-green/15">
              <Info className="mt-0.5 h-4 w-4 flex-none text-rebu-green" />
              <div>
                <p className="font-semibold text-rebu-charcoal">Disclaimer</p>
                <p className="mt-1 text-neutral-600">
                  Deze berekening is een indicatie op basis van gemiddelden. De werkelijke besparing hangt af van je specifieke situatie (isolatie, stookgedrag, gasprijs). ISDE-subsidiebedragen zijn indicatief — check{" "}
                  <a href="https://www.rvo.nl/subsidie-en-financieringswijzer/isde" target="_blank" rel="noopener noreferrer" className="text-rebu-green underline">rvo.nl</a>{" "}
                  voor actuele tarieven. Subsidie geldt alleen voor bestaande woningen.
                </p>
              </div>
            </div>

            {/* CTA */}
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
