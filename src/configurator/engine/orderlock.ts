/**
 * Order-lock: de laatste controle vóór productie (hoofdstuk 18.2).
 *
 * Dit is borgingslaag 6 uit hoofdstuk 24. Faalt één controle, dan kan de order
 * niet bevestigd worden. De checklist is bewust niet configureerbaar: hij is de
 * harde grens tussen 'geconfigureerd' en 'wordt geproduceerd'.
 */
import { genereerTekeningen, verplichteDetails } from "./tekening";
import { alleVakken } from "./maten";
import type { Berekening } from "../types";

export interface Controle {
  id: string;
  omschrijving: string;
  geslaagd: boolean;
  /** Wat er mis is, alleen gevuld wanneer de controle faalt. */
  toelichting: string | null;
}

export interface OrderLockResultaat {
  controles: Controle[];
  /** Mag de order bevestigd worden? */
  magBevestigen: boolean;
  gefaald: Controle[];
}

/**
 * Draait de volledige eindcontrole.
 *
 * `marge` is het margebedrag in centen dat op deze order gemaakt wordt. In de
 * publieke context is er geen aannemersmarge; dan wordt die controle overgeslagen
 * omdat hij niet van toepassing is.
 */
export function orderLock(b: Berekening): OrderLockResultaat {
  const controles: Controle[] = [];

  const voegToe = (id: string, omschrijving: string, geslaagd: boolean, toelichting: string | null) => {
    controles.push({ id, omschrijving, geslaagd, toelichting: geslaagd ? null : toelichting });
  };

  // 1 — Alle maten binnen de toegestane toleranties.
  const blokkades = b.bevindingen.filter((x) => x.type === "blokkade");
  voegToe(
    "maten-binnen-tolerantie",
    "Alle maten binnen de toegestane grenzen",
    blokkades.length === 0,
    blokkades.length === 0
      ? null
      : `${blokkades.length} blokkerende bevinding(en): ${blokkades.map((x) => x.kop).join("; ")}`
  );

  // 2 — Glasmaat, cilindermaat en hormaat aanwezig voor élk vak (regel 2).
  const ontbrekend: string[] = [];
  // Ook de vullingen bínnen een vleugel: elke ruit en elk paneel moet een maat
  // hebben, anders kan de fabriek het niet maken.
  for (const vak of alleVakken(b.vakken)) {
    if (!(vak.glasBreedte > 0) || !(vak.glasHoogte > 0)) ontbrekend.push(`glasmaat in '${vak.naam}'`);
    if (!(vak.horBreedte > 0) || !(vak.horHoogte > 0)) ontbrekend.push(`hormaat in '${vak.naam}'`);
  }
  if (!(b.cilindermaat.binnen > 0) || !(b.cilindermaat.buiten > 0)) ontbrekend.push("cilindermaat");
  voegToe(
    "afgeleide-maten-compleet",
    "Glasmaat, cilindermaat en hormaat aanwezig voor elk vak",
    ontbrekend.length === 0,
    ontbrekend.length === 0 ? null : `Ontbreekt: ${ontbrekend.join(", ")}`
  );

  // 3 — Kleurcombinatie geldig voor het gekozen profiel.
  const kleurGeldig =
    b.kleurBinnen !== null &&
    b.kleurBuiten !== null &&
    b.kleurBinnen.merk === b.profiel.merk &&
    b.kleurBuiten.merk === b.profiel.merk;
  voegToe(
    "kleur-geldig",
    "Kleurencombinatie geldig voor het gekozen profiel",
    kleurGeldig,
    kleurGeldig ? null : "Binnen- of buitenkleur ontbreekt of hoort bij een ander merk dan het profiel."
  );

  // 4 — Marge groter dan nul en conform de ingestelde regels.
  if (b.prijs.context === "publiek") {
    voegToe(
      "marge-positief",
      "Marge conform de ingestelde regels",
      true,
      null
    );
  } else {
    const margeOk = (b.prijs.aannemersmargePercentage ?? 0) > 0 && b.prijs.klantprijsTotaal > 0;
    voegToe(
      "marge-positief",
      "Marge groter dan nul",
      margeOk,
      margeOk ? null : `De marge is ${b.prijs.aannemersmargePercentage ?? 0}% — een order zonder marge wordt niet bevestigd.`
    );
  }

  // 5 — Alle verplichte documenten aanwezig.
  let tekeningenOk = false;
  let tekeningToelichting: string | null = "De tekeningen konden niet gegenereerd worden.";
  try {
    const tekeningen = genereerTekeningen(b);
    const gegenereerd = new Set(tekeningen.map((t) => t.id));
    const missend = verplichteDetails(b).filter((code) => !gegenereerd.has(code));
    tekeningenOk = gegenereerd.has("hoofd") && missend.length === 0;
    tekeningToelichting = tekeningenOk ? null : `Ontbrekende detailtekeningen: ${missend.join(", ")}`;
  } catch (fout) {
    tekeningToelichting = fout instanceof Error ? fout.message : String(fout);
  }
  voegToe(
    "documenten-compleet",
    "Hoofdtekening en alle verplichte detailtekeningen aanwezig",
    tekeningenOk,
    tekeningToelichting
  );

  // 6 — Aantal en benoeming, zodat de stuklijst herleidbaar blijft.
  const naamOk = b.configuratie.naam.trim().length > 0;
  voegToe(
    "naam-ingevuld",
    "Elk kozijn heeft een herkenbare naam",
    naamOk,
    naamOk ? null : "Geef het kozijn een naam, bijvoorbeeld 'Achtergevel raam 2'."
  );

  const gefaald = controles.filter((c) => !c.geslaagd);
  return { controles, gefaald, magBevestigen: gefaald.length === 0 };
}
