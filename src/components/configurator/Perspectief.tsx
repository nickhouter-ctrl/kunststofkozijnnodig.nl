"use client";

/**
 * Het kozijn in 3D — om te draaien en open te zetten.
 *
 * Hetzelfde kozijn als in het bewerkvlak, uit dezelfde geometrie (regel 1), maar
 * met de diepte erbij. Sleep om eromheen te lopen en schuif de vleugels open:
 * dan zie je hoe ver ze uitdraaien en welke kant ze op gaan. Dat is precies wat
 * een vooraanzicht niet kan laten zien.
 *
 * Bewerken doe je in de tekening; dit is om te kijken.
 */
import { useMemo, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { tekenIsometrie } from "@/configurator/engine/isometrie";
import { BEWEEGBAAR } from "@/configurator/engine/indeling";
import type { Berekening } from "@/configurator/types";

export function Perspectief({
  berekening,
  zijde,
}: {
  berekening: Berekening;
  zijde: "binnen" | "buiten";
}) {
  const [draaiing, setDraaiing] = useState(0);
  const [kijkhoek, setKijkhoek] = useState(12);
  const [opening, setOpening] = useState(0);
  const sleep = useRef<{ x: number; y: number; draai: number; hoek: number } | null>(null);

  const { svg } = useMemo(
    () => tekenIsometrie(berekening, zijde, { draaiing, opening, kijkhoek }),
    [berekening, zijde, draaiing, opening, kijkhoek]
  );

  const heeftVleugels = berekening.vakken.some((v) => BEWEEGBAAR.includes(v.invulling));

  return (
    <div>
      <div
        // Een vaste hoogte met een SVG die zich daarbinnen inpast: anders loopt
        // een hoog kozijn — of een opengedraaide vleugel — onderuit beeld.
        className="cursor-grab touch-none select-none overflow-hidden rounded-xl bg-gradient-to-b from-white to-rebu-cream active:cursor-grabbing [&_svg]:h-full [&_svg]:w-full"
        style={{ height: "56vh" }}
        onPointerDown={(e) => {
          sleep.current = { x: e.clientX, y: e.clientY, draai: draaiing, hoek: kijkhoek };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!sleep.current) return;
          // Een halve graad per pixel: genoeg om rond te kijken, niet zo veel
          // dat het beeld wegschiet.
          // Horizontaal slepen draait eromheen, verticaal kijkt van boven of onder.
          const zijwaarts = (e.clientX - sleep.current.x) * 0.5;
          const verticaal = (e.clientY - sleep.current.y) * 0.25;
          setDraaiing(Math.max(-70, Math.min(70, sleep.current.draai + zijwaarts)));
          setKijkhoek(Math.max(-25, Math.min(45, sleep.current.hoek + verticaal)));
        }}
        onPointerUp={() => {
          sleep.current = null;
        }}
        onPointerCancel={() => {
          sleep.current = null;
        }}
        // De tekening komt uit onze eigen engine; alle invoer is daar ontsmet.
        dangerouslySetInnerHTML={{ __html: svg }}
      />

      <div className="mt-3 flex flex-wrap items-center gap-4">
        <label className="flex min-w-[180px] flex-1 items-center gap-2 text-xs text-ink-soft">
          Draaien
          <input
            type="range"
            min={-70}
            max={70}
            step={1}
            value={draaiing}
            onChange={(e) => setDraaiing(Number(e.target.value))}
            className="flex-1 accent-rebu-green"
            aria-label="Kozijn draaien"
          />
        </label>

        {heeftVleugels && (
          <label className="flex min-w-[180px] flex-1 items-center gap-2 text-xs text-ink-soft">
            Openen
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={Math.round(opening * 100)}
              onChange={(e) => setOpening(Number(e.target.value) / 100)}
              className="flex-1 accent-rebu-green"
              aria-label="Vleugels openen"
            />
          </label>
        )}

        <button
          type="button"
          onClick={() => {
            setDraaiing(0);
            setKijkhoek(12);
            setOpening(0);
          }}
          className="inline-flex items-center gap-1.5 rounded-full border border-sand px-3 py-1.5 text-xs text-ink-soft transition hover:border-ink-soft hover:text-ink"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Recht voor
        </button>
      </div>

      <p className="mt-2 text-xs text-ink-soft">
        Sleep opzij om eromheen te lopen, omhoog of omlaag om van boven of onder te kijken. Vanaf de {zijde}zijde, profieldiepte{" "}
        {berekening.profiel.inbouwdiepte.waarde} mm.
        {heeftVleugels && " Schuif 'Openen' om de vleugels open te zetten."}
      </p>
    </div>
  );
}
