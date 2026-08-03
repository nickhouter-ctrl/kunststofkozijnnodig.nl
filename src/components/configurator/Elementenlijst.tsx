"use client";

/**
 * De kozijnen in deze order, links in beeld.
 *
 * Een order is zelden één kozijn. Je maakt er één af, slaat hem op en gaat
 * verder met de volgende; de vaste gegevens (kleur, profiel, hoekverbinding)
 * komen dan mee uit de bovenbalk. In deze lijst zie je in één oogopslag wat er
 * al staat, met een echte miniatuur van elk kozijn — geen icoontje, maar de
 * tekening zelf, uit dezelfde tekenlaag als de grote weergave (regel 1).
 */
import { useMemo } from "react";
import { Copy, Plus, Trash2 } from "lucide-react";
import { tekenAanzicht } from "@/configurator/engine/aanzicht";
import { svgDocument } from "@/configurator/engine/svg";
import { euroTekst } from "@/configurator/engine/prijs";
import { KOZIJNTYPE_LABEL } from "@/configurator/data/standaard";
import type { Berekening } from "@/configurator/types";

interface Props {
  berekeningen: Berekening[];
  actief: number;
  onKies: (index: number) => void;
  onNieuw: () => void;
  onDupliceer: (index: number) => void;
  onVerwijder: (index: number) => void;
}

/** De tekening op postzegelformaat: zonder maatlijnen, wel met de echte folie. */
function Miniatuur({ berekening }: { berekening: Berekening }) {
  const svg = useMemo(() => {
    const a = tekenAanzicht(berekening, "binnen", { maten: false });
    const rand = Math.max(a.breedte, a.hoogte) * 0.04;
    return svgDocument(
      {
        x: -rand,
        y: -rand,
        breedte: a.breedte + 2 * rand,
        hoogte: a.hoogte + 2 * rand + a.marges.onder,
      },
      a.inhoud,
      a.defs
    );
  }, [berekening]);

  return (
    <div
      className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-sand bg-white [&_svg]:h-full [&_svg]:w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export function Elementenlijst({
  berekeningen,
  actief,
  onKies,
  onNieuw,
  onDupliceer,
  onVerwijder,
}: Props) {
  const totaal = berekeningen.reduce((som, b) => som + b.prijs.klantprijsTotaalInclBtw, 0);
  const stuks = berekeningen.reduce((som, b) => som + b.configuratie.aantal, 0);

  return (
    <div className="rounded-2xl border border-sand bg-paper">
      <div className="flex items-baseline justify-between border-b border-sand px-4 py-3">
        <h2 className="font-display text-lg text-ink">Kozijnen</h2>
        <span className="text-xs text-ink-soft">
          {berekeningen.length} × in {stuks} stuks
        </span>
      </div>

      <ul className="max-h-[52vh] overflow-y-auto p-2">
        {berekeningen.map((b, i) => {
          const c = b.configuratie;
          const gekozen = i === actief;
          return (
            <li key={`${c.naam}-${i}`}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => onKies(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onKies(i);
                }}
                aria-current={gekozen}
                className={`group mb-1.5 flex w-full cursor-pointer items-center gap-3 rounded-xl border p-2 text-left transition ${
                  gekozen
                    ? "border-rebu-green bg-rebu-tint ring-1 ring-rebu-green"
                    : "border-transparent hover:border-sand hover:bg-rebu-cream"
                }`}
              >
                <Miniatuur berekening={b} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{c.naam}</p>
                  <p className="truncate text-xs text-ink-soft">
                    {c.breedte} × {c.hoogte} mm · {KOZIJNTYPE_LABEL[c.kozijnType]}
                    {c.aantal > 1 ? ` · ${c.aantal}×` : ""}
                  </p>
                  <p className="text-xs text-rebu-green">
                    {euroTekst(b.prijs.klantprijsTotaalInclBtw)}
                  </p>
                  {b.blokkeert && (
                    <p className="text-[11px] text-red-700">Nog een blokkade — nog niet te bestellen</p>
                  )}
                </div>
                <div className="flex flex-col gap-1 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDupliceer(i);
                    }}
                    className="rounded-md p-1 text-ink-soft transition hover:bg-sand hover:text-ink"
                    aria-label={`${c.naam} dupliceren`}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  {berekeningen.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onVerwijder(i);
                      }}
                      className="rounded-md p-1 text-ink-soft transition hover:bg-red-50 hover:text-red-700"
                      aria-label={`${c.naam} verwijderen`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="border-t border-sand p-3">
        <button
          type="button"
          onClick={onNieuw}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-ink-soft/50 py-2.5 text-sm text-ink transition hover:border-rebu-green hover:bg-rebu-tint hover:text-rebu-green-dark"
        >
          <Plus className="h-4 w-4" />
          Kozijn toevoegen
        </button>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-xs uppercase tracking-editorial text-ink-soft">Totaal incl. btw</span>
          <span className="font-display text-xl text-ink">{euroTekst(totaal)}</span>
        </div>
      </div>
    </div>
  );
}
