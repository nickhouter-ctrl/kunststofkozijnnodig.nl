"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Leaf, TrendingDown, Clock, Euro, Info } from "lucide-react";

type CurrentGlass = "enkel" | "dubbel" | "hr";
type NewGlass = "hr++" | "triple";
type HouseType = "tussenwoning" | "hoekwoning" | "2-onder-1-kap" | "vrijstaand";

const currentGlassLabels: Record<CurrentGlass, string> = {
  enkel: "Enkelglas",
  dubbel: "Oud dubbelglas",
  hr: "HR-glas",
};

const newGlassLabels: Record<NewGlass, string> = {
  "hr++": "HR++ glas",
  triple: "Triple HR+++ glas",
};

const houseLabels: Record<HouseType, string> = {
  tussenwoning: "Tussenwoning",
  hoekwoning: "Hoekwoning",
  "2-onder-1-kap": "Twee-onder-een-kap",
  vrijstaand: "Vrijstaande woning",
};

// U-values (W/m²K)
const uValues: Record<CurrentGlass | NewGlass, number> = {
  enkel: 5.8,
  dubbel: 2.8,
  hr: 1.6,
  "hr++": 1.0,
  triple: 0.6,
};

// Average m² glass per kozijn
const M2_PER_KOZIJN = 1.5;
// Gas price EUR/kWh
const GAS_PRICE = 0.14;
// Degree hours Netherlands
const DEGREE_HOURS = 72_000;
// CO2 per kWh gas
const CO2_PER_KWH = 0.204;
// ISDE subsidie per m² glas (actueel RVO tarief 2026)
const ISDE_PER_M2 = 62;
// Average cost per m² kozijn (for payback calc)
const COST_PER_M2 = 800;

function calculate(kozijnen: number, current: CurrentGlass, newGlass: NewGlass) {
  const m2 = kozijnen * M2_PER_KOZIJN;
  const deltaU = uValues[current] - uValues[newGlass];
  if (deltaU <= 0) return { euros: 0, co2: 0, kwh: 0, isde: 0, payback: 0, m2 };

  const kwhSaved = (deltaU * m2 * DEGREE_HOURS) / 1000;
  const euros = Math.round(kwhSaved * GAS_PRICE);
  const co2 = Math.round(kwhSaved * CO2_PER_KWH);
  const isde = Math.round(m2 * ISDE_PER_M2);
  const totalCost = m2 * COST_PER_M2;
  const netCost = totalCost - isde;
  const payback = euros > 0 ? Math.round((netCost / euros) * 10) / 10 : 0;

  return { euros, co2, kwh: Math.round(kwhSaved), isde, payback, m2 };
}

export function SavingsCalculator() {
  const [kozijnen, setKozijnen] = useState(10);
  const [current, setCurrent] = useState<CurrentGlass>("dubbel");
  const [newGlass, setNewGlass] = useState<NewGlass>("hr++");
  const [houseType, setHouseType] = useState<HouseType>("tussenwoning");
  const [calculated, setCalculated] = useState(false);

  const result = calculate(kozijnen, current, newGlass);

  return (
    <section className="section bg-white">
      <div className="container-rebu max-w-4xl">
        <div className="text-center">
          <span className="section-eyebrow">Calculator</span>
          <h2 className="section-title mt-3">
            Bereken jouw <span className="italic text-rebu-green">besparing.</span>
          </h2>
          <p className="mt-4 text-neutral-600">
            Ontdek hoeveel je bespaart op energiekosten door te investeren in nieuwe kozijnen met hoogwaardig glas. Inclusief ISDE-subsidie berekening.
          </p>
        </div>

        <div className="mt-12 rounded-3xl border border-rebu-stone bg-rebu-cream p-6 md:p-10">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Aantal kozijnen */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Aantal kozijnen
              </label>
              <select
                value={kozijnen}
                onChange={(e) => { setKozijnen(Number(e.target.value)); setCalculated(false); }}
                className="input"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 18, 20, 25, 30].map((n) => (
                  <option key={n} value={n}>{n} kozijnen ({(n * M2_PER_KOZIJN).toFixed(1)} m² glas)</option>
                ))}
              </select>
            </div>

            {/* Huidig glastype */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Huidig glastype
              </label>
              <select
                value={current}
                onChange={(e) => { setCurrent(e.target.value as CurrentGlass); setCalculated(false); }}
                className="input"
              >
                {Object.entries(currentGlassLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            {/* Nieuw glastype */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Nieuw glastype
              </label>
              <select
                value={newGlass}
                onChange={(e) => { setNewGlass(e.target.value as NewGlass); setCalculated(false); }}
                className="input"
              >
                {Object.entries(newGlassLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            {/* Woningtype */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Woningtype
              </label>
              <select
                value={houseType}
                onChange={(e) => { setHouseType(e.target.value as HouseType); setCalculated(false); }}
                className="input"
              >
                {Object.entries(houseLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => setCalculated(true)}
            className="mt-8 w-full rounded-xl bg-rebu-green px-6 py-4 text-sm font-semibold text-white transition-all hover:bg-rebu-green-dark"
          >
            Bereken besparing
          </button>
        </div>

        {/* Results */}
        {calculated && (
          <div className="mt-8 animate-[slideUp_0.5s_ease-out]">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-rebu-stone bg-rebu-cream p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rebu-green/10 text-rebu-green">
                  <Euro className="h-6 w-6" />
                </div>
                <p className="mt-4 font-display text-3xl font-bold text-rebu-green">€{result.euros}</p>
                <p className="mt-1 text-xs text-neutral-500">besparing per jaar</p>
              </div>

              <div className="rounded-2xl border border-rebu-stone bg-rebu-cream p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rebu-green/10 text-rebu-green">
                  <Leaf className="h-6 w-6" />
                </div>
                <p className="mt-4 font-display text-3xl font-bold text-rebu-charcoal">{result.co2} kg</p>
                <p className="mt-1 text-xs text-neutral-500">CO₂ reductie per jaar</p>
              </div>

              <div className="rounded-2xl border border-rebu-stone bg-rebu-cream p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rebu-green/10 text-rebu-green">
                  <Clock className="h-6 w-6" />
                </div>
                <p className="mt-4 font-display text-3xl font-bold text-rebu-charcoal">{result.payback} jaar</p>
                <p className="mt-1 text-xs text-neutral-500">terugverdientijd (incl. subsidie)</p>
              </div>

              <div className="rounded-2xl border border-rebu-stone bg-rebu-cream p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rebu-green/10 text-rebu-green">
                  <TrendingDown className="h-6 w-6" />
                </div>
                <p className="mt-4 font-display text-3xl font-bold text-rebu-green">€{result.isde}</p>
                <p className="mt-1 text-xs text-neutral-500">ISDE subsidie</p>
              </div>
            </div>

            {/* ISDE info */}
            <div className="mt-6 flex items-start gap-3 rounded-2xl bg-rebu-green/5 p-5 text-sm ring-1 ring-rebu-green/20">
              <Info className="mt-0.5 h-4 w-4 flex-none text-rebu-green" />
              <div>
                <p className="font-semibold text-rebu-green-dark">ISDE subsidie: €{ISDE_PER_M2} per m² glas</p>
                <p className="mt-1 text-neutral-600">
                  Berekening: {kozijnen} kozijnen × {M2_PER_KOZIJN} m² × €{ISDE_PER_M2}/m² = €{result.isde}. Kijk op{" "}
                  <a href="https://www.rvo.nl/subsidie-en-financieringswijzer/isde" target="_blank" rel="noopener noreferrer" className="text-rebu-green underline">rvo.nl</a>{" "}
                  voor de actuele tarieven.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-8 text-center">
              <Link
                href="/offerte"
                className="inline-flex items-center gap-2 rounded-full bg-rebu-green px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-rebu-green-dark"
              >
                Offerte aanvragen <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="mt-3 text-xs text-neutral-500">Vrijblijvend en gratis — binnen 1 werkdag reactie</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
