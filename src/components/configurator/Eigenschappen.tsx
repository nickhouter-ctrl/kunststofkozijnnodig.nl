"use client";

/**
 * Het eigenschappenpaneel naast het bewerkvlak.
 *
 * Wat je in de tekening aanklikt, bewerk je hier. Geen wizard: elk onderdeel
 * toont precies de keuzes die er op dát onderdeel van toepassing zijn.
 */
import { useState } from "react";
import { Columns3, Plus, Rows3, Trash2, Wind } from "lucide-react";
import {
  BEWEEGBAAR,
  INVULLING_LABEL,
  PUISCHEMAS,
  blancoIndeling,
  knoopOpId,
  maakSchuifpui,
  verwijderKnoop,
  voegBinnenStijlenToe,
  voegRoosterBovenToe,
  voegStijlenToe,
  wijzigBinnenSplitsing,
  wijzigBinnenVak,
  wisBinnenIndeling,
  wijzigSplitsing,
  wijzigVak,
  zetVasteMaat,
  zoekOuder,
} from "@/configurator/engine/indeling";
import {
  DORPELS,
  GLASTYPES,
  HORTYPES,
  MUURAANSLUITINGEN,
  PANEELTYPES,
  ROOSTERS,
  STAPELDORPEL,
  aantalAfwateringssleuven,
  bijprofielOpId,
  bijprofielenVoor,
  krukkenVoor,
  roostersVoor,
} from "@/configurator/data/onderdelen";
import { profielOpId } from "@/configurator/data/profielen";
import { berekenStelmaat } from "@/configurator/engine/maten";
import { kleurenVanMerk } from "@/configurator/data/kleuren";
import type {
  Afwatering,
  Configuratie,
  Glastype,
  Indeling,
  Invulling,
  KozijnType,
  MerkId,
  Profiel,
  VakInvoer,
  VakMaten,
} from "@/configurator/types";
import type { StijlMaten } from "@/configurator/engine/maten";
import { MINIMALE_VAKMAAT, type Selectie } from "./Bewerkvlak";

/**
 * Welke invullingen bij een kozijntype horen.
 *
 * Een schuifpui kent alleen schuifvleugels en vaste panelen — een draaikiep of
 * een rooster hoort daar niet in. Andersom is een schuifvleugel juist alleen in
 * een schuifpui zinnig.
 */
function invullingenVoor(kozijnType: KozijnType): Invulling[] {
  if (kozijnType === "schuifpui") return ["schuifvleugel", "vast", "paneel"];
  return ["vast", "draaikiep", "valraam", "deur", "vastedeur", "paneel", "rooster", "geen"];
}

/**
 * Waarom een glastype niet in dít kozijn kan — of null als het gewoon past.
 *
 * De grens verschilt per uitvoering, niet per systeem: het NL-blokprofiel van
 * IDEAL 7000 neemt glas tot 41 mm waar het basissysteem 52 mm aankan. De optie
 * blijft zichtbaar mét de reden, zodat duidelijk is dat een andere uitvoering
 * het glas wél kan dragen.
 */
function glasBeperking(glas: Glastype, profiel: Profiel | null): string | null {
  if (!profiel) return null;
  if (!profiel.toegestaneGlastypes.includes(glas.id)) return "niet leverbaar op dit profiel";
  if (glas.dikte > profiel.maxGlasdikte.waarde) {
    return `te dik voor deze uitvoering (max ${profiel.maxGlasdikte.waarde} mm)`;
  }
  return null;
}

interface Props {
  configuratie: Configuratie;
  /** Het merk van het gekozen profiel — folies zijn merkgebonden. */
  profielMerk: MerkId;
  vakken: VakMaten[];
  /** De uitgelegde stijlen, nodig om de positie van een stijl te tonen. */
  stijlen: StijlMaten[];
  selectie: Selectie;
  wijzig: (patch: Partial<Configuratie>) => void;
  onSelecteer: (selectie: Selectie) => void;
}

function Blok({ titel, children }: { titel: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-sand pt-3">
      <p className="mb-2 text-[11px] uppercase tracking-editorial text-ink-soft">{titel}</p>
      {children}
    </div>
  );
}

function Knop({
  children,
  onClick,
  actief,
  breed,
}: {
  children: React.ReactNode;
  onClick: () => void;
  actief?: boolean;
  breed?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={actief}
      className={`rounded-lg border px-3 py-2 text-left text-sm transition ${breed ? "w-full" : ""} ${
        actief
          ? "border-rebu-green bg-rebu-tint text-ink ring-1 ring-rebu-green"
          : "border-sand bg-paper text-ink hover:border-ink-soft"
      }`}
    >
      {children}
    </button>
  );
}

/**
 * Een maatveld dat pas doorgeeft wanneer je klaar bent met typen.
 *
 * Zonder deze tussenstap zou elke toetsaanslag meteen worden doorgerekend en
 * begrensd: typ je '761' dan wordt de '7' al naar de minimummaat getrokken en
 * kom je nooit bij de tweede cijfer. Daarom houdt het veld tijdens het typen
 * zijn eigen tekst vast en committeert het pas bij verlaten of Enter.
 */
function Maatveld({
  label,
  waarde,
  onWijzig,
  hint,
  placeholder,
}: {
  label: string;
  waarde: number | null;
  onWijzig: (waarde: number | null) => void;
  hint?: string;
  placeholder?: string;
}) {
  const [tekst, setTekst] = useState<string | null>(null);
  const getoond = tekst ?? (waarde === null ? "" : String(waarde));

  const commit = () => {
    if (tekst === null) return;
    const schoon = tekst.trim();
    setTekst(null);
    if (schoon === "") {
      onWijzig(null);
      return;
    }
    const getal = Number(schoon);
    if (Number.isFinite(getal)) onWijzig(Math.max(0, Math.round(getal)));
  };

  return (
    <label className="block">
      <span className="mb-1 block text-xs text-ink-soft">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          inputMode="numeric"
          value={getoond}
          placeholder={placeholder}
          onChange={(e) => setTekst(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
              (e.target as HTMLInputElement).blur();
            }
            if (e.key === "Escape") setTekst(null);
          }}
          className="w-full rounded-lg border border-sand px-3 py-2 text-sm outline-none focus:border-rebu-green"
        />
        <span className="text-xs text-ink-soft">mm</span>
      </div>
      {hint && <span className="mt-1 block text-[11px] text-ink-soft">{hint}</span>}
    </label>
  );
}

export function Eigenschappen({
  configuratie,
  profielMerk,
  vakken,
  stijlen,
  selectie,
  wijzig,
  onSelecteer,
}: Props) {
  const zetIndeling = (indeling: Indeling) => wijzig({ indeling });

  // Eén profielopzoeking voor het hele paneel: de glaskeuzes en de
  // kozijnlijst-afwerking lezen allebei de grenzen van de gekozen uitvoering.
  const gekozenProfiel = profielOpId(configuratie.profielId);

  if (!selectie) {
    return (
      <div className="rounded-xl border border-dashed border-sand p-5 text-sm text-ink-soft">
        <p className="font-medium text-ink">Niets geselecteerd</p>
        <p className="mt-1">
          Klik in de tekening op een vak, een stijl of de kozijnlijst. De keuzes die daarbij horen
          verschijnen hier.
        </p>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Een vak
  // -------------------------------------------------------------------------
  if (selectie.soort === "vak") {
    const knoop = knoopOpId(configuratie.indeling, selectie.id);
    if (!knoop || knoop.soort !== "vak") return null;
    const maten = vakken.find((v) => v.id === selectie.id);
    const ouder = zoekOuder(configuratie.indeling, selectie.id);
    const isKolom = ouder?.as === "kolommen";
    // De maat die dit vak nú heeft — precies wat er in het maatveld hoort te staan.
    const huidigeMaat = maten
      ? isKolom
        ? Math.round(maten.breedte)
        : Math.round(maten.onderkant - Math.min(maten.topLinks, maten.topRechts))
      : null;
    // Een hor gaat alleen op een deel dat opengaat.
    const kanHor = BEWEEGBAAR.includes(knoop.invulling);
    const merkKleurenVoorVak = kleurenVanMerk(profielMerk);

    /**
     * Welk schuifschema er nu ligt, afgeleid uit de indeling zelf: het aantal
     * delen en welke daarvan schuiven en waarheen. Zo staat het schema niet op
     * twee plekken opgeslagen.
     */
    const puiKinderen =
      configuratie.indeling.soort === "splitsing" ? configuratie.indeling.kinderen : [];
    const huidigPuischema =
      PUISCHEMAS.find(
        (schema) =>
          schema.delen.length === puiKinderen.length &&
          schema.delen.every((deel, i) => {
            const kind = puiKinderen[i];
            if (!kind || kind.soort !== "vak") return false;
            return deel.soort === "vast"
              ? kind.invulling !== "schuifvleugel"
              : kind.invulling === "schuifvleugel" && kind.draairichting === deel.naar;
          })
      )?.id ?? null;

    /** De hele pui opnieuw opbouwen; een pui wijzig je niet per vak. */
    const herbouwPui = (schemaId: string) => {
      const basis = blancoIndeling("Pui");
      zetIndeling(maakSchuifpui(basis, basis.id, schemaId));
      onSelecteer(null);
    };

    return (
      <div className="space-y-4">
        <div>
          <input
            value={knoop.naam}
            onChange={(e) =>
              zetIndeling(wijzigVak(configuratie.indeling, knoop.id, { naam: e.target.value }))
            }
            className="w-full rounded-lg border border-sand px-3 py-2 font-medium text-ink outline-none focus:border-rebu-green"
            aria-label="Naam van dit vak"
          />
          {maten && (
            <p className="mt-1 text-xs text-ink-soft">
              Sponning {maten.sponningBreedte} × {maten.sponningHoogte} mm · glas {maten.glasBreedte}{" "}
              × {maten.glasHoogte} mm
            </p>
          )}
        </div>

        <Blok titel="Wat komt er in dit vak">
          <div className="grid grid-cols-2 gap-2">
            {invullingenVoor(configuratie.kozijnType).map((invulling) => (
              <Knop
                key={invulling}
                actief={knoop.invulling === invulling}
                onClick={() => zetIndeling(wijzigVak(configuratie.indeling, knoop.id, { invulling }))}
              >
                {INVULLING_LABEL[invulling]}
              </Knop>
            ))}
          </div>
        </Blok>

        {BEWEEGBAAR.includes(knoop.invulling) && (
          <Blok titel={knoop.invulling === "schuifvleugel" ? "Schuifrichting" : "Draairichting"}>
            <div className="grid grid-cols-2 gap-2">
              {(["links", "rechts"] as const).map((richting) => (
                <Knop
                  key={richting}
                  actief={knoop.draairichting === richting}
                  onClick={() =>
                    zetIndeling(wijzigVak(configuratie.indeling, knoop.id, { draairichting: richting }))
                  }
                >
                  {knoop.invulling === "schuifvleugel"
                    ? richting === "links"
                      ? "Schuift naar links"
                      : "Schuift naar rechts"
                    : richting === "links"
                      ? "Links draaiend"
                      : "Rechts draaiend"}
                </Knop>
              ))}
            </div>

            {/*
              Naar binnen of naar buiten. In Nederland draait vrijwel alles naar
              binnen; naar buiten komt voor bij vluchtdeuren en bergingen. Op de
              tekening zijn de openingslijnen doorgetrokken als de vleugel naar de
              kijker toe draait en gestreept als hij van de kijker af draait.
            */}
            {knoop.invulling !== "schuifvleugel" && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(
                  [
                    [false, "Naar binnen"],
                    [true, "Naar buiten"],
                  ] as const
                ).map(([naarBuiten, label]) => (
                  <Knop
                    key={label}
                    actief={knoop.naarBuitenDraaiend === naarBuiten}
                    onClick={() =>
                      zetIndeling(
                        wijzigVak(configuratie.indeling, knoop.id, { naarBuitenDraaiend: naarBuiten })
                      )
                    }
                  >
                    {label}
                    <span className="mt-0.5 block text-[11px] text-ink-soft">
                      {naarBuiten ? "Vluchtdeur of berging" : "De gangbare keuze"}
                    </span>
                  </Knop>
                ))}
              </div>
            )}
          </Blok>
        )}

        {/*
          De bediening hoort bij de vleugel, niet bij het kozijn: in één element
          kan een raam een gewone kruk hebben en de deur ernaast een greep met
          cilinder. Zo vraagt de leverancier het ook uit.
        */}
        {BEWEEGBAAR.includes(knoop.invulling) && (
          <Blok titel="Bediening van deze vleugel">
            <div className="space-y-2">
              {(
                [
                  ["binnen", "Binnenzijde", knoop.krukBinnenId] as const,
                  ["buiten", "Buitenzijde", knoop.krukBuitenId] as const,
                ]
              ).map(([zijde, label, waarde]) => {
                const keuzes = krukkenVoor(knoop.invulling, zijde);
                if (keuzes.length === 0) return null;
                return (
                  <label key={zijde} className="block">
                    <span className="mb-1 block text-xs text-ink-soft">{label}</span>
                    <select
                      value={waarde ?? ""}
                      onChange={(e) =>
                        zetIndeling(
                          wijzigVak(configuratie.indeling, knoop.id, {
                            [zijde === "binnen" ? "krukBinnenId" : "krukBuitenId"]:
                              e.target.value || null,
                          })
                        )
                      }
                      className="w-full rounded-lg border border-sand px-3 py-2 text-sm outline-none focus:border-rebu-green"
                    >
                      <option value="">Niets aan deze zijde</option>
                      {keuzes.map((k) => (
                        <option key={k.id} value={k.id}>
                          {k.naam}
                          {k.metCilinder ? " · met cilinder" : ""}
                        </option>
                      ))}
                    </select>
                  </label>
                );
              })}

              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={knoop.stapeldorpel}
                  onChange={(e) =>
                    zetIndeling(
                      wijzigVak(configuratie.indeling, knoop.id, { stapeldorpel: e.target.checked })
                    )
                  }
                  className="mt-1 h-4 w-4 accent-rebu-green"
                />
                <span>
                  <span className="block text-ink">Stapeldorpel onder deze vleugel</span>
                  <span className="block text-[11px] text-ink-soft">
                    Extra dorpel van {STAPELDORPEL.hoogte.waarde} mm om de drempel te verhogen.
                  </span>
                </span>
              </label>
            </div>
          </Blok>
        )}

        {/* De roosterkleur is een eigen keuze; hij wijkt vaak af van het kozijn. */}
        {knoop.roosterId && (
          <Blok titel="Kleur van het rooster">
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ["buiten", "Buiten", knoop.roosterKleurBuitenId] as const,
                  ["binnen", "Binnen", knoop.roosterKleurBinnenId] as const,
                ]
              ).map(([zijde, label, waarde]) => (
                <label key={zijde} className="block">
                  <span className="mb-1 block text-xs text-ink-soft">{label}</span>
                  <select
                    value={waarde ?? ""}
                    onChange={(e) =>
                      zetIndeling(
                        wijzigVak(configuratie.indeling, knoop.id, {
                          [zijde === "buiten" ? "roosterKleurBuitenId" : "roosterKleurBinnenId"]:
                            e.target.value || null,
                        })
                      )
                    }
                    className="w-full rounded-lg border border-sand px-2 py-2 text-sm outline-none focus:border-rebu-green"
                  >
                    <option value="">Zelfde als het kozijn</option>
                    {merkKleurenVoorVak.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.code} · {k.naam}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </Blok>
        )}

        {/*
          Bovenaan staat het glas voor het hele kozijn. Wil je in één raam iets
          anders — matglas in het toilet, gelaagd bij een deur — dan zet je dat
          hier; alleen dit vak wijkt dan af, met zijn eigen prijs en gewicht.
        */}
        {knoop.invulling !== "paneel" &&
          knoop.invulling !== "rooster" &&
          knoop.binnenIndeling === null && (
            <Blok titel="Glas in dit vak">
              <select
                value={knoop.glastypeId ?? ""}
                onChange={(e) =>
                  zetIndeling(
                    wijzigVak(configuratie.indeling, knoop.id, { glastypeId: e.target.value || null })
                  )
                }
                className="w-full rounded-lg border border-sand px-3 py-2 text-sm outline-none focus:border-rebu-green"
              >
                <option value="">Zelfde glas als het kozijn</option>
                {GLASTYPES.map((g) => {
                  const beperking = glasBeperking(g, gekozenProfiel);
                  return (
                    <option key={g.id} value={g.id} disabled={beperking !== null}>
                      {g.naam} — {g.dikte} mm{g.mat ? " · geen doorzicht" : ""}
                      {beperking ? ` · ${beperking}` : ""}
                    </option>
                  );
                })}
              </select>
              <p className="mt-1 text-[11px] text-ink-soft">
                {knoop.glastypeId
                  ? "Dit vak wijkt af van het kozijnglas en staat als eigen regel op de offerte."
                  : "Volgt het glas dat bovenaan voor het hele kozijn is gekozen."}
              </p>

              <div className="mt-3">
                <p className="mb-1 text-xs text-ink-soft">Roeden in de ruit</p>
                <div className="flex items-center gap-2">
                  {(
                    [
                      ["verticaal", "Verticaal"],
                      ["horizontaal", "Horizontaal"],
                    ] as const
                  ).map(([veld, label]) => (
                    <label key={veld} className="flex flex-1 items-center gap-1.5 text-xs text-ink-soft">
                      {label}
                      <input
                        type="number"
                        min={0}
                        max={12}
                        value={knoop.roeden?.[veld] ?? 0}
                        onChange={(e) => {
                          const aantal = Math.max(0, Math.min(12, Math.floor(Number(e.target.value) || 0)));
                          const huidig = knoop.roeden ?? { verticaal: 0, horizontaal: 0, breedte: 26 };
                          const nieuw = { ...huidig, [veld]: aantal };
                          zetIndeling(
                            wijzigVak(configuratie.indeling, knoop.id, {
                              // Nul roeden is geen roedenverdeling, maar gewoon één ruit.
                              roeden: nieuw.verticaal === 0 && nieuw.horizontaal === 0 ? null : nieuw,
                            })
                          );
                        }}
                        className="w-full rounded-lg border border-sand px-2 py-1.5 text-sm text-ink outline-none focus:border-rebu-green"
                      />
                    </label>
                  ))}
                </div>
                <p className="mt-1 text-[11px] text-ink-soft">
                  Roeden liggen óver de ruit; de glasmaat verandert er niet door. Ze worden per
                  strekkende meter gerekend.
                </p>
              </div>
            </Blok>
          )}

        <Blok titel="Stijlen toevoegen">
          <p className="mb-2 text-xs text-ink-soft">
            Elke stijl splitst dit vak in extra vakken. Daarna kunt u op elk nieuw vak klikken.
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Columns3 className="h-4 w-4 shrink-0 text-ink-soft" />
              <span className="w-24 shrink-0 text-xs text-ink-soft">Verticaal</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((aantal) => (
                  <button
                    key={aantal}
                    type="button"
                    onClick={() =>
                      zetIndeling(voegStijlenToe(configuratie.indeling, knoop.id, "kolommen", aantal))
                    }
                    className="h-9 w-9 rounded-lg border border-sand text-sm text-ink transition hover:border-rebu-green hover:bg-rebu-tint"
                  >
                    {aantal}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Rows3 className="h-4 w-4 shrink-0 text-ink-soft" />
              <span className="w-24 shrink-0 text-xs text-ink-soft">Horizontaal</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((aantal) => (
                  <button
                    key={aantal}
                    type="button"
                    onClick={() =>
                      zetIndeling(voegStijlenToe(configuratie.indeling, knoop.id, "rijen", aantal))
                    }
                    className="h-9 w-9 rounded-lg border border-sand text-sm text-ink transition hover:border-rebu-green hover:bg-rebu-tint"
                  >
                    {aantal}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Blok>

        {BEWEEGBAAR.includes(knoop.invulling) && (
          <Blok titel="Stijlen in de vleugel zelf">
            <p className="mb-2 text-xs text-ink-soft">
              Verdeelt het glasvlak van deze vleugel. In de vakken die zo ontstaan kunt u glas of een
              dicht paneel zetten.
            </p>
            <div className="flex gap-1">
              {[1, 2, 3].map((aantal) => (
                <button
                  key={`bk${aantal}`}
                  type="button"
                  onClick={() =>
                    zetIndeling(voegBinnenStijlenToe(configuratie.indeling, knoop.id, "kolommen", aantal))
                  }
                  className="h-9 flex-1 rounded-lg border border-sand text-sm text-ink transition hover:border-rebu-green hover:bg-rebu-tint"
                >
                  {aantal} verticaal
                </button>
              ))}
            </div>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3].map((aantal) => (
                <button
                  key={`br${aantal}`}
                  type="button"
                  onClick={() =>
                    zetIndeling(voegBinnenStijlenToe(configuratie.indeling, knoop.id, "rijen", aantal))
                  }
                  className="h-9 flex-1 rounded-lg border border-sand text-sm text-ink transition hover:border-rebu-green hover:bg-rebu-tint"
                >
                  {aantal} horizontaal
                </button>
              ))}
            </div>
            {knoop.binnenIndeling && (
              <button
                type="button"
                onClick={() => zetIndeling(wisBinnenIndeling(configuratie.indeling, knoop.id))}
                className="mt-2 w-full text-xs text-ink-soft underline underline-offset-4 hover:text-ink"
              >
                Stijlen in deze vleugel weghalen
              </button>
            )}
          </Blok>
        )}

        {configuratie.kozijnType !== "schuifpui" && (
          <Blok titel="Rooster">
            <div className="space-y-2">
              <Knop
                breed
                actief={knoop.roosterId !== null && knoop.invulling !== "rooster"}
                onClick={() =>
                  zetIndeling(
                    wijzigVak(configuratie.indeling, knoop.id, {
                      roosterId: knoop.roosterId ? null : "rooster-standaard",
                    })
                  )
                }
              >
                <Wind className="mr-2 inline h-4 w-4" />
                Rooster in de beglazing{" "}
                {knoop.roosterId && knoop.invulling !== "rooster" ? "(aan)" : ""}
              </Knop>
              <Knop
                breed
                onClick={() => {
                  const rooster = ROOSTERS[0];
                  zetIndeling(
                    voegRoosterBovenToe(
                      configuratie.indeling,
                      knoop.id,
                      rooster.id,
                      rooster.bouwhoogte.waarde
                    )
                  );
                }}
              >
                <Plus className="mr-2 inline h-4 w-4" />
                Rooster tussen stijlen erboven
              </Knop>
              {/*
                Waar het rooster in het vak zit. Niet elke plek kan overal: in
                een schuivende vleugel kan er niets boven, want die moet langs de
                rail. De onmogelijke keuzes staan er wel, maar uitgeschakeld en
                met de reden erbij — zo weet je waarom het niet kan.
              */}
              {knoop.roosterId && (
                <div className="space-y-1.5">
                  {(
                    [
                      ["boven-in-glas", "Boven in de beglazing", null],
                      ["onder-in-glas", "Onder in de beglazing", null],
                      [
                        "boven-in-kozijn",
                        "Boven in het kozijn",
                        knoop.invulling === "schuifvleugel"
                          ? "Niet mogelijk: de schuivende vleugel moet hier langs"
                          : null,
                      ],
                    ] as [typeof knoop.roosterpositie, string, string | null][]
                  ).map(([positie, label, waarom]) => (
                    <button
                      key={positie}
                      type="button"
                      disabled={waarom !== null}
                      onClick={() =>
                        zetIndeling(
                          wijzigVak(configuratie.indeling, knoop.id, { roosterpositie: positie })
                        )
                      }
                      aria-pressed={knoop.roosterpositie === positie}
                      className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                        waarom !== null
                          ? "cursor-not-allowed border-sand bg-sand/40 text-ink-soft/60"
                          : knoop.roosterpositie === positie
                            ? "border-rebu-green bg-rebu-tint text-ink ring-1 ring-rebu-green"
                            : "border-sand bg-paper text-ink hover:border-ink-soft"
                      }`}
                    >
                      {label}
                      {waarom && (
                        <span className="mt-0.5 block text-[11px] italic">{waarom}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {knoop.roosterId && (
                <select
                  value={knoop.roosterId}
                  onChange={(e) =>
                    zetIndeling(
                      wijzigVak(configuratie.indeling, knoop.id, { roosterId: e.target.value })
                    )
                  }
                  className="w-full rounded-lg border border-sand px-3 py-2 text-sm outline-none focus:border-rebu-green"
                >
                  {roostersVoor(configuratie.kozijnType).map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.naam} — {r.bouwhoogte.waarde} mm
                    </option>
                  ))}
                </select>
              )}
            </div>
          </Blok>
        )}

        {configuratie.kozijnType === "schuifpui" && (
          <Blok titel="Schuifschema">
            <p className="mb-2 text-xs text-ink-soft">
              Een pui is geen vrije indeling: de fabrikant levert een vast aantal schema&rsquo;s. Per
              schema ligt vast welk deel schuift en welke kant het op gaat.
            </p>
            <div className="space-y-2">
              {PUISCHEMAS.map((schema) => (
                <Knop
                  key={schema.id}
                  breed
                  actief={huidigPuischema === schema.id}
                  onClick={() => herbouwPui(schema.id)}
                >
                  {schema.naam}
                  <span className="mt-0.5 block text-[11px] text-ink-soft">{schema.omschrijving}</span>
                </Knop>
              ))}
            </div>
          </Blok>
        )}

        <Blok titel={kanHor ? "Maat en hor" : "Maat"}>
          <div className="space-y-3">
            {/*
              Het veld toont gewoon de maat die dit vak nú heeft. Overtypen zet
              die maat vast; zolang je er niets mee doet beweegt het vak mee met
              de rest van het kozijn.
            */}
            <Maatveld
              label={isKolom ? "Breedte van dit vak" : "Hoogte van dit vak"}
              waarde={knoop.vasteMaat ?? huidigeMaat}
              hint={
                knoop.vasteMaat === null
                  ? "Volgt uit de indeling. Typ een maat om hem vast te zetten."
                  : "Ligt vast; de andere vakken vangen het verschil op."
              }
              onWijzig={(vasteMaat) =>
                zetIndeling(zetVasteMaat(configuratie.indeling, knoop.id, vasteMaat))
              }
            />
            {knoop.vasteMaat !== null && (
              <button
                type="button"
                onClick={() => zetIndeling(zetVasteMaat(configuratie.indeling, knoop.id, null))}
                className="text-xs text-ink-soft underline underline-offset-4 hover:text-ink"
              >
                Laat deze maat weer meebewegen
              </button>
            )}

            {/*
              Een hor hangt vóór een deel dat opengaat. Bij vast glas, een paneel
              of een rooster is er niets om af te schermen, dus is de keuze er ook
              niet. De hormaat wordt hoe dan ook doorgerekend (regel 2) en staat
              in het maatvoeringsoverzicht.
            */}
            {kanHor && (
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={knoop.horMeegeleverd}
                  onChange={(e) => {
                    const aan = e.target.checked;
                    // Een hor aanzetten zonder hortype zou meteen een blokkade
                    // geven; daarom kiest hij hier zelf het eerste passende type.
                    const patch: Partial<Configuratie> = {
                      indeling: wijzigVak(configuratie.indeling, knoop.id, { horMeegeleverd: aan }),
                    };
                    if (aan && !configuratie.hortypeId) {
                      const passend = HORTYPES.find((h) =>
                        h.voorTypes.includes(configuratie.kozijnType)
                      );
                      if (passend) patch.hortypeId = passend.id;
                    }
                    wijzig(patch);
                  }}
                  className="mt-1 h-4 w-4 accent-rebu-green"
                />
                <span>
                  <span className="block text-ink">Hor op dit vak meeleveren</span>
                  {maten && (
                    <span className="block text-[11px] text-ink-soft">
                      Hormaat {maten.horBreedte} × {maten.horHoogte} mm
                    </span>
                  )}
                </span>
              </label>
            )}

            {/* Het hortype hoort bij het raam dat opengaat, niet bij het kozijn. */}
            {kanHor && knoop.horMeegeleverd && (
              <label className="block">
                <span className="mb-1 block text-xs text-ink-soft">Soort hor</span>
                <select
                  value={configuratie.hortypeId ?? ""}
                  onChange={(e) => wijzig({ hortypeId: e.target.value || null })}
                  className="w-full rounded-lg border border-sand px-3 py-2 text-sm outline-none focus:border-rebu-green"
                >
                  <option value="">Nog geen soort gekozen</option>
                  {HORTYPES.filter((h) => h.voorTypes.includes(configuratie.kozijnType)).map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.naam}
                    </option>
                  ))}
                </select>
                <span className="mt-1 block text-[11px] text-ink-soft">
                  Geldt voor alle horren in dit kozijn.
                </span>
              </label>
            )}
          </div>
        </Blok>

        {zoekOuder(configuratie.indeling, knoop.id) && (
          <button
            type="button"
            onClick={() => {
              zetIndeling(verwijderKnoop(configuratie.indeling, knoop.id));
              onSelecteer(null);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-sand py-2 text-sm text-ink-soft transition hover:border-red-300 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
            Dit vak verwijderen
          </button>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Een vak bínnen een vleugel: een ruit of paneel in de deur zelf
  // -------------------------------------------------------------------------
  if (selectie.soort === "binnenvak") {
    const vleugel = knoopOpId(configuratie.indeling, selectie.vakId);
    if (!vleugel || vleugel.soort !== "vak" || !vleugel.binnenIndeling) return null;
    const deel = knoopOpId(vleugel.binnenIndeling, selectie.id);
    if (!deel || deel.soort !== "vak") return null;

    const maten = vakken
      .find((v) => v.id === selectie.vakId)
      ?.binnenVakken.find((v) => v.id === selectie.id);
    const isPaneel = deel.invulling === "paneel";
    const merkKleuren = kleurenVanMerk(profielMerk);
    const zetDeel = (patch: Partial<VakInvoer>) =>
      zetIndeling(wijzigBinnenVak(configuratie.indeling, selectie.vakId, selectie.id, patch));

    // De splitsing waar deze vulling in zit bepaalt of de maat een breedte of
    // een hoogte is, en draagt de breedte van de stijl ertussen.
    const binnenOuder = zoekOuder(vleugel.binnenIndeling, selectie.id);
    const binnenIsKolom = binnenOuder?.as === "kolommen";
    const binnenHuidigeMaat = maten
      ? binnenIsKolom
        ? Math.round(maten.breedte)
        : Math.round(maten.onderkant - Math.min(maten.topLinks, maten.topRechts))
      : null;

    return (
      <div className="space-y-4">
        <div>
          <input
            value={deel.naam}
            onChange={(e) => zetDeel({ naam: e.target.value })}
            className="w-full rounded-lg border border-sand px-3 py-2 font-medium text-ink outline-none focus:border-rebu-green"
            aria-label="Naam van deze vulling"
          />
          <p className="mt-1 text-xs text-ink-soft">
            In vleugel &lsquo;{vleugel.naam}&rsquo;
            {maten &&
              ` · ${isPaneel ? "paneelmaat" : "glasmaat"} ${maten.glasBreedte} × ${maten.glasHoogte} mm`}
          </p>
        </div>

        <Blok titel="Glas of paneel">
          <div className="grid grid-cols-2 gap-2">
            <Knop actief={!isPaneel} onClick={() => zetDeel({ invulling: "vast" })}>
              Glas
            </Knop>
            <Knop actief={isPaneel} onClick={() => zetDeel({ invulling: "paneel" })}>
              Dicht paneel
            </Knop>
          </div>
        </Blok>

        {/*
          De stijl in de vleugel zit tussen twee vullingen in. Je verplaatst hem
          door de maat van de vulling ernaast vast te zetten, en je verandert hem
          zelf door de stijlbreedte aan te passen — precies zoals bij een stijl
          in het kozijn.
        */}
        <Blok titel={binnenIsKolom ? "Breedte en stijl" : "Hoogte en stijl"}>
          <div className="space-y-3">
            <Maatveld
              label={binnenIsKolom ? "Breedte van deze vulling" : "Hoogte van deze vulling"}
              waarde={deel.vasteMaat ?? binnenHuidigeMaat}
              hint={
                deel.vasteMaat === null
                  ? "Volgt uit de indeling van de vleugel. Typ een maat om de stijl vast te zetten."
                  : "Ligt vast; de andere vulling in deze vleugel vangt het verschil op."
              }
              onWijzig={(maat) =>
                zetIndeling(
                  wijzigVak(configuratie.indeling, selectie.vakId, {
                    binnenIndeling: zetVasteMaat(vleugel.binnenIndeling!, selectie.id, maat),
                  })
                )
              }
            />
            {deel.vasteMaat !== null && (
              <button
                type="button"
                onClick={() =>
                  zetIndeling(
                    wijzigVak(configuratie.indeling, selectie.vakId, {
                      binnenIndeling: zetVasteMaat(vleugel.binnenIndeling!, selectie.id, null),
                    })
                  )
                }
                className="text-xs text-ink-soft underline underline-offset-4 hover:text-ink"
              >
                Laat deze maat weer meebewegen
              </button>
            )}
            {binnenOuder && (
              <Maatveld
                label="Breedte van de stijl in de vleugel"
                waarde={binnenOuder.scheidingBreedte}
                hint="De zichtbare breedte van de tussenstijl in deze vleugel."
                onWijzig={(breedte) =>
                  breedte !== null &&
                  zetIndeling(
                    wijzigBinnenSplitsing(configuratie.indeling, selectie.vakId, binnenOuder.id, {
                      scheidingBreedte: Math.max(20, breedte),
                    })
                  )
                }
              />
            )}
          </div>
        </Blok>

        {isPaneel ? (
          <>
            <Blok titel="Kleur van het paneel">
              <select
                value={deel.paneelKleurId ?? ""}
                onChange={(e) => zetDeel({ paneelKleurId: e.target.value || null })}
                className="w-full rounded-lg border border-sand px-3 py-2 text-sm outline-none focus:border-rebu-green"
              >
                <option value="">Zelfde kleur als het kozijn</option>
                {merkKleuren.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.code} · {k.naam}
                  </option>
                ))}
              </select>
            </Blok>
            <Blok titel="Dikte">
              <select
                value={deel.paneeltypeId ?? ""}
                onChange={(e) => zetDeel({ paneeltypeId: e.target.value || null })}
                className="w-full rounded-lg border border-sand px-3 py-2 text-sm outline-none focus:border-rebu-green"
              >
                <option value="">Standaarddikte</option>
                {PANEELTYPES.map((pt) => (
                  <option key={pt.id} value={pt.id}>
                    {pt.naam} — U {pt.uWaarde}
                  </option>
                ))}
              </select>
            </Blok>
          </>
        ) : (
          <Blok titel="Glastype voor dit vak">
            <select
              value={deel.glastypeId ?? ""}
              onChange={(e) => zetDeel({ glastypeId: e.target.value || null })}
              className="w-full rounded-lg border border-sand px-3 py-2 text-sm outline-none focus:border-rebu-green"
            >
              <option value="">Zelfde glas als het kozijn</option>
              {GLASTYPES.map((g) => {
                const beperking = glasBeperking(g, gekozenProfiel);
                return (
                  <option key={g.id} value={g.id} disabled={beperking !== null}>
                    {g.naam} — {g.dikte} mm{beperking ? ` · ${beperking}` : ""}
                  </option>
                );
              })}
            </select>
          </Blok>
        )}

        <Blok titel="Stijlen in de vleugel">
          <div className="flex gap-1">
            {[1, 2].map((aantal) => (
              <button
                key={`vk${aantal}`}
                type="button"
                onClick={() =>
                  zetIndeling(
                    voegBinnenStijlenToe(
                      configuratie.indeling,
                      selectie.vakId,
                      "kolommen",
                      aantal,
                      selectie.id
                    )
                  )
                }
                className="h-9 flex-1 rounded-lg border border-sand text-sm text-ink transition hover:border-rebu-green hover:bg-rebu-tint"
              >
                {aantal} verticaal
              </button>
            ))}
          </div>
          <div className="mt-2 flex gap-1">
            {[1, 2].map((aantal) => (
              <button
                key={`vr${aantal}`}
                type="button"
                onClick={() =>
                  zetIndeling(
                    voegBinnenStijlenToe(
                      configuratie.indeling,
                      selectie.vakId,
                      "rijen",
                      aantal,
                      selectie.id
                    )
                  )
                }
                className="h-9 flex-1 rounded-lg border border-sand text-sm text-ink transition hover:border-rebu-green hover:bg-rebu-tint"
              >
                {aantal} horizontaal
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              zetIndeling(wisBinnenIndeling(configuratie.indeling, selectie.vakId));
              onSelecteer({ soort: "vak", id: selectie.vakId });
            }}
            className="mt-2 w-full text-xs text-ink-soft underline underline-offset-4 hover:text-ink"
          >
            Alle stijlen in deze vleugel weghalen
          </button>
        </Blok>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Een stijl
  // -------------------------------------------------------------------------
  if (selectie.soort === "stijl") {
    const knoop = knoopOpId(configuratie.indeling, selectie.splitsingId);
    if (!knoop || knoop.soort !== "splitsing") return null;
    const stijl = stijlen.find(
      (s) => s.splitsingId === selectie.splitsingId && s.index === selectie.index
    );
    const horizontaal = knoop.as === "rijen";

    /**
     * De positie van de stijl is op twee manieren uit te drukken, en beide
     * komen op een werktekening voor. Ze sturen dezelfde waarde aan: de vaste
     * maat van het vak vóór de stijl.
     *
     *   hart      — afstand van de buitenkant van het kozijn tot het hart van
     *               de stijl. Dit is wat de fabriek aftekent.
     *   vakmaat   — de sponningmaat van het vak ervóór.
     */
    const dikte = knoop.scheidingBreedte;
    const beginStijl = stijl ? (horizontaal ? stijl.y : stijl.x) : 0;
    const beginVak = stijl ? beginStijl - stijl.vorigeMaat : 0;
    const hart = stijl ? Math.round(beginStijl + dikte / 2) : null;

    /** Zet de vaste maat van het vak vóór de stijl, binnen de beschikbare ruimte. */
    const zetVorigeMaat = (gewenst: number) => {
      if (!stijl) return;
      const ruimte = stijl.vorigeMaat + stijl.volgendeMaat;
      const maat = Math.round(
        Math.min(ruimte - MINIMALE_VAKMAAT, Math.max(MINIMALE_VAKMAAT, gewenst))
      );
      const kinderen = knoop.kinderen.map((kind, i) => {
        if (i === selectie.index) return { ...kind, vasteMaat: maat };
        // Het vak erná wordt weer flexibel, zodat het de rest opvangt.
        if (i === selectie.index + 1) return { ...kind, vasteMaat: null };
        return kind;
      });
      zetIndeling(wijzigSplitsing(configuratie.indeling, knoop.id, { kinderen }));
    };

    return (
      <div className="space-y-4">
        <div>
          <p className="font-medium text-ink">
            {horizontaal ? "Horizontale stijl" : "Verticale stijl"}
          </p>
          <p className="text-xs text-ink-soft">
            Scheidt {knoop.kinderen.length} vakken · stijl {selectie.index + 1} van{" "}
            {knoop.kinderen.length - 1}
          </p>
        </div>

        {stijl && (
          <Blok titel="Positie van de stijl">
            <div className="space-y-3">
              <Maatveld
                label={
                  horizontaal ? "Vanaf de bovenkant tot hart stijl" : "Vanaf de linkerkant tot hart stijl"
                }
                waarde={hart}
                onWijzig={(nieuwHart) => {
                  if (nieuwHart === null) return;
                  zetVorigeMaat(nieuwHart - beginVak - dikte / 2);
                }}
                hint="Gemeten vanaf de buitenkant van het kozijn. Slepen in de tekening past dit ook aan."
              />
              <Maatveld
                label={horizontaal ? "Hoogte van het vak erboven" : "Breedte van het vak ervoor"}
                waarde={stijl.vorigeMaat}
                onWijzig={(maat) => maat !== null && zetVorigeMaat(maat)}
                hint={`Sponningmaat. Het vak erna wordt ${stijl.volgendeMaat} mm en vangt het verschil op.`}
              />
            </div>
          </Blok>
        )}

        <Blok titel="Dikte">
          <Maatveld
            label="Dikte van de stijl"
            waarde={knoop.scheidingBreedte}
            onWijzig={(scheidingBreedte) =>
              zetIndeling(
                wijzigSplitsing(configuratie.indeling, knoop.id, {
                  scheidingBreedte: scheidingBreedte ?? 0,
                })
              )
            }
            hint="Alle stijlen in deze splitsing krijgen dezelfde dikte."
          />
        </Blok>

        <Blok titel="Verhouding van de vakken">
          <div className="space-y-2">
            {knoop.kinderen.map((kind) => (
              <div key={kind.id} className="flex items-center gap-2">
                <span className="flex-1 truncate text-sm text-ink">
                  {kind.soort === "vak" ? kind.naam : "Groep"}
                </span>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={kind.gewicht}
                  onChange={(e) => {
                    const gewicht = Math.max(1, Number(e.target.value) || 1);
                    const kinderen = knoop.kinderen.map((k) =>
                      k.id === kind.id ? { ...k, gewicht } : k
                    );
                    zetIndeling(wijzigSplitsing(configuratie.indeling, knoop.id, { kinderen }));
                  }}
                  className="w-16 rounded-lg border border-sand px-2 py-1.5 text-sm outline-none focus:border-rebu-green"
                />
              </div>
            ))}
          </div>
        </Blok>

        <button
          type="button"
          onClick={() => {
            zetIndeling(verwijderKnoop(configuratie.indeling, knoop.kinderen[selectie.index + 1].id));
            onSelecteer(null);
          }}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-sand py-2 text-sm text-ink-soft transition hover:border-red-300 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
          Deze stijl verwijderen
        </button>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Een kozijnlijst
  // -------------------------------------------------------------------------
  const zijdeLabel = {
    boven: "bovenregel",
    onder: "onderregel",
    links: "linkerstijl",
    rechts: "rechterstijl",
  }[selectie.zijde];

  const profiel = gekozenProfiel;
  const aanslagMm = profiel?.geometrie.aanslag.waarde ?? 0;
  const zijdeafwerking = configuratie.kozijnzijden[selectie.zijde];
  const stelmaat = profiel
    ? berekenStelmaat(configuratie, profiel)
    : { breedte: configuratie.breedte, hoogte: configuratie.hoogte };

  /** Past de aansluiting van deze ene zijde aan. */
  const zetZijde = (patch: Partial<typeof zijdeafwerking>) => {
    const nieuw = { ...zijdeafwerking, ...patch };
    // Zonder aanslag is er geen lip om rubber in te leggen.
    if (!nieuw.aanslag) nieuw.rubber = false;
    wijzig({ kozijnzijden: { ...configuratie.kozijnzijden, [selectie.zijde]: nieuw } });
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="font-medium text-ink">Kozijn — {zijdeLabel}</p>
        <p className="text-xs text-ink-soft">De aansluiting op het metselwerk aan deze zijde.</p>
      </div>

      {/*
        De aanslag is de lip die over het metselwerk valt en die de stelmaat
        bepaalt. Tegen een bestaand kozijn, een dorpel of een tweede element aan
        wordt hij weggelaten; dan sluit het profiel vlak aan. Het rubber zit in
        die lip en is een losse keuze.
      */}
      <Blok titel={`Aansluiting ${zijdeLabel}`}>
        <div className="space-y-2">
          <Knop
            breed
            actief={zijdeafwerking.aanslag}
            onClick={() => zetZijde({ aanslag: !zijdeafwerking.aanslag })}
          >
            Aanslag {aanslagMm} mm {zijdeafwerking.aanslag ? "(aan)" : "(weggelaten)"}
            <span className="mt-0.5 block text-[11px] text-ink-soft">
              {zijdeafwerking.aanslag
                ? "De lip valt over het metselwerk; de stelmaat wordt hier smaller."
                : "Het profiel sluit vlak aan; hier gaat niets over het metselwerk."}
            </span>
          </Knop>
          <Knop
            breed
            actief={zijdeafwerking.rubber}
            onClick={() => zetZijde({ rubber: !zijdeafwerking.rubber })}
          >
            Aanslagrubber {zijdeafwerking.rubber ? "(aan)" : "(geen)"}
            <span className="mt-0.5 block text-[11px] text-ink-soft">
              {zijdeafwerking.aanslag
                ? "Zit in de aanslag en drukt tegen het metselwerk."
                : "Zonder aanslag is er geen lip om het rubber in te leggen."}
            </span>
          </Knop>
          {/*
            De aansluiting op het metselwerk geldt voor het hele kozijn, maar
            hoort thuis waar je erover nadenkt: bij de kozijnlijst.
          */}
          <label className="block">
            <span className="mb-1 block text-xs text-ink-soft">Aansluiting op het metselwerk</span>
            <select
              value={configuratie.muuraansluitingId}
              onChange={(e) => wijzig({ muuraansluitingId: e.target.value })}
              className="w-full rounded-lg border border-sand px-3 py-2 text-sm outline-none focus:border-rebu-green"
            >
              {MUURAANSLUITINGEN.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.naam}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-[11px] text-ink-soft">
              {MUURAANSLUITINGEN.find((m) => m.id === configuratie.muuraansluitingId)?.omschrijving}
            </span>
          </label>

          {/*
            Een bijprofiel komt bíj het kozijn op deze zijde: een verbreding om
            de sparing te vullen, een koppelprofiel naar het element ernaast, of
            een waterslag onder de onderregel. De stelmaat wordt daar ruimer van.
          */}
          <label className="block">
            <span className="mb-1 block text-xs text-ink-soft">Bijprofiel op deze zijde</span>
            <select
              value={zijdeafwerking.bijprofielId ?? ""}
              onChange={(e) => zetZijde({ bijprofielId: e.target.value || null })}
              className="w-full rounded-lg border border-sand px-3 py-2 text-sm outline-none focus:border-rebu-green"
            >
              <option value="">Geen bijprofiel</option>
              {bijprofielenVoor(selectie.zijde).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.naam} — {b.hoogte.waarde} mm
                </option>
              ))}
            </select>
            {zijdeafwerking.bijprofielId && (
              <span className="mt-1 block text-[11px] text-ink-soft">
                {bijprofielOpId(zijdeafwerking.bijprofielId)?.omschrijving}
              </span>
            )}
          </label>

          <p className="text-[11px] text-ink-soft">
            Stelmaat nu {stelmaat.breedte} × {stelmaat.hoogte} mm — de sparingmaat die u aanhoudt.
          </p>
        </div>
      </Blok>

      {selectie.zijde === "onder" ? (
        <Blok titel="Dorpel">
          <p className="mb-2 text-xs text-ink-soft">
            Van de onderregel kunt u een dorpel maken. Een dorpel is zwaarder en heeft waterafvoer;
            detail B tekent hem dan met afschot en waterhol.
          </p>
          <div className="space-y-2">
            <Knop breed actief={configuratie.dorpelId === null} onClick={() => wijzig({ dorpelId: null })}>
              Geen aparte dorpel
            </Knop>
            {DORPELS.filter((d) => d.voorTypes.includes(configuratie.kozijnType)).map((dorpel) => (
              <Knop
                key={dorpel.id}
                breed
                actief={configuratie.dorpelId === dorpel.id}
                onClick={() => wijzig({ dorpelId: dorpel.id })}
              >
                {dorpel.naam}
                <span className="mt-0.5 block text-[11px] text-ink-soft">
                  hoogte {dorpel.hoogte.waarde} mm
                </span>
              </Knop>
            ))}
          </div>
        </Blok>
      ) : (
        <Blok titel="Kozijnlijst">
          <p className="text-xs text-ink-soft">
            De zichtbreedte van de kozijnlijst hoort bij het profielsysteem en wordt in het
            adminscherm beheerd. Van de onderregel kunt u wél een dorpel maken — klik daarvoor op de
            onderste lijst.
          </p>
        </Blok>
      )}

      {/*
        De afwatering zit in de onderregel; daar hoort de keuze dus ook. De
        sleuven zijn in het buitenaanzicht te zien.
      */}
      {selectie.zijde === "onder" && (
        <Blok titel="Afwatering">
          <p className="mb-2 text-xs text-ink-soft">
            Water dat langs het glas naar beneden loopt verzamelt zich in deze regel en moet er via
            sleuven weer uit. Bij {configuratie.breedte} mm breed worden dat er{" "}
            {aantalAfwateringssleuven(configuratie.breedte)}.
          </p>
          <div className="space-y-2">
            {(
              [
                ["zichtbaar", "Zichtbare sleuven", "De standaard: open sleuven in de buitenwand."],
                [
                  "afdekkap",
                  "Sleuven met afdekkap",
                  "Zelfde sleuven, weggewerkt achter een kapje in de kozijnkleur.",
                ],
                [
                  "verdekt",
                  "Verdekt — onderlangs",
                  "De sleuven zitten aan de onderkant; in het aanzicht is er niets van te zien. Vereist dat het water eronder weg kan.",
                ],
                [
                  "geen",
                  "Geen afwatering",
                  "Alleen bij een binnenkozijn of een kozijn dat nog wordt afgetimmerd.",
                ],
              ] as [Afwatering, string, string][]
            ).map(([waarde, titel, uitleg]) => (
              <Knop
                key={waarde}
                breed
                actief={configuratie.afwatering === waarde}
                onClick={() => wijzig({ afwatering: waarde })}
              >
                {titel}
                <span className="mt-0.5 block text-[11px] text-ink-soft">{uitleg}</span>
              </Knop>
            ))}
          </div>
        </Blok>
      )}
    </div>
  );
}
