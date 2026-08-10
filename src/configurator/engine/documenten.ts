/**
 * Documentgenerator (hoofdstuk 16 en 17 van het functioneel ontwerp).
 *
 * Regel 6: klantofferte en fabrieksorder zijn strikt gescheiden documenten uit
 * dezelfde configuratie-snapshot. Dat is hier afgedwongen door het type:
 *
 *   - `klantofferte()` krijgt een `Berekening` waarin de inkoopvelden `null`
 *     zijn en heeft geen enkele manier om ze alsnog op te halen.
 *   - `fabrieksorder()` eist expliciet een berekening mét inkoopprijs en werpt
 *     wanneer die ontbreekt, zodat er nooit een fabrieksorder zonder
 *     inkoopprijs naar productie gaat.
 *
 * Beide functies renderen naar HTML; de PDF ontstaat via de printfunctie van de
 * browser (HTML-to-PDF, hoofdstuk 12.4 en 23.4).
 */
import { euroTekst } from "./prijs";
import {
  AFWATERING,
  ROOSTERPOSITIE_LABEL,
  bijprofielOpId,
  krukOpId,
  AFWATERING_LABEL,
  STANDAARD_PANEEL,
  aantalAfwateringssleuven,
  paneeltypeOpId,
} from "../data/onderdelen";
import { genereerTekeningen } from "./tekening";
import { esc } from "./svg";
import {
  berekenStelmaat,
  cilindermaatTekst,
  glasmaatTekst,
  hormaatTekst,
  vullingsVakken,
} from "./maten";
import type { Berekening, Profiel } from "../types";

/**
 * De profielkaart van een uitvoering: de eigenschappen uit de fabrikantcatalogus
 * (PROFIELGEGEVENS-EKO4U.md) die naast de maatvoering op de kaart horen.
 *
 * De velden landen met het datamodel per uitvoering (T1) op `Profiel`; dit type
 * beschrijft wat de documenten ervan tonen. Ontbreekt de kaart op een profiel —
 * oudere data of een uitvoering zonder catalogusblad — dan laten de documenten
 * de rijen gewoon weg in plaats van lege waarden te tonen.
 */
export interface Profielkaart {
  /** Profielklasse volgens EN 12608, bijvoorbeeld "B". */
  profielklasse: string;
  /** Aantal afdichtingen in het systeem. */
  afdichtingen: number;
  /** Omschrijving van de staalversterking, bijvoorbeeld "standaard open staal 1,5 mm". */
  staal: string | null;
  /** Omschrijving van de anti-inbraakvoorziening van de vleugel. */
  antiInbraak: string | null;
}

/**
 * Leest de profielkaart van een uitvoering, tolerant voor profielen van vóór
 * het per-uitvoering-datamodel. Dit is bewust de enige plek die de cast doet.
 */
export function profielkaartVan(profiel: Profiel): Profielkaart | null {
  const kaart = (profiel as Profiel & { profielkaart?: Profielkaart }).profielkaart;
  return kaart ?? null;
}

export interface Aannemersbranding {
  bedrijfsnaam: string;
  /** Data-URI of publiek pad naar het logo. */
  logo: string | null;
  /** Accentkleur van de aannemer, als hex. */
  accentkleur: string;
  contactregel: string;
  /** Vaste inleidende tekst uit het eigen sjabloon. */
  inleiding: string;
  voorwaarden: string;
}

export const REBU_BRANDING: Aannemersbranding = {
  bedrijfsnaam: "Kunststofkozijnnodig.nl",
  logo: null,
  accentkleur: "#00a66e",
  contactregel: "info@kunststofkozijnnodig.nl",
  inleiding:
    "Hartelijk dank voor uw aanvraag. Hieronder vindt u de specificatie van de door u samengestelde kozijnen.",
  voorwaarden:
    "Op al onze aanbiedingen zijn onze algemene voorwaarden van toepassing. Deze offerte is 30 dagen geldig.",
};

export interface Documentgegevens {
  nummer: string;
  datum: string;
  klantnaam: string;
  projectadres: string;
  /** Leverweek zoals berekend in hoofdstuk 18.1. */
  leverweek: string;
}

/** Berekent een leverweek uit de orderdatum en het producttype (hoofdstuk 18.1). */
export function berekenLeverweek(vanaf: Date, berekening: Berekening): string {
  // Deuren en grote elementen kosten meer productietijd dan standaardramen.
  const basisweken = 6;
  const extra =
    (berekening.configuratie.kozijnType === "voordeur" ||
    berekening.configuratie.kozijnType === "achterdeur"
      ? 2
      : 0) + (berekening.kozijnOppervlakM2 > 4 ? 1 : 0);

  const lever = new Date(vanaf.getTime());
  lever.setDate(lever.getDate() + (basisweken + extra) * 7);

  // ISO-weeknummer.
  const d = new Date(Date.UTC(lever.getFullYear(), lever.getMonth(), lever.getDate()));
  const dag = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dag);
  const jaarStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - jaarStart.getTime()) / 86_400_000 + 1) / 7);
  return `week ${week} van ${d.getUTCFullYear()}`;
}

/** Gedeelde stijl voor beide documenttypes. */
function stylesheet(accent: string): string {
  return `
    :root { --accent: ${accent}; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
           color: #141917; font-size: 13px; line-height: 1.55; }
    .blad { max-width: 800px; margin: 0 auto; padding: 32px; }
    h1 { font-size: 24px; margin: 0 0 4px; letter-spacing: -0.01em; }
    h2 { font-size: 15px; margin: 28px 0 10px; padding-bottom: 6px;
         border-bottom: 1px solid #e4e0d6; }
    h3 { font-size: 13px; margin: 18px 0 6px; }
    .kop { display: flex; justify-content: space-between; align-items: flex-start;
           gap: 24px; border-bottom: 3px solid var(--accent); padding-bottom: 16px; }
    .kop .merk { font-size: 18px; font-weight: 650; color: var(--accent); }
    .meta { text-align: right; color: #565c58; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; margin: 8px 0 14px; }
    th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #efece4;
             vertical-align: top; }
    th { font-weight: 600; font-size: 11px; text-transform: uppercase;
         letter-spacing: 0.05em; color: #565c58; }
    td.getal, th.getal { text-align: right; white-space: nowrap; }
    .totaal td { border-bottom: none; border-top: 2px solid #141917; font-weight: 650; }
    .let-op { background: #fdf3f2; border-left: 3px solid #c0392b; padding: 8px 12px;
              margin: 10px 0; color: #8e2a1e; }
    .maat { background: #eef7f3; border-left: 3px solid var(--accent); padding: 8px 12px;
            margin: 10px 0; }
    .klein { font-size: 11px; color: #767b78; }
    .tekening { border: 1px solid #e4e0d6; padding: 12px; margin: 12px 0;
                page-break-inside: avoid; }
    .tekening svg { max-width: 100%; height: auto; display: block; }
    .tekening .titel { font-weight: 650; margin-bottom: 2px; }
    .raster { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    @media print {
      .blad { padding: 0; max-width: none; }
      h2 { page-break-after: avoid; }
    }
  `;
}

function documentHtml(titel: string, accent: string, body: string): string {
  return `<!doctype html><html lang="nl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titel)}</title><style>${stylesheet(accent)}</style></head>
<body><div class="blad">${body}</div></body></html>`;
}

/**
 * Een kleur voluit: code, naam, RAL en het oppervlak. De structuur hoort erbij —
 * dezelfde RAL bestaat met en zonder houtnerf, en dat zijn twee andere folies.
 */
function kleurTekst(kleur: Berekening["kleurBinnen"]): string {
  if (!kleur) return "—";
  const delen = [kleur.code, kleur.naam];
  if (kleur.ral) delen.push(kleur.ral);
  delen.push(kleur.structuur ?? "structuur niet vermeld");
  return delen.join(" · ");
}

/**
 * De stelmaat met de zijden erbij waar de aanslag is weggelaten. Wie de sparing
 * maakt moet weten waar het profiel vlak aansluit; dat staat dus in de tekst.
 */
function stelmaatTekst(b: Berekening): string {
  const maat = berekenStelmaat(b.configuratie, b.profiel);
  const a = b.profiel.geometrie.aanslag.waarde;
  const zonder = (Object.keys(b.configuratie.kozijnzijden) as (keyof Berekening["configuratie"]["kozijnzijden"])[])
    .filter((zijde) => !b.configuratie.kozijnzijden[zijde].aanslag);
  const zonderRubber = (Object.keys(b.configuratie.kozijnzijden) as (keyof Berekening["configuratie"]["kozijnzijden"])[])
    .filter((zijde) => b.configuratie.kozijnzijden[zijde].aanslag && !b.configuratie.kozijnzijden[zijde].rubber);

  const delen = [`${maat.breedte} × ${maat.hoogte} mm (aanslag ${a} mm)`];
  if (zonder.length > 0) delen.push(`zonder aanslag: ${zonder.join(", ")}`);
  if (zonderRubber.length > 0) delen.push(`zonder rubber: ${zonderRubber.join(", ")}`);
  return delen.join(" — ");
}

/**
 * De bediening per vleugel, als één regel. Alleen de vleugels die iets hebben
 * komen erin; een vast vak heeft niets te bedienen.
 */
function bediening(b: Berekening): string | null {
  const regels = b.vakken
    .filter((v) => v.krukBinnenId || v.krukBuitenId)
    .map((v) => {
      const binnen = krukOpId(v.krukBinnenId);
      const buiten = krukOpId(v.krukBuitenId);
      const delen = [
        binnen ? `binnen ${binnen.naam.toLowerCase()}` : null,
        buiten ? `buiten ${buiten.naam.toLowerCase()}` : null,
      ].filter(Boolean);
      return `${v.naam}: ${delen.join(", ")}`;
    });
  return regels.length > 0 ? regels.join(" · ") : null;
}

/** De bijprofielen per zijde, als één regel; leeg wanneer er geen zijn. */
function bijprofielTekst(b: Berekening): string | null {
  const delen = (["boven", "onder", "links", "rechts"] as const)
    .map((zijde) => {
      const bij = bijprofielOpId(b.configuratie.kozijnzijden[zijde].bijprofielId);
      return bij ? `${zijde}: ${bij.naam}` : null;
    })
    .filter(Boolean);
  return delen.length > 0 ? delen.join(" · ") : null;
}

/** Specificatieregels per kozijn — identiek van inhoud in beide documenten. */
function specificatieRijen(b: Berekening): string {
  const c = b.configuratie;
  const rijen: [string, string][] = [
    ["Profiel", `${b.profiel.merkLabel} ${b.profiel.naam} — ${b.profiel.uitvoeringLabel}`],
    ["Type", c.kozijnType],
    [
      "Buitenmaat",
      c.vorm === "schuin"
        ? `${c.breedte} × ${c.hoogteLaag}–${c.hoogte} mm (schuin)`
        : `${c.breedte} × ${c.hoogte} mm`,
    ],
    ["Kleur kozijn binnen", kleurTekst(b.kleurBinnen)],
    ["Kleur kozijn buiten", kleurTekst(b.kleurBuiten)],
    // De vleugelkleur staat er alleen wanneer hij afwijkt; anders is het ruis.
    ...(c.vleugelKleurBinnenId
      ? ([["Kleur vleugel binnen", kleurTekst(b.vleugelKleurBinnen)]] as [string, string][])
      : []),
    ...(c.vleugelKleurBuitenId
      ? ([["Kleur vleugel buiten", kleurTekst(b.vleugelKleurBuiten)]] as [string, string][])
      : []),
    ["Hoekverbinding", c.hoekverbinding === "verstek" ? "Verstek 45°" : "Houtlook (haaks)"],
    [
      "Borstwering",
      c.borstweringHoogte === 0
        ? "Op de vloer — letselveilig glas verplicht"
        : `${c.borstweringHoogte} mm vanaf de vloer${c.borstweringHoogte < 700 ? " — letselveilig glas verplicht" : ""}`,
    ],
    ...(c.glas.meegeleverd && b.afstandshouder
      ? ([
          [
            "Afstandshouder",
            `${b.afstandshouder.naam}${b.afstandshouder.warmEdge ? " (warm edge)" : ""}`,
          ],
        ] as [string, string][])
      : []),
    [
      "Afwatering",
      c.afwatering === "geen"
        ? AFWATERING_LABEL[c.afwatering]
        : `${AFWATERING_LABEL[c.afwatering]} — ${aantalAfwateringssleuven(c.breedte)} × ${AFWATERING.sleufBreedte.waarde} × ${AFWATERING.sleufHoogte.waarde} mm`,
    ],
    ...(b.vakken.some((v) => v.naarBuitenDraaiend)
      ? ([
          [
            "Draairichting",
            `Naar buiten draaiend: ${b.vakken
              .filter((v) => v.naarBuitenDraaiend)
              .map((v) => v.naam)
              .join(", ")}`,
          ],
        ] as [string, string][])
      : []),
    ...(b.muuraansluiting
      ? ([["Muuraansluiting", b.muuraansluiting.naam]] as [string, string][])
      : []),
    ...(b.afkitoptie ? ([["Afkitten", b.afkitoptie.naam]] as [string, string][]) : []),
    ...(bijprofielTekst(b) ? ([["Bijprofielen", bijprofielTekst(b) as string]] as [string, string][]) : []),
    ["Beslag", b.beslag ? `${b.beslag.naam} (${b.beslag.skg})` : "Niet meegeleverd"],
    // Per vleugel: waarmee hij opengaat, binnen en buiten.
    ...(bediening(b) ? ([["Bediening", bediening(b) as string]] as [string, string][]) : []),
    ...(b.vakken.some((v) => v.stapeldorpel)
      ? ([
          [
            "Stapeldorpel",
            b.vakken
              .filter((v) => v.stapeldorpel)
              .map((v) => v.naam)
              .join(", "),
          ],
        ] as [string, string][])
      : []),
    [
      "Ventilatierooster",
      b.vakken
        .filter((v) => v.roosterId)
        .map((v) => `${v.naam} (${ROOSTERPOSITIE_LABEL[v.roosterpositie]})`)
        .join(", ") || "Geen",
    ],
    ["Dorpel", b.dorpel ? b.dorpel.naam : "Geen"],
    ["Staalversterking", c.staalversterking || b.staalversterkingVerplicht ? "Ja" : "Nee"],
  ];
  return rijen
    .map(([label, waarde]) => `<tr><th>${esc(label)}</th><td>${esc(waarde)}</td></tr>`)
    .join("");
}

/**
 * De profielgegevens die per úítvoering verschillen — inbouwdiepte, kamers en
 * maximale glasdikte horen bij het gekozen profiel, niet bij het systeem
 * (PROFIELGEGEVENS-EKO4U.md). Eén bron voor alle drie de documenten, zodat de
 * klantofferte, de factuur en de fabrieksorder nooit uiteenlopen.
 */
function profielgegevensRijen(b: Berekening): string {
  const p = b.profiel;
  const rijen: [string, string][] = [
    ["Uitvoering", p.uitvoeringLabel],
    ["Inbouwdiepte", `${p.inbouwdiepte.waarde} mm — ${p.kamers.waarde} kamers`],
    ["Maximale glasdikte", `${p.maxGlasdikte.waarde} mm`],
    ["Uf-waarde", `${p.uWaarde.waarde} W/m²K`],
  ];

  const kaart = profielkaartVan(p);
  if (kaart) {
    rijen.push(["Profielklasse", `${kaart.profielklasse} — ${kaart.afdichtingen} afdichtingen`]);
    // Niet "Staalversterking": dat label is in de specificatie al de ja/nee-keuze
    // van dit kozijn; dit is wat de fabrikant standaard in het profiel legt.
    if (kaart.staal) rijen.push(["Staal in het profiel", kaart.staal]);
    if (kaart.antiInbraak) rijen.push(["Anti-inbraak", kaart.antiInbraak]);
  }

  return rijen
    .map(([label, waarde]) => `<tr><th>${esc(label)}</th><td>${esc(waarde)}</td></tr>`)
    .join("");
}

/**
 * De maatvoeringsblokken die in BEIDE documenten verplicht zijn (regel 2):
 * glasmaat, cilindermaat en hormaat, ook wanneer het product niet meegaat.
 */
function maatvoeringBlok(b: Berekening): string {
  // De vullingen: bij een vleugel met stijlen zijn dat de ruiten en panelen
  // daarbinnen, anders het vak zelf.
  const glasRijen = vullingsVakken(b.vakken)
    .map(
      (vak) =>
        `<tr><td>${esc(vak.naam)}</td><td>${esc(glasmaatTekst(vak, b.glastype, b.configuratie.glas.meegeleverd))}</td>
         <td>${esc(hormaatTekst(vak, b.hortype?.naam ?? null))}</td></tr>`
    )
    .join("");

  return `
    <h2>Maatvoering per vak</h2>
    <table>
      <thead><tr><th>Vak</th><th>Glas</th><th>Hor</th></tr></thead>
      <tbody>${glasRijen}</tbody>
    </table>
    <div class="maat"><strong>Cilinder:</strong> ${esc(
      cilindermaatTekst(b.cilindermaat, b.configuratie.beslag.cilinderMeegeleverd)
    )}</div>
    ${
      !b.configuratie.glas.meegeleverd || !b.configuratie.beslag.cilinderMeegeleverd || !b.vakken.every((v) => v.horMeegeleverd)
        ? `<div class="let-op"><strong>Let op — niet meegeleverd.</strong> Onderdelen die u zelf regelt staan hierboven mét de maat die u nodig heeft, zodat u ze los kunt bestellen zonder na te meten.</div>`
        : ""
    }`;
}

/** Welke paneeldiktes er in dit kozijn zitten — de fabriek bestelt daarop. */
function paneelOverzicht(b: Berekening): string {
  const panelen = vullingsVakken(b.vakken).filter((v) => v.vulsoort === "paneel");
  if (panelen.length === 0) return "geen";
  return panelen
    .map((v) => {
      const type = paneeltypeOpId(v.paneeltypeId) ?? STANDAARD_PANEEL;
      return `${v.naam}: ${type.naam} (${type.dikte} mm)`;
    })
    .join(" · ");
}

/** Bijlage met de hoofdtekening en alle verplichte detailtekeningen (regel 5). */
function tekeningenBijlage(b: Berekening): string {
  const tekeningen = genereerTekeningen(b);
  const blokken = tekeningen
    .map(
      (t) => `<div class="tekening">
        <div class="titel">${esc(t.titel)}</div>
        <div class="klein">${esc(t.omschrijving)} — ${esc(t.wanneerVerplicht)}</div>
        ${t.svg}
      </div>`
    )
    .join("");
  return `<h2>Bijlage — technische tekeningen</h2>${blokken}`;
}

// ---------------------------------------------------------------------------
// Klantofferte
// ---------------------------------------------------------------------------

export class KostprijsInKlantdocumentFout extends Error {
  constructor() {
    super(
      "Een klantofferte mag geen kostprijs bevatten. Genereer de berekening zonder 'toonKostprijs' (regel 6)."
    );
    this.name = "KostprijsInKlantdocumentFout";
  }
}

/**
 * De offerte voor de eindklant: sjabloon van de aannemer, verkoopprijs,
 * samenvattende techniek. Nooit inkoopprijzen (regel 6).
 */
export function klantofferte(
  b: Berekening,
  gegevens: Documentgegevens,
  branding: Aannemersbranding
): string {
  // Harde grens: een berekening mét inkoopprijs hoort niet in een klantdocument.
  if (b.prijs.kostprijsPerStuk !== null || b.prijs.kostprijsTotaal !== null) {
    throw new KostprijsInKlantdocumentFout();
  }

  const c = b.configuratie;
  const prijsKop = b.prijs.isRichtprijs ? "Richtprijs" : "Prijs";

  const body = `
    <div class="kop">
      <div>
        ${branding.logo ? `<img src="${esc(branding.logo)}" alt="" style="max-height:52px">` : ""}
        <div class="merk">${esc(branding.bedrijfsnaam)}</div>
        <div class="klein">${esc(branding.contactregel)}</div>
      </div>
      <div class="meta">
        <h1>Offerte</h1>
        <div>${esc(gegevens.nummer)}</div>
        <div>${esc(gegevens.datum)}</div>
      </div>
    </div>

    <h2>Gegevens</h2>
    <table>
      <tr><th>Klant</th><td>${esc(gegevens.klantnaam)}</td></tr>
      <tr><th>Projectadres</th><td>${esc(gegevens.projectadres)}</td></tr>
      <tr><th>Levertermijn</th><td>${esc(gegevens.leverweek)}</td></tr>
    </table>

    <p>${esc(branding.inleiding)}</p>

    <h2>${esc(c.naam)}</h2>
    <table>${specificatieRijen(b)}</table>

    <h2>Profielgegevens</h2>
    <table>${profielgegevensRijen(b)}</table>

    <table>
      <tr><th>Glas</th><td>${esc(
        c.glas.meegeleverd && b.glastype
          ? `${b.glastype.naam} (U = ${b.glastype.uWaarde} W/m²K)`
          : "Niet meegeleverd — u regelt het glas zelf"
      )}</td></tr>
      <tr><th>Hor</th><td>${esc(
        b.vakken.some((v) => v.horMeegeleverd) && b.hortype ? b.hortype.naam : "Niet meegeleverd"
      )}</td></tr>
      <tr><th>Cilinder</th><td>${esc(
        c.beslag.cilinderMeegeleverd ? "Meegeleverd" : "Niet meegeleverd — u regelt de cilinder zelf"
      )}</td></tr>
    </table>

    ${maatvoeringBlok(b)}

    <h2>${esc(prijsKop)}</h2>
    <table>
      <thead><tr><th>Omschrijving</th><th class="getal">Aantal</th><th class="getal">Per stuk</th><th class="getal">Totaal</th></tr></thead>
      <tbody>
        <tr>
          <td>${esc(c.naam)} — ${esc(b.profiel.merkLabel)} ${esc(b.profiel.naam)}</td>
          <td class="getal">${c.aantal}</td>
          <td class="getal">${euroTekst(b.prijs.klantprijsPerStuk)}</td>
          <td class="getal">${euroTekst(b.prijs.klantprijsTotaal)}</td>
        </tr>
        <tr><td colspan="3">Btw ${b.prijs.btwPercentage}%</td><td class="getal">${euroTekst(b.prijs.btwBedrag)}</td></tr>
        <tr class="totaal"><td colspan="3">Totaal inclusief btw</td><td class="getal">${euroTekst(
          b.prijs.klantprijsTotaalInclBtw
        )}</td></tr>
      </tbody>
    </table>
    ${
      b.prijs.isRichtprijs
        ? `<div class="klein">Dit is een richtprijs op basis van uw configuratie. De definitieve prijs volgt na controle van de maatvoering op locatie.</div>`
        : ""
    }

    <h2>Voorwaarden</h2>
    <p class="klein">${esc(branding.voorwaarden)}</p>
    <p class="klein">Geldigheid: 30 dagen na ${esc(gegevens.datum)}. Levertermijn: ${esc(gegevens.leverweek)}.</p>

    ${tekeningenBijlage(b)}
  `;

  return documentHtml(`Offerte ${gegevens.nummer}`, branding.accentkleur, body);
}

// ---------------------------------------------------------------------------
// Fabrieksorder
// ---------------------------------------------------------------------------

export class FabrieksorderZonderKostprijsFout extends Error {
  constructor() {
    super(
      "Een fabrieksorder moet de kostprijs bevatten. Genereer de berekening met 'toonKostprijs: true' (regel 6)."
    );
    this.name = "FabrieksorderZonderKostprijsFout";
  }
}

/**
 * Het order richting productie: Rebu-huisstijl, puur technisch, mét inkoopprijs
 * en de volledige specificatie. Nooit de verkoopprijs van de aannemer (regel 6).
 */
export function fabrieksorder(b: Berekening, gegevens: Documentgegevens): string {
  if (b.prijs.kostprijsPerStuk === null) throw new FabrieksorderZonderKostprijsFout();

  const c = b.configuratie;

  const vakRijen = vullingsVakken(b.vakken)
    .map(
      (vak) => `<tr>
        <td>${esc(vak.naam)}</td>
        <td>${esc(vak.invulling)}${vak.draairichting === "geen" ? "" : ` / ${esc(vak.draairichting)}`}</td>
        <td class="getal">${vak.sponningBreedte} × ${vak.sponningHoogte}</td>
        <td class="getal">${vak.vleugelBreedte} × ${vak.vleugelHoogte}</td>
        <td class="getal">${vak.daglichtBreedte} × ${vak.daglichtHoogte}</td>
        <td class="getal"><strong>${vak.glasBreedte} × ${vak.glasHoogte}</strong></td>
        <td class="getal">${vak.horBreedte} × ${vak.horHoogte}</td>
        <td class="getal">${vak.glasGewichtKg ?? "—"}</td>
      </tr>`
    )
    .join("");

  const inkoopRijen = b.prijs.regels
    .map((r) => `<tr><td>${esc(r.omschrijving)}</td><td class="getal">${euroTekst(r.bedrag)}</td></tr>`)
    .join("");

  const body = `
    <div class="kop">
      <div>
        <div class="merk">Rebu Kozijnen — Fabrieksorder</div>
        <div class="klein">Interne productieopdracht — niet voor de eindklant</div>
      </div>
      <div class="meta">
        <h1>${esc(gegevens.nummer)}</h1>
        <div>${esc(gegevens.datum)}</div>
        <div>Leverweek: ${esc(gegevens.leverweek)}</div>
      </div>
    </div>

    <h2>Order</h2>
    <table>
      <tr><th>Opdrachtgever</th><td>${esc(gegevens.klantnaam)}</td></tr>
      <tr><th>Projectadres</th><td>${esc(gegevens.projectadres)}</td></tr>
      <tr><th>Aantal</th><td>${c.aantal} × ${esc(c.naam)}</td></tr>
    </table>

    <h2>Profiel en uitvoering</h2>
    <table>${specificatieRijen(b)}</table>
    <table>
      ${profielgegevensRijen(b)}
      <tr><th>Aanslag</th><td>${b.profiel.geometrie.aanslag.waarde} mm</td></tr>
      <tr><th>Zichtbreedte kozijn / vleugel</th><td>${b.profiel.geometrie.kozijnZichtbreedte.waarde} / ${b.profiel.geometrie.vleugelZichtbreedte.waarde} mm, vleugeloverslag ${b.profiel.geometrie.vleugelOverslag.waarde} mm</td></tr>
      <tr><th>Glasaftrek per zijde</th><td>${b.profiel.geometrie.kozijnZichtbreedte.waarde} mm bij vast glas, ${
        b.profiel.geometrie.kozijnZichtbreedte.waarde +
        b.profiel.geometrie.vleugelZichtbreedte.waarde -
        b.profiel.geometrie.vleugelOverslag.waarde
      } mm bij een vleugel</td></tr>
      <tr><th>Glasinleg</th><td>${b.profiel.geometrie.glasinleg.waarde} mm per zijde</td></tr>
      <tr><th>Stelmaat</th><td>${esc(stelmaatTekst(b))}</td></tr>
      <tr><th>Vleugeldikte</th><td>${b.profiel.vleugeldikte.waarde} mm</td></tr>
      <tr><th>Kleurcode binnen</th><td>${esc(
        b.kleurBinnen
          ? `${kleurTekst(b.kleurBinnen)}${b.kleurBinnen.leverancierscode ? ` — lev. ${b.kleurBinnen.leverancierscode}` : ""}`
          : "—"
      )}</td></tr>
      <tr><th>Kleurcode buiten</th><td>${esc(
        b.kleurBuiten
          ? `${kleurTekst(b.kleurBuiten)}${b.kleurBuiten.leverancierscode ? ` — lev. ${b.kleurBuiten.leverancierscode}` : ""}`
          : "—"
      )}</td></tr>
    </table>

    <h2>Vakken en maatvoering</h2>
    <table>
      <thead><tr>
        <th>Vak</th><th>Invulling</th><th class="getal">Sponning</th><th class="getal">Vleugel</th>
        <th class="getal">Daglicht</th><th class="getal">Glasmaat</th><th class="getal">Hormaat</th><th class="getal">kg</th>
      </tr></thead>
      <tbody>${vakRijen}</tbody>
    </table>

    <h2>Glas, cilinder en hor</h2>
    <table>
      <tr><th>Glas meegeleverd</th><td>${c.glas.meegeleverd ? "JA" : "NEE"}</td></tr>
      <tr><th>Glastype</th><td>${esc(b.glastype ? `${b.glastype.naam} — ${b.glastype.dikte} mm` : "n.v.t.")}</td></tr>
      <tr><th>Cilinder meegeleverd</th><td>${c.beslag.cilinderMeegeleverd ? "JA" : "NEE"}</td></tr>
      <tr><th>Cilindermaat</th><td><strong>${esc(b.cilindermaat.notatie)} mm</strong> (${esc(
        b.cilindermaat.skgAdvies
      )}${b.cilindermaat.gebaseerdOpFabrieksstandaard ? ", fabrieksstandaard rozet" : ""})</td></tr>
      <tr><th>Hor meegeleverd</th><td>${b.vakken.some((v) => v.horMeegeleverd) ? "JA" : "NEE"}</td></tr>
      <tr><th>Hortype</th><td>${esc(b.hortype ? b.hortype.naam : "n.v.t.")}</td></tr>
      <tr><th>Panelen</th><td>${esc(paneelOverzicht(b))}</td></tr>
      <tr><th>Totaal glasoppervlak</th><td>${b.totaalGlasOppervlakM2} m²</td></tr>
      <tr><th>Totaal glasgewicht</th><td>${b.totaalGlasGewichtKg ?? "—"} kg</td></tr>
    </table>

    <h2>Kostprijs voor Rebu</h2>
    <table>
      <thead><tr><th>Onderdeel</th><th class="getal">Bedrag</th></tr></thead>
      <tbody>
        ${inkoopRijen}
        <tr class="totaal"><td>Kostprijs per stuk</td><td class="getal">${euroTekst(b.prijs.kostprijsPerStuk)}</td></tr>
        <tr class="totaal"><td>Kostprijs totaal (${c.aantal}×)</td><td class="getal">${euroTekst(
          b.prijs.kostprijsTotaal ?? 0
        )}</td></tr>
      </tbody>
    </table>
    <div class="klein">Verkoopprijzen richting de eindklant staan bewust niet in dit document (regel 6).</div>

    ${tekeningenBijlage(b)}
  `;

  return documentHtml(`Fabrieksorder ${gegevens.nummer}`, "#141917", body);
}

// ---------------------------------------------------------------------------
// Onze factuur aan de aannemer
// ---------------------------------------------------------------------------

export class FactuurZonderAannemersprijsFout extends Error {
  constructor() {
    super(
      "Een factuur aan de aannemer vereist de aannemersprijs. Reken door met context 'aannemer'."
    );
    this.name = "FactuurZonderAannemersprijsFout";
  }
}

/**
 * De factuur van Rebu aan de aannemer — het tweede prijsniveau.
 *
 * Dit is wat de aannemer aan ons betaalt: onze kostprijs plus onze marge. Het
 * document draagt de huisstijl van Rebu; de klantofferte doet dat juist niet,
 * want die gaat white-label naar de eindklant van de aannemer.
 *
 * De kostprijs van Rebu staat hier bewust NIET in: de aannemer hoort te zien
 * wat hij betaalt, niet wat wij inkopen.
 */
export function rebuFactuur(b: Berekening, gegevens: Documentgegevens): string {
  if (b.prijs.aannemersprijsPerStuk === null || b.prijs.aannemersprijsTotaal === null) {
    throw new FactuurZonderAannemersprijsFout();
  }
  if (b.prijs.kostprijsPerStuk !== null) {
    // Zou de kostprijs meeliften, dan zou de aannemer onze inkoop zien.
    throw new KostprijsInKlantdocumentFout();
  }

  const c = b.configuratie;

  const body = `
    <div class="kop">
      <div>
        <div class="merk">Kunststofkozijnnodig.nl</div>
        <div class="klein">Factuur aan de aannemer · info@kunststofkozijnnodig.nl</div>
      </div>
      <div class="meta">
        <h1>Factuur</h1>
        <div>${esc(gegevens.nummer)}</div>
        <div>${esc(gegevens.datum)}</div>
        <div>Leverweek: ${esc(gegevens.leverweek)}</div>
      </div>
    </div>

    <h2>Gegevens</h2>
    <table>
      <tr><th>Aannemer</th><td>${esc(gegevens.klantnaam)}</td></tr>
      <tr><th>Projectadres</th><td>${esc(gegevens.projectadres)}</td></tr>
      <tr><th>Betalingstermijn</th><td>30 dagen</td></tr>
    </table>

    <h2>${esc(c.naam)}</h2>
    <table>${specificatieRijen(b)}</table>

    <h2>Profielgegevens</h2>
    <table>${profielgegevensRijen(b)}</table>

    ${maatvoeringBlok(b)}

    <h2>Te betalen</h2>
    <table>
      <thead><tr><th>Omschrijving</th><th class="getal">Aantal</th><th class="getal">Per stuk</th><th class="getal">Totaal</th></tr></thead>
      <tbody>
        <tr>
          <td>${esc(c.naam)} — ${esc(b.profiel.merkLabel)} ${esc(b.profiel.naam)}</td>
          <td class="getal">${c.aantal}</td>
          <td class="getal">${euroTekst(b.prijs.aannemersprijsPerStuk)}</td>
          <td class="getal">${euroTekst(b.prijs.aannemersprijsTotaal)}</td>
        </tr>
        <tr><td colspan="3">Btw ${b.prijs.btwPercentage}%</td><td class="getal">${euroTekst(
          b.prijs.aannemersprijsBtw ?? 0
        )}</td></tr>
        <tr class="totaal"><td colspan="3">Totaal inclusief btw</td><td class="getal">${euroTekst(
          b.prijs.aannemersprijsTotaalInclBtw ?? 0
        )}</td></tr>
      </tbody>
    </table>
    <div class="klein">
      Dit is uw inkoopprijs bij Kunststofkozijnnodig.nl. Wat u uw eigen klant berekent staat in de
      white-label offerte — die draagt uitsluitend uw eigen logo en huisstijl.
    </div>

    ${tekeningenBijlage(b)}
  `;

  return documentHtml(`Factuur ${gegevens.nummer}`, "#00a66e", body);
}

// ---------------------------------------------------------------------------
// Meerdere kozijnen in één document
// ---------------------------------------------------------------------------

/**
 * Voegt losse documenten samen tot één blad.
 *
 * Een offerte gaat zelden over één kozijn. In plaats van elk kozijn een eigen
 * bestand te geven worden de bladen achter elkaar gezet, met een paginaovergang
 * ertussen — zoals je ze ook zou uitprinten. Elk kozijn blijft daarmee exact het
 * document dat de generator ervoor maakte; er wordt niets herrekend (regel 1).
 */
export function bundelDocumenten(documenten: string[], titel: string): string {
  if (documenten.length === 0) {
    return documentHtml(titel, "#00a66e", `<p>Deze offerte bevat nog geen kozijnen.</p>`);
  }
  if (documenten.length === 1) return documenten[0];

  const bladen = documenten.map((html) => {
    // Alleen de inhoud van het blad overnemen; kop en stijl komen van het eerste.
    const begin = html.indexOf('<div class="blad">');
    const eind = html.lastIndexOf("</div></body>");
    if (begin === -1 || eind === -1) return html;
    return html.slice(begin, eind + "</div>".length);
  });

  const stijlBegin = documenten[0].indexOf("<style>");
  const stijlEind = documenten[0].indexOf("</style>");
  const stijl =
    stijlBegin === -1 || stijlEind === -1
      ? ""
      : documenten[0].slice(stijlBegin + "<style>".length, stijlEind);

  return `<!doctype html><html lang="nl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titel)}</title><style>${stijl}
.blad + .blad { border-top: 1px dashed #c9c4b7; margin-top: 24px; padding-top: 24px; }
@media print { .blad + .blad { page-break-before: always; border-top: none; margin-top: 0; } }
</style></head><body>${bladen.join("")}</body></html>`;
}
