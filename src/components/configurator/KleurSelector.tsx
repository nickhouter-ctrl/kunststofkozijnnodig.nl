"use client";

/**
 * De verbeterde kleurselector uit hoofdstuk 8.2.
 *
 * Toont elke folie als echte swatch-afbeelding uit de kleurencatalogus van
 * kunststofkozijnnodig.nl — niet als tekstcode. Gegroepeerd in effen /
 * structuur / houtlook, met zoeken op naam, RAL-code of leverancierscode.
 */
import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import {
  GROEP_LABEL,
  GROEP_VOLGORDE,
  isBasiskleur,
  kleurenVanMerk,
  oppervlakTekst,
} from "@/configurator/data/kleuren";
import type { Kleur, MerkId } from "@/configurator/types";

interface Props {
  merk: MerkId;
  waarde: string;
  onKies: (kleurId: string) => void;
  label: string;
}

function Swatch({ kleur, gekozen, onKies }: { kleur: Kleur; gekozen: boolean; onKies: () => void }) {
  return (
    <button
      type="button"
      onClick={onKies}
      aria-pressed={gekozen}
      title={`${kleur.code} ${kleur.naam}${kleur.ral ? ` — ${kleur.ral}` : ""} · ${oppervlakTekst(kleur)}`}
      className={`group relative overflow-hidden rounded-lg border text-left transition ${
        gekozen
          ? "border-rebu-green ring-2 ring-rebu-green/40"
          : "border-sand hover:border-ink-soft"
      }`}
    >
      <div
        className="h-14 w-full bg-cover bg-center"
        style={
          kleur.swatch
            ? { backgroundImage: `url(${kleur.swatch})` }
            : { backgroundColor: kleur.hex ?? "#d9d6ce" }
        }
      />
      {gekozen && (
        <span className="absolute right-1 top-1 rounded-full bg-rebu-green p-0.5 text-paper">
          <Check className="h-3 w-3" />
        </span>
      )}
      {/* De houtnerf is voelbaar en zichtbaar; die hoort dus op het staal zelf. */}
      {kleur.houtnerf === true && (
        <span className="absolute left-1 top-1 rounded bg-ink/70 px-1 text-[9px] font-medium text-paper">
          nerf
        </span>
      )}
      {/* De basiskleuren zijn het profiel zelf: geen folie, geen toeslag. */}
      {isBasiskleur(kleur) && (
        <span className="absolute left-1 top-1 rounded bg-rebu-green px-1 text-[9px] font-medium text-paper">
          zonder folie
        </span>
      )}
      <div className="px-2 py-1.5">
        <p className="truncate text-[11px] font-medium leading-tight text-ink">{kleur.naam}</p>
        <p className="truncate text-[10px] leading-tight text-ink-soft">
          {/* Bij Aluplast is de AP-code de bestelcode; die staat altijd voorop. */}
          {kleur.merk === "aluplast" ? kleur.code : (kleur.ral ?? kleur.code)}
          {kleur.ral && kleur.merk === "aluplast" ? ` · ${kleur.ral}` : ""}
        </p>
      </div>
    </button>
  );
}

export function KleurSelector({ merk, waarde, onKies, label }: Props) {
  const [zoek, setZoek] = useState("");
  const [groepFilter, setGroepFilter] = useState<Kleur["groep"] | "alle">("alle");
  const [nerfFilter, setNerfFilter] = useState<"alle" | "nerf" | "glad">("alle");

  const alle = useMemo(() => kleurenVanMerk(merk), [merk]);

  const zichtbaar = useMemo(() => {
    const term = zoek.trim().toLowerCase();
    return alle.filter((k) => {
      if (groepFilter !== "alle" && k.groep !== groepFilter) return false;
      // Onbekend blijft buiten beide filters: de catalogus zegt er niets over.
      if (nerfFilter === "nerf" && k.houtnerf !== true) return false;
      if (nerfFilter === "glad" && k.houtnerf !== false) return false;
      if (!term) return true;
      return (
        k.naam.toLowerCase().includes(term) ||
        (k.ral ?? "").toLowerCase().includes(term) ||
        k.code.toLowerCase().includes(term) ||
        (k.structuur ?? "").toLowerCase().includes(term)
      );
    });
  }, [alle, zoek, groepFilter, nerfFilter]);

  const perGroep = GROEP_VOLGORDE.map((groep) => ({
    groep,
    // De ongefolieerde basiskleuren staan vooraan: dat is wat er standaard
    // geleverd wordt en waar de meeste kozijnen in gaan.
    kleuren: zichtbaar
      .filter((k) => k.groep === groep)
      .sort((a, b) => Number(isBasiskleur(b)) - Number(isBasiskleur(a))),
  })).filter((g) => g.kleuren.length > 0);

  const gekozen = alle.find((k) => k.id === waarde) ?? null;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-ink">{label}</p>
          <p className="text-xs text-ink-soft">
            {gekozen
              ? `${gekozen.code} · ${gekozen.naam}${gekozen.ral ? ` · ${gekozen.ral}` : ""} · ${oppervlakTekst(gekozen)}`
              : "Nog geen kleur gekozen"}
          </p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-soft" />
          <input
            type="search"
            value={zoek}
            onChange={(e) => setZoek(e.target.value)}
            placeholder="Zoek op naam of RAL"
            className="w-44 rounded-full border border-sand py-1.5 pl-8 pr-3 text-xs text-ink outline-none focus:border-rebu-green"
          />
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {(["alle", ...GROEP_VOLGORDE] as const).map((groep) => (
          <button
            key={groep}
            type="button"
            onClick={() => setGroepFilter(groep)}
            className={`rounded-full px-3 py-1 text-xs transition ${
              groepFilter === groep
                ? "bg-ink text-paper"
                : "border border-sand text-ink-soft hover:border-ink-soft"
            }`}
          >
            {groep === "alle" ? `Alle (${alle.length})` : GROEP_LABEL[groep]}
          </button>
        ))}
      </div>

      {/* Alleen tonen wanneer het merk de structuur daadwerkelijk aanlevert. */}
      {alle.some((k) => k.houtnerf !== null) && (
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-ink-soft">Oppervlak</span>
          {(
            [
              ["alle", "Alle"],
              ["nerf", `Met houtnerf (${alle.filter((k) => k.houtnerf === true).length})`],
              ["glad", `Zonder nerf (${alle.filter((k) => k.houtnerf === false).length})`],
            ] as const
          ).map(([waarde, label]) => (
            <button
              key={waarde}
              type="button"
              onClick={() => setNerfFilter(waarde)}
              className={`rounded-full px-3 py-1 text-xs transition ${
                nerfFilter === waarde
                  ? "bg-ink text-paper"
                  : "border border-sand text-ink-soft hover:border-ink-soft"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="max-h-72 space-y-4 overflow-y-auto pr-1">
        {perGroep.map(({ groep, kleuren }) => (
          <div key={groep}>
            <p className="mb-1.5 text-[11px] uppercase tracking-editorial text-ink-soft">
              {GROEP_LABEL[groep]}
            </p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {kleuren.map((kleur) => (
                <Swatch
                  key={kleur.id}
                  kleur={kleur}
                  gekozen={kleur.id === waarde}
                  onKies={() => onKies(kleur.id)}
                />
              ))}
            </div>
          </div>
        ))}
        {zichtbaar.length === 0 && (
          <p className="py-6 text-center text-sm text-ink-soft">
            Geen kleuren gevonden voor &lsquo;{zoek}&rsquo;.
          </p>
        )}
      </div>
    </div>
  );
}
