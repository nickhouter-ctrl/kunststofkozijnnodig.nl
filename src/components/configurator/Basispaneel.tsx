"use client";

/**
 * Wat er van dít kozijn te kiezen valt: type, maten, aantal en beslag.
 *
 * Profiel, kleur, hoekverbinding, glas en afwatering staan bewust NIET hier —
 * die horen bij de hele order en staan in de bovenbalk. Zo hoeft niemand ze per
 * kozijn opnieuw te kiezen, en kunnen ze ook niet per kozijn uiteenlopen.
 * De indeling zelf maak je in de tekening.
 */
import { Fragment } from "react";
import { Minus, Plus } from "lucide-react";
import { BESLAGEN } from "@/configurator/data/onderdelen";
import { KOZIJNTYPE_LABEL, KOZIJNTYPE_UITLEG, wisselKozijnType } from "@/configurator/data/standaard";
import type {
  Berekening,
  Configuratie,
  KozijnType,
  Profiel,
  // De kaartvelden heten net als de component hieronder; de alias houdt ze uit
  // elkaar zonder de component te hernoemen die elders al wordt gebruikt.
  Profielkaart as ProfielkaartVelden,
} from "@/configurator/types";

interface Props {
  configuratie: Configuratie;
  berekening: Berekening;
  wijzig: (patch: Partial<Configuratie>) => void;
  vervang: (configuratie: Configuratie) => void;
}

/**
 * De profielkaart: doorsnede plus eigenschappen van de gekozen uitvoering —
 * zoals de vergelijkingskaart bij toelevering. Het profiel zelf kies je in de
 * bovenbalk; deze kaart laat zien wat die keuze technisch betekent, en
 * verschilt dus per uitvoering (het NL-blokprofiel is dieper en neemt minder
 * glas dan het basissysteem). Kaart en combinaties komen uit de
 * productdatabase; rijen waarvoor de catalogus niets geeft vallen weg.
 */
export function Profielkaart({ profiel }: { profiel: Profiel }) {
  const kaart: Partial<ProfielkaartVelden> = profiel.profielkaart ?? {};

  // De doorsnede van de raamcombinatie is het gezicht van de kaart; bij een
  // profiel zonder raamvleugel (een hefschuif) pakt de kaart het eerste blad.
  const combinaties = profiel.combinaties ?? [];
  const getoond =
    combinaties.find((c) => c.toepassing === "raam" && c.doorsnedeSvg) ??
    combinaties.find((c) => c.doorsnedeSvg);

  // Rijen zonder gegevens vallen weg, zodat de kaart nooit lege waarden toont.
  const rijen: [string, string][] = [];
  if (kaart.profielklasse) rijen.push(["Profielklasse", kaart.profielklasse]);
  rijen.push(["Kamers", `${profiel.kamers.waarde} kamers`]);
  if (kaart.afdichtingen != null) rijen.push(["Afdichtingen", `${kaart.afdichtingen} dichtingsniveaus`]);
  if (kaart.staal) rijen.push(["Staalversterking", kaart.staal]);
  if (kaart.antiInbraak) rijen.push(["Anti-inbraak", kaart.antiInbraak]);
  rijen.push(["Inbouwdiepte", `${profiel.inbouwdiepte.waarde} mm`]);
  rijen.push(["Max. glasdikte", `${profiel.maxGlasdikte.waarde} mm`]);
  rijen.push(["Uf-waarde", `${profiel.uWaarde.waarde} W/m²K`]);
  if (kaart.hfl) rijen.push(["HFL", "HFL-technologie mogelijk"]);
  if (getoond?.kaderZichtbreedte && getoond.vleugelZichtbreedte) {
    rijen.push([
      "Kader × vleugel",
      `${getoond.kaderZichtbreedte.waarde} × ${getoond.vleugelZichtbreedte.waarde} mm`,
    ]);
  }
  if (getoond?.kaderArtikel && getoond.vleugelArtikel) {
    rijen.push(["Artikelen", `${getoond.kaderArtikel} × ${getoond.vleugelArtikel}`]);
  }

  return (
    <section
      aria-label={`Profielkaart ${profiel.merkLabel} ${profiel.naam}, ${profiel.uitvoeringLabel}`}
      className="rounded-xl border border-sand bg-paper p-4"
    >
      <h3 className="text-sm font-medium text-ink">
        {profiel.merkLabel} {profiel.naam}
      </h3>
      <p className="mt-0.5 text-xs text-ink-soft">
        {profiel.uitvoeringLabel} · {profiel.toepassing}
      </p>

      {getoond?.doorsnedeSvg ? (
        // De doorsnede is een vectortekening uit de fabrikantcatalogus; hij
        // wordt op ware verhouding getoond, niet geschaald naar de kaart.
        // eslint-disable-next-line @next/next/no-img-element -- lokale SVG, next/image voegt hier niets toe
        <img
          src={getoond.doorsnedeSvg}
          alt={`Technische doorsnede van ${profiel.merkLabel} ${profiel.naam}, ${profiel.uitvoeringLabel}`}
          className="mt-3 h-36 w-full rounded-lg border border-sand bg-white object-contain p-2"
        />
      ) : (
        <p className="mt-3 rounded-lg border border-dashed border-sand p-3 text-center text-[11px] text-ink-soft">
          Doorsnede van deze uitvoering volgt uit de technische catalogus.
        </p>
      )}

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        {rijen.map(([label, waarde]) => (
          <Fragment key={label}>
            <dt className="text-ink-soft">{label}</dt>
            <dd className="text-right text-ink">{waarde}</dd>
          </Fragment>
        ))}
      </dl>
    </section>
  );
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
      <Profielkaart profiel={huidig} />

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
