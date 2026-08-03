"use client";

/**
 * Wat er van dít kozijn te kiezen valt: type, maten, aantal en beslag.
 *
 * Profiel, kleur, hoekverbinding, glas en afwatering staan bewust NIET hier —
 * die horen bij de hele order en staan in de bovenbalk. Zo hoeft niemand ze per
 * kozijn opnieuw te kiezen, en kunnen ze ook niet per kozijn uiteenlopen.
 * De indeling zelf maak je in de tekening.
 */
import { Minus, Plus } from "lucide-react";
import { BESLAGEN } from "@/configurator/data/onderdelen";
import { KOZIJNTYPE_LABEL, KOZIJNTYPE_UITLEG, wisselKozijnType } from "@/configurator/data/standaard";
import type { Berekening, Configuratie, KozijnType } from "@/configurator/types";

interface Props {
  configuratie: Configuratie;
  berekening: Berekening;
  wijzig: (patch: Partial<Configuratie>) => void;
  vervang: (configuratie: Configuratie) => void;
}

function Groep({ titel, uitleg, children }: { titel: string; uitleg?: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-sand pt-4">
      <h3 className="text-sm font-medium text-ink">{titel}</h3>
      {uitleg && <p className="mb-2 mt-0.5 text-xs text-ink-soft">{uitleg}</p>}
      <div className={uitleg ? "" : "mt-2"}>{children}</div>
    </section>
  );
}

function Keuze({
  gekozen,
  onKies,
  titel,
  onder,
  uit,
}: {
  gekozen: boolean;
  onKies: () => void;
  titel: string;
  onder?: string;
  uit?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onKies}
      disabled={uit}
      aria-pressed={gekozen}
      className={`rounded-lg border p-3 text-left text-sm transition ${
        uit
          ? "cursor-not-allowed border-sand bg-sand/40 text-ink-soft/60"
          : gekozen
            ? "border-rebu-green bg-rebu-tint text-ink ring-1 ring-rebu-green"
            : "border-sand bg-paper text-ink hover:border-ink-soft"
      }`}
    >
      <span className="block font-medium">{titel}</span>
      {onder && <span className="mt-0.5 block text-xs text-ink-soft">{onder}</span>}
      {uit && <span className="mt-1 block text-xs italic">niet leverbaar</span>}
    </button>
  );
}

function MaatVeld({
  label,
  waarde,
  onWijzig,
  hint,
}: {
  label: string;
  waarde: number;
  onWijzig: (waarde: number) => void;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-ink-soft">{label}</label>
      <div className="flex items-stretch gap-1">
        <button
          type="button"
          onClick={() => onWijzig(Math.max(100, waarde - 10))}
          className="rounded-lg border border-sand px-2 text-ink-soft transition hover:border-ink-soft hover:text-ink"
          aria-label={`${label} kleiner`}
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <input
          type="number"
          value={waarde}
          onChange={(e) => onWijzig(Number(e.target.value) || 0)}
          className="w-full rounded-lg border border-sand px-2 py-2 text-center text-base font-medium text-ink outline-none focus:border-rebu-green"
        />
        <button
          type="button"
          onClick={() => onWijzig(waarde + 10)}
          className="rounded-lg border border-sand px-2 text-ink-soft transition hover:border-ink-soft hover:text-ink"
          aria-label={`${label} groter`}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
      {hint && <p className="mt-1 text-[11px] text-ink-soft">{hint}</p>}
    </div>
  );
}

export function Basispaneel({ configuratie, berekening, wijzig, vervang }: Props) {
  const huidig = berekening.profiel;
  const g = huidig.grenzen;

  return (
    <div className="space-y-4">
      <section>
        <h3 className="text-sm font-medium text-ink">Wat voor kozijn maakt u?</h3>
        <p className="mb-2 mt-0.5 text-xs text-ink-soft">
          {KOZIJNTYPE_UITLEG[configuratie.kozijnType]}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(KOZIJNTYPE_LABEL) as KozijnType[]).map((type) => (
            <Keuze
              key={type}
              gekozen={configuratie.kozijnType === type}
              onKies={() => vervang(wisselKozijnType(configuratie, type))}
              titel={KOZIJNTYPE_LABEL[type]}
              uit={!huidig.toegestaneTypes.includes(type)}
            />
          ))}
        </div>
        <p className="mt-2 text-[11px] text-ink-soft">
          Van type wisselen zet de indeling terug naar het standaardbegin voor dat type.
        </p>
      </section>

      <Groep titel="Maten" uitleg="De buitenwerkse maat van het kozijn — de maat van de sparing.">
        <div className="grid grid-cols-2 gap-2">
          <MaatVeld
            label="Breedte"
            waarde={configuratie.breedte}
            onWijzig={(breedte) => wijzig({ breedte })}
            hint={`${g.minBreedte.waarde}–${g.maxBreedte.waarde} mm`}
          />
          <MaatVeld
            label={configuratie.vorm === "schuin" ? "Hoogte (hoog)" : "Hoogte"}
            waarde={configuratie.hoogte}
            onWijzig={(hoogte) => wijzig({ hoogte })}
            hint={`${g.minHoogte.waarde}–${g.maxHoogte.waarde} mm`}
          />
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Keuze
            gekozen={configuratie.vorm === "recht"}
            onKies={() => wijzig({ vorm: "recht", hoogteLaag: null })}
            titel="Recht"
          />
          <Keuze
            gekozen={configuratie.vorm === "schuin"}
            onKies={() =>
              wijzig({
                vorm: "schuin",
                hoogteLaag: configuratie.hoogteLaag ?? Math.round(configuratie.hoogte * 0.7),
              })
            }
            titel="Schuin"
          />
        </div>
        {configuratie.vorm === "schuin" && (
          <div className="mt-2">
            <MaatVeld
              label="Hoogte lage zijde (links)"
              waarde={configuratie.hoogteLaag ?? 0}
              onWijzig={(hoogteLaag) => wijzig({ hoogteLaag })}
            />
          </div>
        )}
        {/*
          Hoe hoog het metselwerk onder het kozijn is. Onder de 70 cm is
          letselveilig glas verplicht: daar kun je ertegenaan vallen.
        */}
        <div className="mt-2">
          <MaatVeld
            label="Borstwering — vanaf de vloer tot het kozijn"
            waarde={configuratie.borstweringHoogte}
            onWijzig={(borstweringHoogte) => wijzig({ borstweringHoogte })}
            hint={
              configuratie.borstweringHoogte < 700
                ? "Onder 700 mm is gelaagd of gehard glas verplicht."
                : "Boven 700 mm mag gewoon isolatieglas."
            }
          />
        </div>

        <div className="mt-2">
          <label className="mb-1 block text-xs text-ink-soft">Aantal identieke kozijnen</label>
          <input
            type="number"
            min={1}
            value={configuratie.aantal}
            onChange={(e) => wijzig({ aantal: Math.max(1, Math.floor(Number(e.target.value) || 1)) })}
            className="w-full rounded-lg border border-sand px-3 py-2 text-sm outline-none focus:border-rebu-green"
          />
        </div>
      </Groep>

      <Groep titel="Beslag en cilinder">
        <div className="grid grid-cols-1 gap-2">
          <Keuze
            gekozen={configuratie.beslag.beslagId === null}
            onKies={() => wijzig({ beslag: { ...configuratie.beslag, beslagId: null } })}
            titel="Geen beslag"
            onder="Cilindermaat via de fabrieksstandaard"
          />
          {BESLAGEN.filter((b) => huidig.toegestaanBeslag.includes(b.id)).map((beslag) => (
            <Keuze
              key={beslag.id}
              gekozen={configuratie.beslag.beslagId === beslag.id}
              onKies={() => wijzig({ beslag: { ...configuratie.beslag, beslagId: beslag.id } })}
              titel={beslag.naam}
              onder={`${beslag.skg} · schild ${beslag.binnenschild.waarde}/${beslag.buitenschild.waarde} mm`}
              uit={!beslag.voorTypes.includes(configuratie.kozijnType)}
            />
          ))}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Keuze
            gekozen={configuratie.beslag.cilinderMeegeleverd}
            onKies={() => wijzig({ beslag: { ...configuratie.beslag, cilinderMeegeleverd: true } })}
            titel="Cilinder mee"
          />
          <Keuze
            gekozen={!configuratie.beslag.cilinderMeegeleverd}
            onKies={() => wijzig({ beslag: { ...configuratie.beslag, cilinderMeegeleverd: false } })}
            titel="Eigen cilinder"
            onder={`Maat ${berekening.cilindermaat.notatie} mm`}
          />
        </div>
        <label className="mt-2 flex items-start gap-2 rounded-lg border border-sand p-3 text-sm">
          <input
            type="checkbox"
            checked={configuratie.staalversterking}
            onChange={(e) => wijzig({ staalversterking: e.target.checked })}
            className="mt-0.5 h-4 w-4 accent-rebu-green"
          />
          <span>
            <span className="block text-ink">Staalversterking</span>
            <span className="block text-[11px] text-ink-soft">
              {berekening.staalversterkingVerplicht
                ? "Bij deze vleugelmaat schrijft het profiel staalversterking voor."
                : "Bij deze maat niet verplicht."}
            </span>
          </span>
        </label>
      </Groep>
    </div>
  );
}
