"use client";

/**
 * Het maatvoeringspaneel — de zichtbare uitwerking van regel 2.
 *
 * Glasmaat, cilindermaat en hormaat staan hier altijd, in elke stap, ongeacht
 * of het bijbehorende product wordt meegeleverd. Hoofdstuk 8.1: 'overal
 * zichtbaar, nooit verstopt achter een los tabblad'.
 */
import { CircleAlert, Ruler } from "lucide-react";
import { cilindermaatTekst, glasmaatTekst, hormaatTekst } from "@/configurator/engine/maten";
import type { Berekening } from "@/configurator/types";

function Regel({
  label,
  waarde,
  meegeleverd,
}: {
  label: string;
  waarde: string;
  meegeleverd: boolean;
}) {
  return (
    <div
      className={`rounded-lg border px-3 py-2 ${
        meegeleverd ? "border-sand bg-paper" : "border-amber-300 bg-amber-50"
      }`}
    >
      <p className="text-[11px] uppercase tracking-editorial text-ink-soft">{label}</p>
      <p className={`text-sm ${meegeleverd ? "text-ink" : "font-medium text-amber-900"}`}>
        {waarde}
      </p>
    </div>
  );
}

export function MaatvoeringPaneel({ berekening }: { berekening: Berekening }) {
  const c = berekening.configuratie;
  const ietsUitgesloten =
    !c.glas.meegeleverd || !c.beslag.cilinderMeegeleverd || berekening.vakken.some((v) => !v.horMeegeleverd);

  return (
    <section className="rounded-xl border border-sand bg-rebu-cream p-4">
      <h3 className="mb-3 flex items-center gap-2 font-display text-lg text-ink">
        <Ruler className="h-4 w-4 text-rebu-green" />
        Maatvoering
      </h3>

      {ietsUitgesloten && (
        <p className="mb-3 flex items-start gap-2 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-900">
          <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Onderdelen die u zelf regelt staan hieronder tóch met de maat die u nodig heeft. Zo kunt u
          ze los bestellen zonder na te meten.
        </p>
      )}

      <div className="space-y-3">
        {berekening.vakken.map((vak, i) => (
          <div key={`${vak.naam}-${i}`} className="space-y-1.5">
            <p className="text-xs font-semibold text-ink">
              {vak.naam}
              <span className="ml-2 font-normal text-ink-soft">
                vleugel {vak.vleugelBreedte} × {vak.vleugelHoogte} mm
              </span>
            </p>
            <Regel
              label="Glasmaat"
              waarde={glasmaatTekst(vak, berekening.glastype, c.glas.meegeleverd)}
              meegeleverd={c.glas.meegeleverd}
            />
            <Regel
              label="Hormaat"
              waarde={hormaatTekst(vak, berekening.hortype?.naam ?? null)}
              meegeleverd={vak.horMeegeleverd}
            />
          </div>
        ))}

        <Regel
          label="Cilindermaat"
          waarde={cilindermaatTekst(berekening.cilindermaat, c.beslag.cilinderMeegeleverd)}
          meegeleverd={c.beslag.cilinderMeegeleverd}
        />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-sand pt-3 text-xs">
        {/*
          Inbouwdiepte en maximale glasdikte horen bij de gekozen uitvoering,
          niet bij het systeem: het NL-blokprofiel mét aanslag is 120 mm diep
          waar het basissysteem 85 mm is. Wie hier meet, meet de juiste variant.
        */}
        <dt className="text-ink-soft">Inbouwdiepte</dt>
        <dd className="text-right text-ink">{berekening.profiel.inbouwdiepte.waarde} mm</dd>
        <dt className="text-ink-soft">Max. glasdikte</dt>
        <dd className="text-right text-ink">{berekening.profiel.maxGlasdikte.waarde} mm</dd>
        <dt className="text-ink-soft">Kozijnoppervlak</dt>
        <dd className="text-right text-ink">{berekening.kozijnOppervlakM2} m²</dd>
        <dt className="text-ink-soft">Glasoppervlak</dt>
        <dd className="text-right text-ink">{berekening.totaalGlasOppervlakM2} m²</dd>
        {berekening.totaalGlasGewichtKg !== null && (
          <>
            <dt className="text-ink-soft">Glasgewicht</dt>
            <dd className="text-right text-ink">{berekening.totaalGlasGewichtKg} kg</dd>
          </>
        )}
        <dt className="text-ink-soft">Staalversterking</dt>
        <dd className="text-right text-ink">
          {berekening.staalversterkingVerplicht
            ? "verplicht"
            : c.staalversterking
              ? "gekozen"
              : "niet nodig"}
        </dd>
      </dl>

      {berekening.cilindermaat.gebaseerdOpFabrieksstandaard && (
        <p className="mt-3 text-[11px] leading-snug text-ink-soft">
          De cilindermaat is berekend met de fabrieksstandaard rozetdikte, omdat er nog geen beslag
          is gekozen. Kiest u beslag, dan rekent het systeem met de werkelijke schilddikte.
        </p>
      )}
    </section>
  );
}
