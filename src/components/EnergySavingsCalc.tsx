"use client";

import { useState, useEffect, useRef } from "react";
import { Leaf, TrendingDown, ArrowRight, Calculator } from "lucide-react";
import Link from "next/link";

type GlassType = "enkel" | "dubbel" | "hr" | "hr++";
type NewGlassType = "hr++" | "triple";

const glassLabels: Record<GlassType | NewGlassType, string> = {
  enkel: "Enkelglas",
  dubbel: "Oud dubbelglas",
  hr: "HR-glas",
  "hr++": "HR++ glas",
  triple: "Triple HR+++ glas",
};

// U-values (W/m2K) per glass type — approximate industry values
const uValues: Record<GlassType | NewGlassType, number> = {
  enkel: 5.8,
  dubbel: 2.8,
  hr: 1.6,
  "hr++": 1.0,
  triple: 0.6,
};

// Gas price in EUR per kWh (Dutch average)
const GAS_PRICE_EUR_KWH = 0.14;
// Heating degree hours per year (Netherlands average ~72,000 Kh)
const DEGREE_HOURS = 72_000;
// CO2 per kWh gas (kg)
const CO2_PER_KWH = 0.204;

function calcSavings(m2: number, current: GlassType, newGlass: NewGlassType) {
  const uOld = uValues[current];
  const uNew = uValues[newGlass];
  const deltaU = uOld - uNew;
  if (deltaU <= 0) return { euros: 0, co2: 0, kwh: 0 };

  // Heat loss saved: deltaU * m2 * degree hours / 1000 (kWh)
  const kwhSaved = (deltaU * m2 * DEGREE_HOURS) / 1000;
  const euros = Math.round(kwhSaved * GAS_PRICE_EUR_KWH);
  const co2 = Math.round(kwhSaved * CO2_PER_KWH);

  return { euros, co2, kwh: Math.round(kwhSaved) };
}

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    const start = display;
    const diff = value - start;
    if (diff === 0) return;
    const duration = 600;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + diff * eased));
      if (progress < 1) {
        ref.current = requestAnimationFrame(tick);
      }
    }

    ref.current = requestAnimationFrame(tick);
    return () => {
      if (ref.current) cancelAnimationFrame(ref.current);
    };
    // We intentionally only animate when `value` changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <span>
      {display.toLocaleString("nl-NL")}
      {suffix}
    </span>
  );
}

export function EnergySavingsCalc() {
  const [m2, setM2] = useState(10);
  const [current, setCurrent] = useState<GlassType>("dubbel");
  const [newGlass, setNewGlass] = useState<NewGlassType>("hr++");
  const [showResult, setShowResult] = useState(false);

  const result = calcSavings(m2, current, newGlass);

  function handleCalculate() {
    setShowResult(true);
  }

  return (
    <section className="section bg-white">
      <div className="container-rebu">
        <div className="mx-auto max-w-3xl text-center">
          <span className="section-eyebrow">
            <Calculator className="h-4 w-4" /> Energiebesparing berekenen
          </span>
          <h2 className="section-title mt-3">
            Hoeveel bespaart u met{" "}
            <span className="italic text-rebu-green">nieuw glas</span>?
          </h2>
          <p className="mt-5 text-lg text-neutral-600">
            Ontdek hoeveel u jaarlijks kunt besparen op uw energierekening door
            uw oude beglazing te vervangen.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-2xl">
          <div className="rounded-3xl bg-rebu-cream p-8 ring-1 ring-rebu-stone sm:p-10">
            <div className="grid gap-6 sm:grid-cols-3">
              {/* m2 input */}
              <div>
                <label
                  htmlFor="calc-m2"
                  className="mb-1.5 block text-sm font-medium text-rebu-charcoal"
                >
                  Glasoppervlak (m&sup2;)
                </label>
                <input
                  id="calc-m2"
                  type="number"
                  min={1}
                  max={500}
                  value={m2}
                  onChange={(e) => {
                    setM2(Math.max(1, Number(e.target.value) || 1));
                    setShowResult(false);
                  }}
                  className="input"
                />
              </div>

              {/* Current glass */}
              <div>
                <label
                  htmlFor="calc-current"
                  className="mb-1.5 block text-sm font-medium text-rebu-charcoal"
                >
                  Huidig glas
                </label>
                <select
                  id="calc-current"
                  value={current}
                  onChange={(e) => {
                    setCurrent(e.target.value as GlassType);
                    setShowResult(false);
                  }}
                  className="input"
                >
                  <option value="enkel">{glassLabels.enkel}</option>
                  <option value="dubbel">{glassLabels.dubbel}</option>
                  <option value="hr">{glassLabels.hr}</option>
                  <option value="hr++">{glassLabels["hr++"]}</option>
                </select>
              </div>

              {/* New glass */}
              <div>
                <label
                  htmlFor="calc-new"
                  className="mb-1.5 block text-sm font-medium text-rebu-charcoal"
                >
                  Nieuw glas
                </label>
                <select
                  id="calc-new"
                  value={newGlass}
                  onChange={(e) => {
                    setNewGlass(e.target.value as NewGlassType);
                    setShowResult(false);
                  }}
                  className="input"
                >
                  <option value="hr++">{glassLabels["hr++"]}</option>
                  <option value="triple">{glassLabels.triple}</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleCalculate}
              className="btn-primary mt-6 w-full justify-center"
            >
              <Calculator className="h-4 w-4" /> Bereken besparing
            </button>

            {/* Results */}
            {showResult && (
              <div
                className="mt-8 grid gap-4 sm:grid-cols-3"
                style={{ animation: "slideUp 0.4s ease-out" }}
              >
                <div className="rounded-2xl bg-white p-6 text-center shadow-soft ring-1 ring-black/5">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-rebu-green/10 text-rebu-green">
                    <TrendingDown className="h-5 w-5" />
                  </div>
                  <p className="mt-3 font-display text-3xl font-semibold text-rebu-green">
                    &euro;<AnimatedNumber value={result.euros} />
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    besparing per jaar
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-6 text-center shadow-soft ring-1 ring-black/5">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-rebu-green/10 text-rebu-green">
                    <Leaf className="h-5 w-5" />
                  </div>
                  <p className="mt-3 font-display text-3xl font-semibold text-rebu-green">
                    <AnimatedNumber value={result.co2} suffix=" kg" />
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    minder CO&sup2; per jaar
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-6 text-center shadow-soft ring-1 ring-black/5">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-rebu-green/10 text-rebu-green">
                    <TrendingDown className="h-5 w-5" />
                  </div>
                  <p className="mt-3 font-display text-3xl font-semibold text-rebu-green">
                    <AnimatedNumber value={result.kwh} suffix=" kWh" />
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    minder energieverbruik
                  </p>
                </div>
              </div>
            )}

            {showResult && (
              <div className="mt-6 text-center">
                <p className="text-sm text-neutral-500">
                  * Indicatieve berekening op basis van gemiddelde Nederlandse
                  klimaatgegevens en actuele energieprijzen.
                </p>
                <Link
                  href="/offerte"
                  className="btn-primary mt-4 inline-flex"
                >
                  Vraag een offerte aan <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
