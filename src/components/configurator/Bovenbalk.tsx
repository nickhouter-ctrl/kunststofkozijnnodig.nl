"use client";

/**
 * De vaste gegevens van de hele order, bovenaan het scherm.
 *
 * Profiel, kleur, hoekverbinding, glas en afwatering gelden voor élk kozijn in
 * dezelfde order — je bestelt geen kozijnen in vier verschillende kleuren in
 * één levering. Ze staan daarom niet per kozijn in een zijpaneel maar één keer
 * bovenaan, en een wijziging werkt meteen door in alle kozijnen. Dat is precies
 * waarom een nieuw kozijn de kleur en de hoekverbinding overneemt: die zijn
 * niet van het kozijn, ze zijn van de order.
 */
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { PROFIELEN } from "@/configurator/data/profielen";
import {
  AFKITOPTIES,
  AFSTANDSHOUDERS,
  GLASTYPES,
} from "@/configurator/data/onderdelen";
import { standaardKleur } from "@/configurator/data/kleuren";
import { KleurKnop, KleurPopup } from "./KleurKnop";
import type { Afwatering, Configuratie, Profiel } from "@/configurator/types";

interface Props {
  configuratie: Configuratie;
  profiel: Profiel;
  /** Past de wijziging toe op élk kozijn in de order. */
  wijzigAlle: (patch: Partial<Configuratie>) => void;
  /** Hoeveel kozijnen er meeveranderen — dat mag je best weten. */
  aantalElementen: number;
}

type Veld = "kaderBuiten" | "kaderBinnen" | "vleugelBuiten" | "vleugelBinnen";

const AFWATERING_KEUZE: { waarde: Afwatering; label: string }[] = [
  { waarde: "zichtbaar", label: "Zichtbare sleuven" },
  { waarde: "afdekkap", label: "Sleuven met afdekkap" },
  { waarde: "verdekt", label: "Verdekt — onderlangs" },
  { waarde: "geen", label: "Geen afwatering" },
];

/** Een compacte keuzelijst in de stijl van de balk. */
function Kies({
  label,
  waarde,
  onWijzig,
  children,
}: {
  label: string;
  waarde: string;
  onWijzig: (waarde: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="relative block min-w-0">
      <span className="mb-1 block text-[11px] uppercase tracking-editorial text-ink-soft">{label}</span>
      <select
        value={waarde}
        onChange={(e) => onWijzig(e.target.value)}
        className="w-full appearance-none truncate rounded-xl border border-sand bg-paper py-2.5 pl-3 pr-8 text-sm text-ink outline-none transition hover:border-ink-soft focus:border-rebu-green"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute bottom-3 right-2.5 h-3.5 w-3.5 text-ink-soft" />
    </label>
  );
}

export function Bovenbalk({ configuratie, profiel, wijzigAlle, aantalElementen }: Props) {
  const [open, setOpen] = useState<Veld | null>(null);

  const merken = [...new Map(PROFIELEN.map((p) => [p.merk, p])).values()];
  const systemen = [
    ...new Map(PROFIELEN.filter((p) => p.merk === profiel.merk).map((p) => [p.systeemId, p])).values(),
  ];
  const uitvoeringen = PROFIELEN.filter((p) => p.systeemId === profiel.systeemId);

  /** Van profiel wisselen kan de kleur ongeldig maken: folies zijn merkgebonden. */
  const kiesProfiel = (profielId: string) => {
    const nieuw = PROFIELEN.find((p) => p.id === profielId);
    if (!nieuw) return;
    const patch: Partial<Configuratie> = { profielId };
    if (nieuw.merk !== profiel.merk) {
      const wit = standaardKleur(nieuw.merk);
      patch.kleurBinnenId = wit.id;
      patch.kleurBuitenId = wit.id;
      patch.vleugelKleurBinnenId = null;
      patch.vleugelKleurBuitenId = null;
      if (
        configuratie.glas.glastypeId &&
        !nieuw.toegestaneGlastypes.includes(configuratie.glas.glastypeId)
      ) {
        patch.glas = { ...configuratie.glas, glastypeId: nieuw.toegestaneGlastypes[0] };
      }
    }
    wijzigAlle(patch);
  };

  const velden: Record<
    Veld,
    { label: string; kleurId: string | null; erftVan: { label: string; kleurId: string } | null; zet: (id: string | null) => void }
  > = {
    kaderBuiten: {
      label: "Kozijn buiten",
      kleurId: configuratie.kleurBuitenId,
      erftVan: null,
      zet: (id) => id && wijzigAlle({ kleurBuitenId: id }),
    },
    kaderBinnen: {
      label: "Kozijn binnen",
      kleurId: configuratie.kleurBinnenId,
      erftVan: null,
      zet: (id) => id && wijzigAlle({ kleurBinnenId: id }),
    },
    vleugelBuiten: {
      label: "Vleugel buiten",
      kleurId: configuratie.vleugelKleurBuitenId,
      erftVan: { label: "Kozijn buiten", kleurId: configuratie.kleurBuitenId },
      zet: (id) => wijzigAlle({ vleugelKleurBuitenId: id }),
    },
    vleugelBinnen: {
      label: "Vleugel binnen",
      kleurId: configuratie.vleugelKleurBinnenId,
      erftVan: { label: "Kozijn binnen", kleurId: configuratie.kleurBinnenId },
      zet: (id) => wijzigAlle({ vleugelKleurBinnenId: id }),
    },
  };

  const actief = open ? velden[open] : null;

  return (
    <div className="rounded-2xl border border-sand bg-paper p-4 shadow-soft">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-lg text-ink">Vaste gegevens</h2>
        <p className="text-xs text-ink-soft">
          Gelden voor {aantalElementen === 1 ? "dit kozijn" : `alle ${aantalElementen} kozijnen`} in deze
          order — een wijziging werkt overal door.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Kies label="Merk" waarde={profiel.merk} onWijzig={(merk) => kiesProfiel(merken.find((p) => p.merk === merk)!.id)}>
          {merken.map((p) => (
            <option key={p.merk} value={p.merk}>
              {p.merkLabel}
            </option>
          ))}
        </Kies>
        <Kies
          label="Profielsysteem"
          waarde={profiel.systeemId}
          onWijzig={(systeemId) =>
            kiesProfiel(
              (
                PROFIELEN.find((p) => p.systeemId === systeemId && p.uitvoering === profiel.uitvoering) ??
                PROFIELEN.find((p) => p.systeemId === systeemId)!
              ).id
            )
          }
        >
          {systemen.map((p) => (
            <option key={p.systeemId} value={p.systeemId}>
              {p.naam} · {p.inbouwdiepte.waarde} mm · Uf {p.uWaarde.waarde}
            </option>
          ))}
        </Kies>
        <Kies label="Uitvoering" waarde={profiel.id} onWijzig={kiesProfiel}>
          {uitvoeringen.map((p) => (
            <option key={p.id} value={p.id}>
              {p.uitvoeringLabel} · kozijn {p.geometrie.kozijnZichtbreedte.waarde} mm
            </option>
          ))}
        </Kies>
        <Kies
          label="Hoekverbinding"
          waarde={configuratie.hoekverbinding}
          onWijzig={(v) => wijzigAlle({ hoekverbinding: v as Configuratie["hoekverbinding"] })}
        >
          <option value="houtlook">Houtlook — haakse hoek</option>
          <option value="verstek">Verstek 45° — gelast</option>
        </Kies>
      </div>

      {/* De vier kleuren, elk met de folie zelf op de knop. */}
      <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {(Object.keys(velden) as Veld[]).map((veld) => (
          <KleurKnop
            key={veld}
            label={velden[veld].label}
            kleurId={velden[veld].kleurId}
            erftVan={velden[veld].erftVan}
            onOpen={() => setOpen(veld)}
          />
        ))}
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <Kies
          label="Glas"
          waarde={configuratie.glas.meegeleverd ? (configuratie.glas.glastypeId ?? "") : "geen"}
          onWijzig={(v) =>
            wijzigAlle(
              v === "geen"
                ? { glas: { ...configuratie.glas, meegeleverd: false } }
                : { glas: { ...configuratie.glas, meegeleverd: true, glastypeId: v } }
            )
          }
        >
          {GLASTYPES.filter((g) => profiel.toegestaneGlastypes.includes(g.id)).map((g) => (
            <option key={g.id} value={g.id}>
              {g.naam} · U {g.uWaarde}
            </option>
          ))}
          <option value="geen">Geen glas — wel de glasmaat</option>
        </Kies>
        <Kies
          label="Afstandshouder"
          waarde={configuratie.glas.afstandshouderId ?? "alu"}
          onWijzig={(v) => wijzigAlle({ glas: { ...configuratie.glas, afstandshouderId: v } })}
        >
          {AFSTANDSHOUDERS.map((a) => (
            <option key={a.id} value={a.id}>
              {a.naam}
              {a.warmEdge ? " · warm edge" : ""}
            </option>
          ))}
        </Kies>
        <Kies
          label="Afkitten"
          waarde={configuratie.afkitoptieId}
          onWijzig={(v) => wijzigAlle({ afkitoptieId: v })}
        >
          {AFKITOPTIES.map((a) => (
            <option key={a.id} value={a.id}>
              {a.naam}
            </option>
          ))}
        </Kies>
        <Kies
          label="Afwatering"
          waarde={configuratie.afwatering}
          onWijzig={(v) => wijzigAlle({ afwatering: v as Afwatering })}
        >
          {AFWATERING_KEUZE.map((a) => (
            <option key={a.waarde} value={a.waarde}>
              {a.label}
            </option>
          ))}
        </Kies>
      </div>

      {actief && (
        <KleurPopup
          open
          titel={actief.label}
          merk={profiel.merk}
          kleurId={actief.kleurId}
          erftVan={actief.erftVan}
          onKies={actief.zet}
          onSluiten={() => setOpen(null)}
        />
      )}
    </div>
  );
}
