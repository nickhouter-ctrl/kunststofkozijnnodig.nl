"use client";

/**
 * Het bewerkvlak — de tekening waarin je werkt.
 *
 * Dit is geen aparte weergave naast de technische tekening: het tekent exact
 * dezelfde geometrie met dezelfde functie (regel 1). Wat je hier aanklikt en
 * versleept is letterlijk wat er op de productietekening komt.
 *
 * Klikken op een vak, een stijl of een kozijnlijst selecteert dat onderdeel.
 * Een stijl is bovendien te verslepen: dat zet de maat van het vak ervóór vast,
 * zodat de stijl blijft staan waar je hem neerzet en de rest meebeweegt.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { tekenAanzicht, type Klikvlak, type Maatlabel, type Zijde } from "@/configurator/engine/aanzicht";
import { knoopOpId, wijzigSplitsing } from "@/configurator/engine/indeling";
import type { Berekening, Configuratie, Indeling } from "@/configurator/types";

export type Selectie =
  | { soort: "vak"; id: string }
  /** Een vak bínnen een vleugel: een ruit of paneel in de deur zelf. */
  | { soort: "binnenvak"; vakId: string; id: string }
  | { soort: "stijl"; splitsingId: string; index: number }
  | { soort: "kozijn"; zijde: "boven" | "onder" | "links" | "rechts" }
  | null;

interface Props {
  berekening: Berekening;
  zijde: Zijde;
  selectie: Selectie;
  onSelecteer: (selectie: Selectie) => void;
  onIndeling: (indeling: Indeling) => void;
  /** Voor het rechtstreeks aanpassen van de totaalmaten in de tekening. */
  onConfiguratie: (patch: Partial<Configuratie>) => void;
}

/** Is dit klikvlak het geselecteerde onderdeel? */
function isGeselecteerd(vlak: Klikvlak, selectie: Selectie): boolean {
  if (!selectie) return false;
  if (vlak.soort === "vak" && selectie.soort === "vak") return vlak.id === selectie.id;
  if (vlak.soort === "binnenvak" && selectie.soort === "binnenvak") return vlak.id === selectie.id;
  if (vlak.soort === "stijl" && selectie.soort === "stijl") {
    return vlak.splitsingId === selectie.splitsingId && vlak.index === selectie.index;
  }
  if (vlak.soort === "kozijn" && selectie.soort === "kozijn") return vlak.zijde === selectie.zijde;
  return false;
}

function selectieVan(vlak: Klikvlak): Selectie {
  if (vlak.soort === "vak") return { soort: "vak", id: vlak.id };
  if (vlak.soort === "binnenvak") return { soort: "binnenvak", vakId: vlak.vakId, id: vlak.id };
  if (vlak.soort === "stijl") return { soort: "stijl", splitsingId: vlak.splitsingId, index: vlak.index };
  return { soort: "kozijn", zijde: vlak.zijde };
}

function omschrijving(vlak: Klikvlak): string {
  if (vlak.soort === "vak") return `Vak ${vlak.naam}`;
  if (vlak.soort === "binnenvak") return `${vlak.naam} — in de vleugel`;
  if (vlak.soort === "stijl") {
    return vlak.as === "kolommen"
      ? "Verticale stijl — sleep om te verplaatsen"
      : "Horizontale stijl — sleep om te verplaatsen";
  }
  const zijden = { boven: "bovenregel", onder: "onderregel", links: "linkerstijl", rechts: "rechterstijl" };
  return `Kozijn ${zijden[vlak.zijde]}`;
}

/** De kleinste maat die een vak mag krijgen bij slepen of intypen. */
export const MINIMALE_VAKMAAT = 120;

export function Bewerkvlak({
  berekening,
  zijde,
  selectie,
  onSelecteer,
  onIndeling,
  onConfiguratie,
}: Props) {
  const aanzicht = useMemo(
    () => tekenAanzicht(berekening, zijde, { maten: true }),
    [berekening, zijde]
  );
  const c = berekening.configuratie;
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [sleept, setSleept] = useState<string | null>(null);
  // Welke maat in de tekening op dit moment wordt overgetypt.
  const [bewerkt, setBewerkt] = useState<{ index: number; tekst: string } | null>(null);

  const m = aanzicht.marges;
  const streek = Math.max(c.breedte, c.hoogte) / 260;

  /**
   * Zet de maat van het vak vóór de stijl vast op basis van de sleepafstand.
   * De rest van de splitsing vangt het verschil op.
   */
  const sleepStijl = useCallback(
    (vlak: Extract<Klikvlak, { soort: "stijl" }>, deltaMm: number) => {
      const knoop = knoopOpId(c.indeling, vlak.splitsingId);
      if (!knoop || knoop.soort !== "splitsing") return;

      const ruimte = vlak.vorigeMaat + vlak.volgendeMaat;
      const nieuweMaat = Math.round(
        Math.min(ruimte - MINIMALE_VAKMAAT, Math.max(MINIMALE_VAKMAAT, vlak.vorigeMaat + deltaMm))
      );

      const kinderen = knoop.kinderen.map((kind, i) => {
        // Het deel vóór de stijl krijgt de vaste maat; het deel erna wordt weer
        // flexibel, zodat het de rest opvangt in plaats van te blijven hangen.
        if (i === vlak.index) return { ...kind, vasteMaat: nieuweMaat };
        if (i === vlak.index + 1) return { ...kind, vasteMaat: null };
        return kind;
      });
      onIndeling(wijzigSplitsing(c.indeling, knoop.id, { kinderen }));
    },
    [c.indeling, onIndeling]
  );

  /**
   * Past een maat toe die rechtstreeks in de tekening is overgetypt.
   *
   * Elke maat stuurt precies één ding aan: een vakmaat zet de vaste maat van
   * dat vak, een hartmaat verschuift de stijl, en een totaalmaat verandert het
   * kozijn zelf. Zo blijft de tekening de bediening (regel 1).
   */
  const pasMaatToe = useCallback(
    (label: Maatlabel, nieuweWaarde: number) => {
      const waarde = Math.round(nieuweWaarde);
      if (!Number.isFinite(waarde) || waarde <= 0) return;

      if (label.doel === "totaalBreedte") return onConfiguratie({ breedte: waarde });
      if (label.doel === "totaalHoogte") return onConfiguratie({ hoogte: waarde });
      if (label.doel === "hoogteLaag") return onConfiguratie({ hoogteLaag: waarde });

      // Hartmaat: de stijl verschuift door het vak ervóór vast te zetten.
      const knoop = knoopOpId(c.indeling, label.splitsingId);
      if (!knoop || knoop.soort !== "splitsing") return;
      const stijlVlak = aanzicht.klikvlakken.find(
        (v) => v.soort === "stijl" && v.splitsingId === label.splitsingId && v.index === label.index
      );
      if (!stijlVlak || stijlVlak.soort !== "stijl") return;

      const horizontaal = stijlVlak.as === "rijen";
      const beginStijl = horizontaal ? stijlVlak.y : stijlVlak.x;
      const beginVak = beginStijl - stijlVlak.vorigeMaat;
      const dikte = knoop.scheidingBreedte;
      const ruimte = stijlVlak.vorigeMaat + stijlVlak.volgendeMaat;

      // Een maat vanaf de rechter- of onderrand meet de andere kant op; reken
      // hem eerst terug naar de afstand vanaf links respectievelijk boven.
      const totaal = horizontaal ? c.hoogte : c.breedte;
      const vanafBegin =
        label.vanaf === "rechts" || label.vanaf === "onder" ? totaal - waarde : waarde;
      const gewenst = vanafBegin - beginVak - dikte / 2;
      const maat = Math.round(
        Math.min(ruimte - MINIMALE_VAKMAAT, Math.max(MINIMALE_VAKMAAT, gewenst))
      );

      const kinderen = knoop.kinderen.map((kind, i) => {
        if (i === label.index) return { ...kind, vasteMaat: maat };
        if (i === label.index + 1) return { ...kind, vasteMaat: null };
        return kind;
      });
      onIndeling(wijzigSplitsing(c.indeling, knoop.id, { kinderen }));
    },
    [aanzicht.klikvlakken, c.breedte, c.hoogte, c.indeling, onConfiguratie, onIndeling]
  );

  /** Zet een pixelpositie om naar tekencoördinaten in millimeters. */
  const naarMm = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current;
      if (!svg) return null;
      const kader = svg.getBoundingClientRect();
      const viewBreedte = c.breedte + m.links + m.rechts;
      const viewHoogte = c.hoogte + m.boven + m.onder;
      // De SVG schaalt met preserveAspectRatio 'meet': de kleinste factor wint.
      const factor = Math.min(kader.width / viewBreedte, kader.height / viewHoogte);
      const offsetX = (kader.width - viewBreedte * factor) / 2;
      const offsetY = (kader.height - viewHoogte * factor) / 2;
      return {
        x: (clientX - kader.left - offsetX) / factor - m.links,
        y: (clientY - kader.top - offsetY) / factor - m.boven,
      };
    },
    [c.breedte, c.hoogte, m.links, m.rechts, m.boven, m.onder]
  );

  // Escape laat de selectie los, ook als de muis elders staat — behalve terwijl
  // je in een maatveld typt, want daar betekent Escape 'wijziging annuleren'.
  useEffect(() => {
    const opToets = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const doel = e.target as HTMLElement | null;
      if (doel && (doel.tagName === "INPUT" || doel.tagName === "TEXTAREA")) return;
      onSelecteer(null);
    };
    window.addEventListener("keydown", opToets);
    return () => window.removeEventListener("keydown", opToets);
  }, [onSelecteer]);

  // Kozijnlijsten eerst, dan vakken, dan de vullingen binnen een vleugel, dan
  // de stijlen: de stijl ligt bovenop zodat hij te pakken is om te slepen.
  const volgorde: Record<Klikvlak["soort"], number> = { kozijn: 0, vak: 1, binnenvak: 2, stijl: 3 };
  const vlakken = [...aanzicht.klikvlakken].sort((a, b) => volgorde[a.soort] - volgorde[b.soort]);

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`${-m.links} ${-m.boven} ${c.breedte + m.links + m.rechts} ${c.hoogte + m.boven + m.onder}`}
        className="w-full select-none"
        style={{ maxHeight: "62vh", touchAction: "none" }}
        role="application"
        aria-label="Bewerkvlak: klik op een vak, stijl of kozijnlijst om het aan te passen; sleep een stijl om hem te verplaatsen"
      >
        {aanzicht.defs && <defs dangerouslySetInnerHTML={{ __html: aanzicht.defs }} />}

        {/*
          Klikken naast het kozijn heft de selectie op. Zonder dit vlak blijft de
          groene markering staan zodra je één keer iets hebt aangeklikt, en kun je
          de tekening niet meer schoon bekijken. De onderdeelvlakken liggen
          hierboven en houden hun eigen klik tegen.
        */}
        <rect
          x={-m.links}
          y={-m.boven}
          width={c.breedte + m.links + m.rechts}
          height={c.hoogte + m.boven + m.onder}
          fill="transparent"
          onPointerDown={() => onSelecteer(null)}
        />

        <g className="pointer-events-none" dangerouslySetInnerHTML={{ __html: aanzicht.inhoud }} />

        {vlakken.map((vlak, i) => {
          const gekozen = isGeselecteerd(vlak, selectie);
          const isStijl = vlak.soort === "stijl";
          const sleutel = isStijl ? `${vlak.splitsingId}-${vlak.index}` : `${vlak.soort}-${i}`;
          const wordtGesleept = sleept === sleutel;

          return (
            <rect
              key={sleutel}
              x={vlak.x}
              y={vlak.y}
              width={Math.max(0, vlak.breedte)}
              height={Math.max(0, vlak.hoogte)}
              fill={gekozen || wordtGesleept ? "rgba(0,166,110,0.16)" : "transparent"}
              stroke={gekozen || wordtGesleept ? "#00a66e" : "transparent"}
              strokeWidth={streek * 2.2}
              style={{
                cursor: isStijl ? (vlak.as === "kolommen" ? "ew-resize" : "ns-resize") : "pointer",
              }}
              className="transition-[fill] hover:fill-[rgba(0,166,110,0.09)]"
              onPointerDown={(e) => {
                e.stopPropagation();
                onSelecteer(selectieVan(vlak));
                if (!isStijl) return;

                const start = naarMm(e.clientX, e.clientY);
                if (!start) return;
                const doel = e.currentTarget;
                doel.setPointerCapture(e.pointerId);
                setSleept(sleutel);

                const beweeg = (ev: PointerEvent) => {
                  const nu = naarMm(ev.clientX, ev.clientY);
                  if (!nu) return;
                  const delta = vlak.as === "kolommen" ? nu.x - start.x : nu.y - start.y;
                  if (Math.abs(delta) < 1) return;
                  sleepStijl(vlak, delta);
                };
                const stop = (ev: PointerEvent) => {
                  doel.releasePointerCapture?.(ev.pointerId);
                  doel.removeEventListener("pointermove", beweeg);
                  doel.removeEventListener("pointerup", stop);
                  doel.removeEventListener("pointercancel", stop);
                  setSleept(null);
                };
                doel.addEventListener("pointermove", beweeg);
                doel.addEventListener("pointerup", stop);
                doel.addEventListener("pointercancel", stop);
              }}
            >
              <title>{omschrijving(vlak)}</title>
            </rect>
          );
        })}
        {/* De maten zijn zelf de bediening: klik erop en typ een nieuwe waarde. */}
        {aanzicht.maatlabels.map((label, i) => {
          const breed = Math.max(120, c.breedte * 0.12);
          const hoog = Math.max(60, c.hoogte * 0.05);
          const inBewerking = bewerkt?.index === i;

          if (inBewerking) {
            return (
              <foreignObject
                key={`maat-${i}`}
                x={label.x - breed / 2}
                y={label.y - hoog}
                width={breed}
                height={hoog}
              >
                <input
                  autoFocus
                  type="number"
                  value={bewerkt.tekst}
                  onChange={(e) => setBewerkt({ index: i, tekst: e.target.value })}
                  onBlur={() => {
                    const getal = Number(bewerkt.tekst);
                    if (Number.isFinite(getal)) pasMaatToe(label, getal);
                    setBewerkt(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                    if (e.key === "Escape") setBewerkt(null);
                  }}
                  style={{
                    width: "100%",
                    height: "100%",
                    fontSize: `${hoog * 0.6}px`,
                    textAlign: "center",
                    border: "2px solid #00a66e",
                    borderRadius: `${hoog * 0.15}px`,
                    background: "#ffffff",
                    color: "#141917",
                    outline: "none",
                  }}
                />
              </foreignObject>
            );
          }

          return (
            <rect
              key={`maat-${i}`}
              x={label.x - breed / 2}
              y={label.y - hoog * 0.85}
              width={breed}
              height={hoog}
              fill="transparent"
              className="cursor-text hover:fill-[rgba(0,166,110,0.10)]"
              onClick={(e) => {
                e.stopPropagation();
                setBewerkt({ index: i, tekst: String(label.waarde) });
              }}
            >
              <title>Klik om deze maat te typen</title>
            </rect>
          );
        })}
      </svg>

      <p className="mt-2 text-center text-xs text-ink-soft">
        Klik op een vak om er stijlen, een vleugel, een deur of een rooster in te zetten. Sleep een
        stijl om hem te verplaatsen, of klik op een maat in de tekening om die te typen.
      </p>
    </div>
  );
}
